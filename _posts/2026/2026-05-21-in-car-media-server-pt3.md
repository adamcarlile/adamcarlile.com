---
title: "In-Car Media Server Pt.3"
subtitle: "Keeping the Library Stocked"
category: Architecture
tags:
- Family
- Media
- Automotive
- Projects
- Go
layout: blog/post
excerpt: Parts one and two built the box. Part three is about the chore that turned up afterwards, keeping it stocked, and the little Go app I wrote to make it go away.
---
{% include acronyms.md %}

At the end of [part two]({% post_url 2025/2025-09-08-in-car-meda-server-pt2 %}) I signed off with a promise: take the carnet out on a proper trip, see what breaks, and report back. We did exactly that. It came along on the long drive down through France and into Italy last summer, and it earned its keep. The kids in the back were fed a steady diet of films and TV, there was no buffering wheel, and a noticeable drop in the number of times I had to explain packet loss to a small and unsympathetic audience.

So the hardware works and the software works. But "it works" has a tail, and the tail is the bit nobody photographs: **keeping the thing stocked**.

> [!TIP]
> TL;DR: the manual `rsync` dance got old, so I wrote **roadie**, a small Go web app that runs on the carnet and turns "load up the car" into ticking boxes in a browser. It's open source: [github.com/adamcarlile/roadie](https://github.com/adamcarlile/roadie).

## The Chore

Every trip started the same way. The night before, once the kids were down, I'd `ssh` into the carnet from the sofa and begin the dance.

The media library lives on the NAS at home, exposed over NFS, and the carnet auto-mounts it when it's on the home network, something we set up with AutoFS back in [part two]({% post_url 2025/2025-09-08-in-car-meda-server-pt2 %}). So the raw materials are all there under `/nfs`. The job is "just" to copy the right things onto the external drive.

```bash
rsync -rtvh --progress "/nfs/films/Movies/Peter Rabbit (2013)" "/media/external/Media/Kids Movies/"
```

Multiply that by a dozen films and a few series, every one hand-typed, every space and bracket escaped, and the problem comes into focus. Worse, the library on disk isn't tidy. Kids' **TV** lives under `/nfs/media/Kids`, but kids' **films** are a subset of `/nfs/films/Movies`, the same folder as the grown-up films, with no separation on disk at all. So "copy the kids' stuff" was never one command; it was a mental filter I had to run, correctly, every single time, at eleven o'clock at night, hoping I'd remember that Paddington goes one place and Bluey goes another.

I wrote this in [part one]({% post_url 2025/2025-08-02-in-car-media-server-pt1 %}), before I'd even bought the hardware:

> ensuring that you've downloaded the correct show before a road trip is laborious and slow

It turns out I'd just moved the laboriousness around rather than removed it. The streaming services used to make me hunt; now my own NAS made me hunt instead.

## What I Actually Wanted

A few things, really.

First, I wanted it to be **declarative**. In part two I leaned on Netplan for the network specifically because it's declarative: you write down the state you want, it works out how to get there, and it validates the whole thing before applying it. I wanted that same feeling for media: a written-down list of what *should* be on the carnet, rather than a sequence of imperative copy commands I have to get right, in order, by hand.

Second, I wanted a **web UI**. The carnet already serves web interfaces; Jellyfin's whole front end is a browser tab. Browsing a media library is a visual job, and a file browser is a far nicer way to pick "these twelve films" than `ls` and tab-completion.

Third, **live progress**. `rsync` copying forty gigabytes onto a USB drive is not a quick operation, and a terminal that's either silent or scrolling too fast to read is no way to watch it. I wanted a progress bar, in the browser, that told me the truth.

And finally, because this is a box that lives in a car and gets power-cycled by a key, it had to be **boring to run**. No runtime to keep alive, no container stack, nothing to patch. One thing, installed once.

## Meet Roadie

So I built it. It's called **roadie**, because a roadie loads and manages the gear so the band can just turn up and play, which is more or less the job description.

It's a single Go binary that runs on the carnet as a small web service, and it works in two phases.

**Plan.** You open roadie in a browser and browse the collections (Kids TV, TV, Movies, Kids Movies) as plain folder trees read straight off the NFS mounts. You click the things you want. Each click is written to the **manifest**. Nothing is copied at this stage; you're just building a list.

**Sync.** You press Sync. roadie compares the manifest against what's actually on the external drive, works out what's missing, and runs `rsync` for exactly those things, streaming progress back to the page as it goes.

The manifest is the heart of it, so it's worth being precise about what it is.

## The Manifest Is the Source of Truth

The manifest is a small file on the carnet that records the **desired state**: what *should* be on the drive. Not what currently is on the drive; what should be.

