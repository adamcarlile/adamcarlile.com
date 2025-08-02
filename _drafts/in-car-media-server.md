---
title: "Custom In-Car Media Server Pt.1"
subtitle: "Designing the solution"
category: Architecture
tags:
- Family
- Media
- Automotive
layout: blog/post
---
We love going on road trips, however the kids in the back don't always feel the same way. Travelling anywhere over a couple of hours becomes tricky as there's only so much colouring they want to do! They've also become very acustom to steaming services.

While streaming services work great at home, they're not always reliable on the road. Poor mobile coverage, data caps, and battery drain can turn a peaceful trip into a littany of "Are we there yet?" complaints. I decided to build a custom in-car media server that would work reliably, offline, and keep the whole family happy.

## Streaming Isn't Always the Answer

These days, we've become so used to having vast media libraries available at our fingertips, gone are the days of watching whatever was broadcast, or hunting for that specific VHS tape (that inevitably someone put back in the wrong box). The minute we pull out of the driveway, and away from the safety of a wireless network, relatity sets in.

- **Inconsistent connectivity**: Mobile phone networks in the UK can be pretty spotty, and more so the more rural you go. With radically different data rates between them.
- **Data costs**: Streaming HD video for hours can quickly burn through your monthly data allowance
- **Content availability**: Not all shows are available for offline download, and ensuring that you've downloaded the correct show before a road trip is laborious and slow.

What I needed was a self-contained, always-available media server that could host a subset of our digital library, with a mobile cellular connection as a backup.

## Finding the Right Hardware

The major consideration is power. We own a 2018 VW Tiguan, which, handily has a 12v outlet in the boot. However the maxium draw from that outlet is around 300 watts. 

It's 

### Why Raspberry Pi 4?

### Alternative Considerations

## Storage Strategy: Balancing Capacity and Reliability

### Primary Storage Solution

### File Organization

