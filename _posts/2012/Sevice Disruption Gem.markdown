---
title: Hello service_disruption gem
publish_date: 30/04/2012 22:12PM
header_image: https://dl.dropboxusercontent.com/u/9038520/cloudpress/lpvTvPm.jpg
tags:
- Ruby
- Tfl
- Tube
- London
- Gem
- Growl
- OSX
---
Well over the past few weeks I've been working on a little gem that makes it
easy to get notifications when the [Tube](http://tfl.gov.uk) status changes.
As a byproduct it also gives easy access to the tube data as ruby objects too
:)

Previously you'd have to actively check the TFL website, or sign up for the
[TFL Alerts ](http://alerts.tfl.gov.uk)programme, which sends you text alerts.

However service_disruption polls the TFL Data feed for changes, and if there
are changes it will alert you using Growl.

So in order to get this to work you'll need

  * Ruby 1.8.7 / 1.9.3 / 2.0.0
  * [Growl](http://growl.info/downloads)
  * Apple Mac

[Installation instructions](https://github.com/Frozenproduce/service_disruption) are
available at the projects [github repo](https://github.com/Frozenproduce/service_disruption)

As always any feedback would be great, and suggestions for improvements.
