---
layout: blog/post
title: Rendering sane markup with Rails helpers
category: Software
tags:
- Ruby
- Ruby on rails
- HTML
- Helpers
- Markup
- programming
- Code
- code
---
If you, like me, have tried to use helpers to generate complex chunks of HTML
programmaticly, then you will have noticed that `content_tag` doesn't really
cut it for large chunks of HTML

`content_tag` will render the HTML inline unless you manually insert line
breaks and tabs in order to make it readable, not to mention you end up with a
horribly nested set of methods wrapping around the content you want to display

Looking something a little like this

``` ruby
def render_user_status
  if user_signed_in?
    inner_html = content_tag(:span, "Signed in as #{current_user.email}. Not you? \n #{link_to("Sign out", destroy_user_session_path)}")
  else
    inner_html = content_tag(:span, "#{link_to("Sign up", new_user_registration_path)} \n or \n #{link_to("Sign in", new_user_session_path)}")
  end
  return content_tag(:div, inner_html, :id => "user_nav")
end
```

As you can see the code looks quite unreadable, and it's almost backwards in
the way that it is generated, I'm creating the inner HTML first, and then
wrapping it inside a div depending on if the user is logged in or not, there
must be a better way to achieve the same result, while making it look nicer

## Enter Builder

The builder gem is something that I have used most often for defining XML
documents, however you can also call the Builder::XmlMarkup.new method within
any other methods and generate XML markup inline. Using the same example, this
is the execution using Builder::XmlMarkup instead of content_tag

``` ruby
def render_user_status
  xhtml = Builder::XmlMarkup.new :target => out=(''), :indent => 2
  xhtml.div(:id => "user_nav") do |x|
    if user_signed_in?
      x << "Signed in as #{current_user.email}. Not you? "
      x << link_to("Sign out", destroy_user_session_path)
    else
      x << link_to("Sign up", new_user_registration_path)
      x << " or "
      x << link_to("Sign in", new_user_session_path)
    end
  end
end
```

As you can see it's much more readable than the previous example

However each to their own, but I think personally the Builder gem is
incredibly useful for creating XML style markup instead of using Rails' built
in helpers to generate HTML. Give it a go, you might be pleasantly surprised!
