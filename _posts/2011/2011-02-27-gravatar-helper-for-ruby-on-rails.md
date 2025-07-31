---
layout: blog/post
title: Gravatar helper for Ruby on Rails
category: Software
tags:
  - Ruby
  - Rails
  - Gravatar
---
I was working on a project a while ago with user comments, and wanted each
person to have their own avatar, however, the Gravatar plugins that existed
for Rails were overkill for my needs.

So I wrote this simple helper method. Either copy the method into your
application_helper.rb, or alternatively drop it into your lib directory and
include it.

``` ruby
module GravatarHelper

  def gravatize(email, options={})
    default_options = {:size => 60}
    options = default_options.update(options)
    crypted_email = Digest::MD5.hexdigest(email)
    output = "http://www.gravatar.com/avatar/#{crypted_email}?s=#{options[:size]}"
    return image_tag(output)
  end

end
```

Usage is as simple as just calling:

``` ruby
gravatize(user.email, :size => 50)
```

This will just render the Gravatar inside an image tag, simple no!
