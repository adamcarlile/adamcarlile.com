---
layout: blog/post
title: Meta programming, serialization
category: Software
tags:
- Ruby
- Rails
- Web
- Programming
---
I'm currently working on a social media platform for London, with it's main
purpose being to promote a wellbeing lifestyle in a hectic city. I wrote this
handy little utility module for creating methods from serialized data.

Say, for example you have an object, but it can have serialized data stored
within a hash in the database, instead of getting the data through the hash
notation, you can now access it directly as Object.first.hash_key_name instead
of Object.first.hash[:hash_key_name]

``` ruby
module ExtraFields
  def self.included(base)

    base.serialized_fields.each do |method_name|
      base.class_eval <<-EOS
        def #{method_name.to_s}
          extra_fields[:#{method_name}] if extra_fields && extra_fields[:#{method_name}]
        end
        def #{method_name.to_s}=(value)
          self.extra_fields[:#{method_name}] = value
        end
      EOS
    end

  end
end
```

This is handy in two ways, you can access serialized data directly as methods
of the class instance. Plus you can use the serialized fields directly in a
form, as the module automatically creates the setters for the hashes keys.
Pretty handy, you just have to specify in an array of serialized field symbols
as a private method in the parent class.

``` ruby
class Page
  include ExtraFields

  private

    def serialized_fields
      [:field_one, :field_two, :another_field]
    end

end
```
