module Jekyll
  class TagPageGenerator < Generator
    safe true
    priority :low

    def generate(site)
      tags = site.posts.docs.flat_map { |post| post.data['tags'] || [] }.uniq
      
      tags.each do |tag|
        # Check if a page with this name already exists
        existing_page = site.pages.find { |page| page.name == "#{Jekyll::Utils.slugify(tag)}.html" && page.dir == "/tags/" }
        unless existing_page
          site.pages << TagPage.new(site, site.source, tag)
        end
      end
    end
  end

  class TagPage < Page
    def initialize(site, base, tag)
      @site = site
      @base = base
      @dir = "tags"
      @name = "#{Jekyll::Utils.slugify(tag)}.html"

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tag.html')
      
      self.data['tag'] = tag
      self.data['title'] = "Posts tagged with \"#{tag}\""
      self.data['subtitle'] = "All blog posts tagged with #{tag}"
    end
  end
end