That distinction is the whole design. Whoever is using roadie only ever edits the manifest. They never touch `rsync`, never type a path, never see the disk. The sync engine is the *only* thing that reads the drive and runs `rsync`, and all it ever does is make the disk match the manifest. One writer of intent, one reader of intent.

### A manifest entry is a path, not a type

The one design decision I'd defend hardest: **an entry is just a path**, a collection plus a path relative to that collection's root.

```json
{
  "version": 1,
  "entries": [
    { "collection": "movies",  "path": "Up (2009).mkv" },
    { "collection": "movies",  "path": "Cars (2006)" },
    { "collection": "kids-tv", "path": "Bluey (2018)" },
    { "collection": "kids-tv", "path": "Hey Duggee (2014)/Series 1" }
  ]
}
```

Look at those four entries. One is a bare film file. One is a film in its own folder. One is a whole TV show. One is a single series of a show. The manifest doesn't care which is which. There's no `type` field, no `kind`, no `seasons` array. It's just a path, and `rsync` will happily copy a file or a folder with the identical command.

This matters because the library on disk is *messy*, and I didn't want to model the mess. The `/nfs/films/Movies` folder has some films tucked in their own directories and some sitting as bare `.mkv` files right in the folder, and a path absorbs both without a single `if`. Shows that use `Season 01`, shows that use `Series 1`, shows that use something else entirely, and a path doesn't care. Every shape of media, and every future shape, is just a string. The moment you add a type discriminator you've signed up to maintain a list of types forever; a path is the same three lines of code for all of them.

### Sync only ever copies

One more rule, and it's a safety rule: **sync is additive. It only copies. It never deletes.**

Take a film out of the manifest and the next sync will *not* remove it from the drive. Instead, anything on the drive with no matching manifest entry is surfaced separately as **drift** ("this is here, but you didn't ask for it"), and it is only ever removed by an explicit, confirmed prune.

The reasoning is simple. The manifest is edited by a human, in a browser, late at night, and humans mis-click. A mis-click that copies a wrong film is thirty wasted seconds. A mis-click that *deletes* the only offline copy of something, silently, on the next sync, is a genuinely bad evening. So roadie makes destruction loud and deliberate, and everything else cheap and reversible.

## rsync, and the exFAT Tax

Under the bonnet roadie still shells out to `rsync`. It is, after all, the right tool; I just didn't want to *type* it any more. But the exact invocation took some tuning, because the destination is an **exFAT** drive, and exFAT is not a Unix filesystem.

Here's the argument list roadie builds for each job:

```bash
rsync -rtR --modify-window=1 \
      --no-perms --no-owner --no-group \
      --partial-dir=.rsync-partial --info=progress2 \
      --exclude=.DS_Store --exclude=._* --exclude=@eaDir \
      <source>/./<path>  <dest>/
```

A quick tour of the non-obvious flags:

- **`--no-perms --no-owner --no-group`**: exFAT cannot store Unix permissions or ownership at all. Without these, `rsync` tries to set them on every file, the filesystem politely ignores it, and `rsync` then decides the file is subtly wrong and never settles. Telling it not to bother makes the whole thing honest.
- **`--modify-window=1`**: exFAT timestamps are only accurate to two seconds. Without a fudge factor, `rsync` compares an NFS file's modification time to its exFAT copy, sees a sub-second difference, decides they differ, and re-copies the entire library on every single run. One second of slack and incremental syncs actually become incremental.
- **`--partial-dir=.rsync-partial`**: this box gets its power from the car's ignition. Turn the key off mid-copy and a four-gigabyte film is left half-written. With a partial directory that half file is kept and resumed next run, instead of thrown away.
- **`-R` and the `/./` pivot**: the `/./` in the source path tells `rsync` to recreate everything *after* the dot as a relative path under the destination, parent folders and all. It's how a pick of `Hey Duggee (2014)/Series 1` lands in the right nested place on the drive without roadie doing any path arithmetic of its own.
- **`--info=progress2`**: gives a single, whole-transfer progress line instead of per-file noise. roadie parses that line and pushes it to the browser over Server-Sent Events, which is where the live progress bar comes from.

There's also a **pre-flight check** before any of this runs. The external drive is auto-mounted on demand (more on that next), and the failure mode I was most worried about is *the drive not being mounted*, because then `/media/external/Media` is just an empty folder on the carnet's own small SSD, and a "sync" would cheerfully pour forty gigabytes of films onto the boot drive until it filled up. So roadie checks the destination is genuinely a separate, mounted device, with room on it, before it lets `rsync` anywhere near it.

## A Loose End From Part Two

Wiring roadie up made me revisit something from part two. Back then, the AutoFS line for the external drive looked like this:

```conf
#/etc/auto.media
external    -fstype=exfat,ro   UUID=68F1-B7DE
```

