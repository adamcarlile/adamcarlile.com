---
layout: post
title: Hash extensions for dealing with CamelCase XML documents
category: Software
---
I'm looking at you Microsoft web services!

Anyway, a quick extension to the Hash class to add the rubyfy_keys! method and
it's recursive partners.

``` ruby
require 'active_support/core_ext'

class Hash

  def rubyfy_keys!
    keys.each do |key|
      self[(key.underscore rescue key) || key] = delete(key)
    end
    self
  end

  def recursively_rubyfy_keys!
    rubyfy_keys!
    values.each{|h| h.recursively_rubyfy_keys!  if h.is_a?(Hash) }
    values.select{|v| v.is_a?(Array) }.flatten.each{|h| h.recursively_rubyfy_keys! if h.is_a?(Hash) }
    self
  end

  def recursively_symbolize_keys!
    symbolize_keys!
    values.each{|h| h.recursively_symbolize_keys!  if h.is_a?(Hash) }
    values.select{|v| v.is_a?(Array) }.flatten.each{|h| h.recursively_symbolize_keys! if h.is_a?(Hash) }
    self
  end

  def recursively_rubyfy_and_symbolize_keys!
    recursively_rubyfy_keys!
    recursively_symbolize_keys!
    self
  end

end
```
