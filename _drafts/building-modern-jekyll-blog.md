---
title: "Building a Modern Jekyll Blog with Tailwind CSS and MISE"
subtitle: "A technical deep-dive into creating a fast, maintainable static site"
category: Development
tags:
- Jekyll
- Ruby
- Tailwind
- PostCSS
- Static Sites
- Web Development
layout: blog/post
---

After years of using various blogging platforms and CMSs, I decided to rebuild my personal site using Jekyll. The goal was to create a fast, maintainable, and modern blog that could handle technical content while providing a great reading experience. Here's how I built it using Jekyll, Tailwind CSS, and a modern development workflow.

## Why Jekyll in 2025?

While there are many static site generators available, Jekyll remains a solid choice for technical blogs:

- **Ruby ecosystem**: Mature gem ecosystem with excellent plugins
- **GitHub Pages compatibility**: Native deployment support
- **Markdown-first**: Perfect for technical writing with code samples
- **Liquid templating**: Powerful and flexible template system
- **Performance**: Fast static sites with minimal overhead

## Development Environment with MISE

Rather than managing Ruby versions manually or with rbenv/rvm, I chose [MISE](https://mise.jdx.dev/) (formerly rtx) for development environment management. MISE provides unified toolchain management for multiple languages.

### Setup

```bash
# Install MISE
curl https://mise.run | sh

# Configure Ruby version
echo "ruby 3.4.1" > .tool-versions

# Install Ruby and dependencies
mise install
mise exec -- bundle install
```

This approach ensures consistent Ruby versions across different environments and makes onboarding new contributors effortless.

## Jekyll Configuration and Plugins

My Jekyll setup uses several key plugins to enhance functionality:

### Gemfile

```ruby
source 'https://rubygems.org'

gem 'jekyll'
gem 'puma'

group :jekyll_plugins do
  gem 'jekyll-archives'     # Date and tag-based archives
  gem 'jekyll-compose'      # CLI tools for creating posts
  gem 'jekyll-seo-tag'      # SEO meta tags
  gem 'jekyll-postcss-v2'   # PostCSS integration
  gem 'jekyll-spaceship'    # Enhanced markdown features
  gem 'jekyll-gfm-admonitions' # GitHub-style callouts
end

group :development do
  gem 'ruby-lsp'           # Language server for VS Code
end
```

### Key Plugin Features

- **jekyll-archives**: Automatically generates archive pages for categories and tags
- **jekyll-compose**: Provides `bundle exec jekyll post "Title"` commands for content creation
- **jekyll-spaceship**: Adds support for table formatting, emojis, and enhanced markdown
- **jekyll-gfm-admonitions**: GitHub-style note/warning/tip callouts

## Tailwind CSS Integration

Instead of using Jekyll's built-in Sass processing, I opted for a modern CSS workflow with Tailwind CSS and PostCSS.

### Package.json

```json
{
  "name": "adamcarlile-com",
  "version": "1.0.0",
  "scripts": {
    "build-css": "tailwindcss -i ./assets/css/style.css -o ./assets/css/main.css --watch",
    "build": "tailwindcss -i ./assets/css/style.css -o ./assets/css/main.css"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "@tailwindcss/typography": "^0.5.10",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Tailwind Configuration

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./_posts/**/*.md",
    "./*.html",
    "./*.md"
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Crete Round', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### CSS Architecture

The main CSS file uses Tailwind's latest features:

```css
---
---
@import url('https://fonts.googleapis.com/css2?family=Crete+Round:ital@0;1&display=swap');
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-crete: "Crete Round", serif; 
  --font-serif: "Crete Round", "Georgia", serif;
}

@layer components {
  .prose img {
    @apply mx-auto block rounded-lg shadow-sm;
    max-width: 100%;
    height: auto;
  }
  
  .prose img.breakout {
    @apply w-[calc(100%+200px)] max-w-[calc(100vw-2rem)];
    @apply -ml-[100px] -mr-[100px];
  }
  
  .prose a {
    @apply text-indigo-600 underline decoration-indigo-600/30 underline-offset-4;
    @apply transition-colors duration-200;
  }
}
```

## Build Process and Tasks

I use VS Code tasks for development workflow, configured to work with MISE:

### .vscode/tasks.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Serve Jekyll Site",
      "type": "shell",
      "command": "mise exec -- bundle exec jekyll serve --host 0.0.0.0 --livereload",
      "group": "build",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Build Jekyll Site",
      "type": "shell",
      "command": "mise exec -- bundle exec jekyll build",
      "group": "build",
      "isBackground": false,
      "problemMatcher": []
    },
    {
      "label": "Build CSS",
      "type": "shell",
      "command": "npm run build",
      "group": "build",
      "isBackground": false,
      "problemMatcher": []
    }
  ]
}
```

This setup allows me to:
- Start development server with live reload
- Build production assets
- Process CSS with Tailwind CLI
- Maintain consistent Ruby environment

## Advanced Features

### Smart Image Handling

I implemented a JavaScript solution that automatically applies breakout styling to large images:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const proseImages = document.querySelectorAll('.prose img');
  
  proseImages.forEach(img => {
    if (img.complete && img.naturalWidth !== 0) {
      checkImageSize(img);
    } else {
      img.addEventListener('load', () => checkImageSize(img));
    }
  });
  
  function checkImageSize(img) {
    const container = img.closest('.prose');
    const containerWidth = container.offsetWidth;
    const imageNaturalWidth = img.naturalWidth;
    
    if (imageNaturalWidth > containerWidth) {
      img.classList.add('breakout');
    }
  }
});
```

This automatically extends large images beyond the content column for visual impact while keeping smaller images at their natural size.

### Custom Components

I created reusable Jekyll includes for common components:

- **Breadcrumbs**: Dynamic navigation based on URL structure
- **Social links**: Configurable social media buttons
- **Post metadata**: Date, category, and tag display
- **Hero sections**: Flexible page headers with background images

## Deployment

The site deploys to GitHub Pages with a custom domain routed through Cloudflare for:

- **SSL termination**: Automatic HTTPS
- **CDN**: Global content delivery
- **DNS management**: Custom domain configuration
- **Performance**: Optimized asset delivery

## Performance Optimizations

- **Static generation**: No runtime server processing
- **Optimized images**: Automatic responsive breakouts
- **Minimal JavaScript**: Only essential functionality
- **Efficient CSS**: Tailwind's purge removes unused styles
- **Font optimization**: Google Fonts with display swap

## Development Workflow

```bash
# Start development
mise exec -- bundle exec jekyll serve --livereload

# Build CSS (in separate terminal)
npm run build-css

# Create new post
mise exec -- bundle exec jekyll post "New Post Title"

# Build for production
npm run build && mise exec -- bundle exec jekyll build
```

## Lessons Learned

1. **MISE simplifies environment management**: No more Ruby version conflicts
2. **Tailwind + Jekyll works well**: Modern CSS with static generation
3. **Component-based includes**: Reusable Jekyll partials improve maintainability
4. **Performance matters**: Static sites can be incredibly fast with proper optimization
5. **Automation helps**: Smart image handling and build tasks reduce manual work

## Conclusion

This Jekyll setup provides a modern, maintainable foundation for technical blogging. The combination of Jekyll's maturity, Tailwind's utility-first approach, and MISE's environment management creates a developer-friendly workflow that generates fast, accessible static sites.

The entire source code is available on [GitHub](https://github.com/adamcarlile/adamcarlile.com) for reference and contribution.

---

*This post covers the technical implementation. For questions about specific configurations or to suggest improvements, feel free to reach out through the social links above.*