Note the `ro`. In part two the carnet only ever *played* media from that drive, so mounting it read-only was a perfectly sensible bit of caution. A sync target, obviously, has to be writable, so the first change was `ro` becoming `rw`.

But that uncovered the more interesting problem, and it's pure exFAT again. Because exFAT stores no ownership information, the kernel *invents* it at mount time from the mount options. Give it no `uid`, and every file on the drive is presented as owned by `root` and writable by nobody else. So out of the box, nothing but `root` can write to the drive, which is why roadie's own service runs as `root`, with this comment sitting right next to the setting so future-me doesn't have to ask why:

> the exfat destination drive is root-mounted, so a non-root user could not write synced media without reconfiguring the mount's uid

If you'd also like to write to the drive as a normal user (to poke at it over `ssh`, say), the fix lives on that same AutoFS line: hand the mount a `uid`, a `gid` and a `umask`.

```conf
#/etc/auto.media
external    -fstype=exfat,rw,async,noatime,uid=1000,gid=1000,umask=000   UUID=68F1-B7DE
```

`chown` will get you nowhere here; there is nowhere on an exFAT volume to *put* an owner. The mount options *are* the ownership. It's a small thing, but it's exactly the sort of small thing that quietly eats an evening, so it's worth knowing.

## One Binary, Installed Once

I wrote roadie in Go, and the reason is the deployment story more than the language.

A Go program compiles to a single statically-linked binary, with no runtime to install and nothing to keep patched. The web UI (the file browser, the manifest list, the progress bar) is plain HTML and JavaScript with no build step, and it's *embedded into the binary itself*. So roadie is, genuinely, one file. You copy it onto the carnet, point a `systemd` unit at it, and that's the install:

```ini
# /etc/systemd/system/roadie.service
[Service]
ExecStart=/usr/local/bin/roadie serve -config /etc/roadie/collections.toml -manifest /var/lib/roadie/manifest.json -addr 0.0.0.0:8473
Restart=on-failure
User=root
```

For a box that lives in a car and gets unceremoniously power-cycled by a key, "one file and a unit" is exactly the amount of moving parts I want.

The collections themselves (what to browse, and where each one comes from and goes to) are a small TOML file:

```toml
# /etc/roadie/collections.toml
[[collection]]
id = "kids-tv"
label = "Kids TV"
source = "/nfs/media/Kids"
dest = "/media/external/Media/Kids"
kind = "tv"

[[collection]]
id = "kids-movies"
label = "Kids Movies"
source = "/nfs/films/Movies"
dest = "/media/external/Media/Kids Movies"
kind = "movie"
```

That `kids-movies` entry is the messy real world made tidy: its `source` is the shared `/nfs/films/Movies` folder, but it browses and lands as its own thing. The split that used to live in my head at eleven at night now lives in a config file.

### Installing and updating it

Because it's a public, open-source project, I wanted installing it to be a one-liner, not a "clone this and read the README" affair.

On a tagged release, [GoReleaser](https://goreleaser.com/) builds binaries for four platforms and publishes them as a GitHub release, alongside a `checksums.txt`. A first install is then just:

```bash
curl -sSL https://raw.githubusercontent.com/adamcarlile/roadie/main/install.sh | sudo sh
```

That script downloads the right binary for the machine, **verifies its SHA-256 against the published checksums** before trusting it, and hands over to `roadie install`, a guided setup that lays down the `systemd` unit, an example config, and the state directory.

Updates are the same idea, built in:

```bash
sudo roadie update
```

`roadie` asks GitHub whether there's a newer release, downloads it, checks the checksum, atomically swaps its own binary, and restarts the service. A media box in a car is a box I do not want to keep `ssh`-ing into to maintain, so it maintains itself. The first release, **v0.1.0**, is out now.

## Where It Goes Next

roadie does the job I built it for: the kitchen-floor `rsync` session is gone, replaced by five minutes of clicking on the sofa. But there's an obvious loose thread.

Right now, once a sync finishes, I still have to open Jellyfin and ask it to rescan its library before the new films show up for the kids. That's silly: roadie knows precisely when a run has finished and what changed. The next enhancement is for roadie to call Jellyfin's API itself when a sync completes, so new media simply *appears*. I deliberately left it out of the first version to get something working and in use, but it's the obvious next step for the app.

And the carnet itself still has the loose end from [part one]({% post_url 2025/2025-08-02-in-car-media-server-pt1 %}): it loses power the moment the ignition is off, and it really wants a small UPS so it can shut down gracefully rather than being yanked. When that goes in, there may well be a part four.

If you'd like a poke around, roadie is on GitHub: **[github.com/adamcarlile/roadie](https://github.com/adamcarlile/roadie)**. It's a small thing that solves a small, specific, deeply annoying problem, which is, honestly, my favourite kind of software to write.
