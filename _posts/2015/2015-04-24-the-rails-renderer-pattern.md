---
layout: post
title: The Rails renderer pattern
publish_date: 24/04/2015 10:30AM
tags:
- Ruby
- Ruby on rails
- Renderers
- Views
---
##The problem
Rails has always had a neglected sibling through it's entire life, while everything else has been blessed with changes and upgrades. The view layer is still relatively unchanged since rails first release in 2004. There have been [numerous](https://github.com/apotonick/cells) [attempts](http://apotomo.de/) to try to update the view layer to de-couple the rendering of parts into various different components that can be reused.

The aproach that I've seen often involves large numbers of partials strewn throughout the application, with varing numbers of locals passed in. Or worse, lots of duplicated `HTML`, all doing very similar things. As the application grows it become increasingly painful to manage, changes are very difficult to persist over the entire application.

##Renderers
The solution I settled upon was to try to change the view layer into a more descriptive part of the application. Instead of looking at a template and wondering what all these elements do. Your view reads more like a story, with your own component language, specific to your application.

From this

``` html
<section id="support">
  <div class="panel">
  	<div class="title">
  	  <h2>Panel Title</h2>
  	</div>
  	<div class="content">
      <p>This is the content of the panel</p>
  	</div>
  </div>
</section>
```

To this

``` html
<section id="support">
  <%= render_panel('Panel Title') do %>
    <p>This is the content of the panel</p>
  <% end %>
</section>
```

So how do we accomplish all this?

###Components

The renderer is made up of two parts, with an optional third piece.

    Rails
    |-App
    | |-Renderers
    | | |-panel_renderer.rb
    | |-Helpers
    | | |-renderer_helper.rb
    | |-Views
    | | |-Renderers
    | | | |-_panel.html.erb*
    
    (* optional)

####Panel Renderer

This is the class that's responsible for rendering the `HTML`, and it looks like this:

``` ruby
class PanelRenderer

  attr_reader :title
  attr_accessor :content
  
  def initialize(context, title, options={})
  	@context = context
  	@title   = title
  	@options = options.reverse_merge default_options
  end
  
  def render
    @context.render(layout: 'renderers/panel', locals: {renderer: self}) do
      content
    end
  end
  
  def close_box
      @context.link_to("&times;", '#', class: 'close-box') if close?
  end
  
  def close?
    @options[:close_box]
  end
  
  private
  
    def default_options
      {
        close_box: false
      }
    end
  
end
```

The only API stipulation is that it has to respond to `render`.

####Renderer Helper

The module provides the hook into the rails view layer. With a block capture for the custom content of this component

``` ruby
module RendererHelper
  
  def render_panel(title, options={}, &block)
    renderer = PanelRenderer.new(title, options)
    renderer.content = capture(&block)
    renderer.render
  end

end
```

####Renderer View

Finally there's a view that we can yield our content into, of course you don't have to leverage views through Tilt, you could use the Builder gem to generate the `HTML` programatically.

``` html
<div class="panel">
  <div class="title">
    <h2><%= renderer.title %></h2>
    <%= renderer.close_box %>
  </div>
  <div class="content">
    <%= yield %>
  </div>
</div>
```

###Why?

A valid question, lots of extra code to write, and test, however in the long run, with large applications, that reuse very similar view components, there's a single point of entry to create these items, plus the logic required to build them.

However the major benifit comes from the ability to user many of these small componenets to build larger more complex components. Maybe we have a couple of panels inside a set of tabs, we can re-use our panel renderer inside a tab renderer of some description.

