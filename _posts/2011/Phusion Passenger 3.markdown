---
title: Phusion Passenger 3
publish_date: 01/03/2011 17:43PM
tags:
- Ruby
- Rails
- Ruby on Rails
- Passenger
- Code
- Programming
---
I have recently upgraded my slicehost box to Ubuntu 10.04 LTS, and upgraded
the Passenger version to 3, the difference in performance is incredible, at
least a 20% decrease in response times.

However the big great news is the inclusion of a new Apache directive,

`PassengerMinInstances`

Previously passenger would spool down all of the running instances of an app
if it was idle for too long, you could override this behaviour by setting
PassengerPoolIdleTime to 0, however this would mean that spawned instances
would never spin down, utilising the server even if it was getting no traffic,
however on the flip side it meant that application initial load times were
kept to a minimum

The new directive allows Passenger to load the Rails framework into memory on
the first application hit, and because all the processes will not spin down
after that no matter how long between requests the page load will be near
instantaneous

For me this was the only thing that made Passenger an issue, and clients often
complained about the long load times, however with Passenger 3 this load time
is negated to the first time the app is loaded after an Apache restart

If you haven't already I recommend that you upgrade all of your existing
Passenger implementations to version 3
