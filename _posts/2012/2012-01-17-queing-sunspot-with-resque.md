---
layout: post
title: Queuing Sunspot indexing jobs with Resque
category: Software
tags:
- Ruby
- Rails
- Sunspot
- Solr
- Resque
---
I'm currently working on a social networking
[platform](http://beta.wellbeinginthecity.me/)(very beta!) for London, and we
use [Resque](https://github.com/defunkt/resque) to handle all of our
background jobs, sending outbound mail, image processing etc.

We recently implemented [Sunspot](http://sunspot.github.com/) and
[Solr](http://lucene.apache.org/solr/) for indexing our models to allow rapid
full text searching. Now [Sunspot](http://sunspot.github.com/) is awesome, has
a great DSL and makes indexing and searching super easy, it also has great
built in support for [DelayedJob](https://github.com/tobi/delayed_job), which
is another awesome background processing framework.

However since we've already implemented
[Resque](https://github.com/defunkt/resque) it seemed the logical choice to
integrate it with [Sunspot](http://sunspot.github.com/). But documentation
seems to be patchy at best as to how to implement the queue with Resque.

## Enter SunspotSessionProxy

SunspotSessionProxy is a class that sits between the
[Sunspot](http://sunspot.github.com/) interface and the
[Solr](http://lucene.apache.org/solr/) server, allowing you to change the
behaviour of certain actions that Sunspot will perform, such as indexing,
searching etc.

So through this class we can modify the default behaviour of the index action
to route it via a [Resque](https://github.com/defunkt/resque) worker.

``` ruby
module Sunspot
  class ResqueSessionProxy < Sunspot::SessionProxy::AbstractSessionProxy

    attr_reader :original_session

    delegate :config, :delete_dirty?, :dirty?,
    :new_search, :search,
    :new_more_like_this, :more_like_this,
    :remove, :remove!,
    :remove_by_id, :remove_by_id!,
    :remove_all, :remove_all!,
    :batch, :commit, :commit_if_delete_dirty, :commit_if_dirty,
    :index!, :to => :session

    def initialize(session)
      @original_session = session
    end

    alias_method :session, :original_session

    def index(*objects)
      args = []
      objects.flatten.compact.each do |object|
        args << object.class.name << object.id
      end
      Resque.enqueue(Sunspot::IndexJob, *args) unless args.empty?
    end

  end

end
```

This class delegates all of it's methods to the Session class, apart from the
index method, which we have rewritten to include a call to
[Resque](https://github.com/defunkt/resque) to enqueue the job.

We also keep hold of the original session so that we can call it from inside
the Resque worker, so we can actually run the original indexing method,
instead of our modified index method

## Work, Work, Work

Here's the code for the [Resque](https://github.com/defunkt/resque) worker.

``` ruby
module Sunspot

  class IndexJob

    @queue = :indexer

    def self.perform(*args)
      objects = []
      args.each_slice(2) do |(clazz, id)|
        object = clazz.constantize.find_by_id(id)
        # don't blow up if the object no longer exists in the db
        if object
          objects << object
        end
      end
      Sunspot.session.original_session.index!(*objects)
    end

  end

end
```

Very simple, just takes the arguments passed by the ResqueSessionProxy#index,
gets all the AR objects, and then runs the original sessions index method from
inside the worker thread

## The Final Piece

Finally we have to tell [Resque](https://github.com/defunkt/resque) to use
this new session proxy, so just a simple line an in initialiser will do it

``` ruby
Sunspot.session = Sunspot::ResqueSessionProxy.new(Sunspot.session)
```

That's it! Hopefully that has helped some of you, as I've not seen any
documentation on this subject
