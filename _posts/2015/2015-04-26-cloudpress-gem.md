---
layout: blog/post
title: Cloudpress, now a Rails Engine.
category: Software
tags:
- Ruby
- Rails
- Gem
- Cloudpress
- Open Source
---
Almost eighteen months ago I had the idea to use dropbox to back all of my publishing, making it easy to write posts from any device, all over the world, without having to log in. Using the offline sync capability of dropbox to power it all. I ended up writing a half finished proof of concept, but it was all very tightly coupled, and wasn't as open as I wanted it to be, but it still has powered this blog for the last year or so.

A couple of weeks ago I decided that I'd extract what I'd written and turn it into a portable Rails Engine, allowing anyone to back their blog with dropbox, and be able to publish to it, without having to log in, and navigate an admin interface.

I didn't want to create a drop in blog, I wanted to provide the tools for developers to create their own templates, but have all of the heavy lifting already handled. I found the problem I always had with Wordpress, (not to mention it's written in PHP) was that felt messy to change the templates.

What follows is a short look at how to plug [Cloudpress](https://github.com/adamcarlile/cloudpress) into a bog standard rails app.

##Installation

Follow the instructions available in the [Cloudpress readme](https://github.com/adamcarlile/cloudpress/blob/master/README.md)

After you've completed that, you'll need to mount the engine in the rails router, for this example I've just mounted it in the root, but you could subpath it if you needed.

```ruby
Rails.application.routes.draw do
  mount Cloudpress::Engine => '/'
end
```

Remember to include the cloudpress stylesheet in your `application.css`, it just provides some default pygments code highlighting styles

```
/* ...
*= require_self
*= require_tree .
*= require 'cloudpress'
*/
```

###Post views

Cloudpress ships with a bunch of renderers that enable you to render chunks of the application in lots of different places.

However I doubt you want to use the HTML that I wrote, I think you'd much rather write your own!

#### Example

In order to override the defaults that cloudpress provides you'll need to create a new view in the same path, in order to override the `posts#index` view you'll need to create a `index.html.erb` in `views/cloudpress/posts`. As an aside you don't have to use `ERB`, any template supported by Tilt is acceptable.

Here's what's in my index

```erb
<% content_for(:title) { "Posts" } %>

<%= render_cloudpress_posts(posts) %>
<%= paginate posts %>

<% content_for :support do %>
  <%= render partial: 'support/about_me' %>
  <%= render partial: 'support/tags' %>
  <%= render partial: 'support/archives' %>
<% end %>
```

The interesting part is the `<%= render_cloudpress_posts(posts) %>` call. This invokes a renderer to generate the post list, based on a partial in the same directory called `_intro.html.erb` 

```erb
<article>
  <header>
    <h1><%= link_to renderer.post.title, post_path(renderer.post) %></h1>
    <time><%= renderer.post.publish_date.to_s(:long) %></time>
    <time><%= distance_of_time_in_words(renderer.post.time_to_read) %> - <%= renderer.post.wordcount %> words</time>
  </header>
  <p><%= renderer.post.summary %></p>
</article>
```
Renderer is the instance of the class responsible for putting this whole thing together, but `renderer.post` contains the instance of your post.

Cloudpress contains many of these files, all in sensible locations, if you need to change the certain way something looks it's quite easy just to override the template and do your own thing.

#### List of templates

For completeness I've included the list of templates that Cloudpress uses.

```
- views/cloudpress/archives
	- _archive.html.slim
	- _archives.html.slim
	- _month.html.slim
	- show.html.slim
- views/cloudpress/flashes
	- _flash.html.slim
- views/cloudpress/posts
	- _intro.html.slim
	- _posts.html.slim
	- index.html.slim
	- show.html.slim
- views/cloudpress.tags
	- _tag.html.slim
	- _tags.html.slim
	- show.html.slim
```

#### List of renderers

The way to invoke these templates with the associated rendering logic is to use the built in renderers

- `render_cloudpress_posts(posts, options={})`
- `render_cloudpress_post(post, options={}, &block)`
- `render_clouspress_tags(tags)`
- `render_cloudpress_archives(archives)`
- `render_flashes`
- `render_flash(type, options={}, &block)`

The post renderer can take a block that allows you to append content to the post article without having to redefine the partial.

The flash renderer also takes a block that allows you to render custom messages in the style of a flash.

##Future

As of this post Cloudpress is available on Rubygems, and is at version 0.1.6. On the roadmap in the next couple of months is to finish writing tests for the dropbox consumption side, along with making it easier to attach plugins to the core. I hope you find it useful, and I'm always open to suggestions and pull requests.

[Cloudpress source code](https://github.com/adamcarlile/cloudpress)

[Blog source code](https://github.com/adamcarlile/blog)
