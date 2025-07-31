---
title: Kubernetes, Rails, AWS ELB, Nginx and header forwarding
category: Software
tags:
- Infrastructure
- Kubernetes
- AWS
- ELB
- Nginx
- Rails
- TLS
layout: blog/post
---
At Soho House we're currently running several Rails apps, with single sign on authentication powered by OAuth2, and a drop in piece of rack middleware called `bouncer` that standardizes our session management across all of our newer applications. Additionally we're also moving a lot of those apps into Docker containers for deployment on Kubernetes, meaning a web request ends up traveling up through several reverse proxy layers.

## Problem

During user testing we started getting a some very odd behavior during the authentication callback, OmniAuth would build the callback url, based on the logic in `Rack::Request`. The result was the callback url would have port `80` added to the hostname, but have the protocol set as `https`.

With a bit of work we tracked down the url building issue to `Rack::Request`, specifically `base_url`.

```ruby
def base_url
  url = "#{scheme}://#{host}"
  url << ":#{port}" if port != DEFAULT_PORTS[scheme]
  url
end
```

The url builder grabs the scheme from the `X-Forwarded-Proto` header, which in our case was set to `https` and then attaches the host, which in our case ultimately came from `X-Forwarded-Host`, and then finally we attach the port if we're using a non-standard port for the scheme, which according to the `X-Forwarded-Port` header, we were.

The route the request ended up taking into the cluster was as follows:

```
                            Internet
                                |
                                v
                        AWS L7 Load Balancer
                                |
                                v
                        K8S Ingress Controller
                                |
                                v
                          K8S Endpoints API
                                |
                                v
                            Rails App
```

At some point in the above chain the `X-Forwarded-Port` was being dropped. Since the expected port should have been `443`

## Solution

The only piece in the chain that we really have any control over is the Kubernetes Ingress Controller, which is essentially an Nginx deployment, which routes requests to backends based on the url. The documentation on the Kubernetes website has a [sample Nginx configuration](https://github.com/kubernetes/ingress/tree/master/controllers/nginx). However in it's default state it appears that the `X-Forwarded-Port` was being defaulted to the port that the server is bound on, in this case, `80`.

```nginx
proxy_set_header X-Forwarded-For        $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Host       $host;
proxy_set_header X-Forwarded-Port       $server_port;
# This one ^^
proxy_set_header X-Forwarded-Proto      $pass_access_scheme;
```

I assume the intention for this, is that the ingress controller should be responsible for TLS offloading, however since we offload at the ELB on our network edge the server is bound on port `80`, passing on the mismatched headers upstream to our application servers.

The fix was to ensure that if the header is set, that we should honour it and pass it up.

```nginx
proxy_set_header X-Forwarded-Port       $proxy_x_forwarded_port;

# Try and grab the port number from the forwarded port header
map $http_x_forwarded_port $proxy_x_forwarded_port {
  default $http_x_forwarded_port;
  ''      $server_port;
}
```

Hopefully that saves someone a few hours of head scratching!
