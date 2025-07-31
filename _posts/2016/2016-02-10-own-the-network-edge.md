---
layout: blog/post
title: Own the Network Edge
category: Architecture
tags:
- Intrastructure
- Devops
- Routing
---
It's 5:30PM, the phone rings with a last minute request to repoint a domain somwhere. "Uhh, sorry, that's going to take at least 24hrs from the minute I change the record, but the domains team have already gone home for the day, and I don't have access".

Far fetched? Perhaps. But I've had similar things happen to me. I've come to the conclusion that as engineers we should endeavour to keep domain routing in software that we own, at our network edge. The flow should work something like this.

- Register domain
- Point domain at network edge
- ???
- Profit! 

This means we can do all sorts of fancy things with our applications. Say, for example, we had a massive monolithic Rails application, that had far too many things baked into it, and we started to pull it apart. How would we do that? 

Well with control over the network edge, we can get the router to inspect the request, match and forward it to the correct service. As our first move, we'd tease out the event booking system into another application, with some shared chrome, so that they look and feel similar. But we'd now make sure we routed our requests based on the URL fragment. Anything matching `/events/*` would be routed to the Events application, while our monolithic application would continue to serve everything else. Session management can be handled with a custom HTTP header, making the backing apps stateless.

One of the benefits to this aproach is that not only can we do hot repointing of our domains to the apps that back them, which is especially useful in a containerized world. We can also do split testing, traffic reflection for load testing, live routing of staging environments, and roll back routing changes immediately if some application isn't performing as it should.

Sure there's an infrastructure, and a slight slowdown of the request, but the flexibility this affords us, in my opinion is well worth that trade off.
