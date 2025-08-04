---
title: "Now running on Jeykll"
subtitle: "After a very long hiatus"
category: Software
tags:
- Ruby
- Blog
layout: blog/post
---
After several years, two children, and a marriage(!). I've taken to picking up writing on my blog again. In the past I rolled my own blogging application, based on rails, and using dropbox for storage, called [Cloudpress]({% post_url 2015/2015-04-26-cloudpress-gem %}) crucially though, all the historic posts were in markdown. Making porting them to new platforms straightforward. Speaking of platforms.

## Blogging Platform

There are plenty of options available, however there's no need to run an application server as it's just static content, any of the static site generators would suit. [Hugo](https://gohugo.io/), [Pelican](https://getpelican.com/), [Gatsby](https://www.gatsbyjs.com/), and many others.

The language I use most often is Ruby, I opted for [Jekyll](https://jekyllrb.com/)

## Development Environment with MISE

Rather than managing Ruby versions manually or with rbenv/rvm, I chose [MISE](https://mise.jdx.dev/) (formerly rtx) for development environment management. MISE provides unified toolchain management for multiple languages.

```bash
# Install MISE
curl https://mise.run | sh

# Configure dependencies
cat << EOF > mise.toml
[tools]
node = "lts"
ruby = "3.4"
EOF

# Install
mise install
```

## Getting started with Jekyll

Installing Jekyll is straightforward:

```bash
gem install jekyll
```

Now create a new Jekyll site without a theme:

```bash
jekyll new adamcarlile.com --blank
```

This creates a minimal structure with:
```
adamcarlile.com/
├── _config.yml      # Site configuration
├── _layouts/        # Page templates
├── _posts/          # Blog posts
└── index.md         # Homepage
```

And by minimal, I mean very minimal. There's some more housekeeping we have to do.

```bash
cat << EOF > Gemfile
source 'https://rubygems.org'

gem 'jekyll'
EOF
```
