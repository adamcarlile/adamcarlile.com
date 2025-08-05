---
title: "Getting set up with Jekyll in 2025"
subtitle: "We're back, after a long hiatus"
category: Software
tags:
- Ruby
- Blog
- Jekyll
- Javascript
- Tailwind
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

### VScode Tasks

My IDE of choice these days is VSCode, there's a hidden directory within this repo called `.vscode` which contains configuration specific for VSCode. I make heavy use of the tasks feature, providing project specific tasks that can be invoked via the command pallet

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"label": "Serve Jekyll Site",
			"type": "shell",
			"command": "mise exec -- bundle exec jekyll serve -D --host 0.0.0.0 --livereload",
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
			"label": "Install Dependencies",
			"type": "shell",
			"command": "mise exec -- bundle install && mise exec -- npm install",
			"group": "build",
			"isBackground": false,
			"problemMatcher": []
		}
	]
}
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

Let's boot our test server and check

```bash
mise exec -- jekyll serve -h 0.0.0.0 -D --livereload
# -h Binds to a specific host
# -D enables the display of posts from the _draft folder
# --livereload enables the live reloading of the page without a refresh
```

## Styling

For styling, I implemented a modern CSS pipeline using [PostCSS](https://postcss.org) and [Tailwind](https://tailwindcss.com). Here's the setup:

### Tailwind

Tailwind is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup. Instead of writing custom CSS, you compose styles using pre-built classes like `text-center`, `bg-blue-500`, and `p-4`.

Firstly lets install the necessary dependencies:

```bash
npm init -y
npm install -D tailwindcss @tailwindcss/typography postcss autoprefixer
```

Create the Tailwind configuration:

```bash
npx tailwindcss init -p
```

Configure `tailwind.config.js` to scan Jekyll files that can contain CSS selectors:

```javascript
module.exports = {
  content: [
    './_layouts/**/*.html',
    './_includes/**/*.html',
    './_posts/**/*.md',
    './*.md',
    './*.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Great, however, out of the box, tailwind is configured to only apply styling to its selectors. In our long form blog post content we are unable to assign specific selectors to enable styling paragraphs or titles. We need to configure tailwind to target specific elements within a content block.

Fortunately this is a solved problem with `@tailwindcss/typography`. Lets set up our `assets/css/main.css` file with tailwind, and the typography plugin.

```css
---
---
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

> [!IMPORTANT]
> Notice the triple dashes at the top of this file, all files that Jekyll will process that aren't `HTML`, **MUST** include this block in order to be processed.

### PostCSS

[PostCSS](https://postcss.org) is a tool for transforming CSS with JavaScript plugins. It acts as a CSS processor that can parse, transform, and output CSS, allowing you to use future CSS features today through plugins like autoprefixer (which adds vendor prefixes) and cssnano (for minification).

In our Jekyll setup, PostCSS works as a build step that processes our CSS files, applying Tailwind's utility classes and any additional transformations we configure.

While tailwind has no external dependencies, PostCSS requires hooks into the Jekyll build pipeline, these are provided by the `jekyll-postcss-v2` plugin, we need to add the following to the `Gemfile` and `_config.yml`

```ruby
# Gemfile
group :jekyll_plugins do
  gem 'jekyll-postcss-v2'
end
```
```yaml
# _config.yml
plugins:
  - jekyll-postcss-v2
```

Now that's complete, lets setup our `postcss.config.js`.Tailwind provides a separate package to support postcss, we also need to include autoprefixer.

```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {}
  }
}
```

The pipeline is now set up, and will automatically rebuild the CSS file when a change is detected in development mode.

## Layouts

Jekyll layouts are templates that wrap around your content, defining the overall structure and design of your pages. They're stored in the `_layouts` directory and use [Liquid](https://shopify.github.io/liquid/) templating to insert content into predefined sections.

All assets processed by Jekyll can have front matter, which is essentially embedded `YAML` at the head of a document, delimited by those triple dashes like we saw in our css file earlier. This is used to provide metadata and variables.

{% raw %}
When you specify a layout in a page's front matter (like `layout: default`), Jekyll processes the content through that template, replacing `{{ content }}` with your page's actual content.

```html
<!DOCTYPE html>
<html lang="{{ site.lang | default: 'en-US' }}">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta charset="utf-8">
    <title>{{ page.title }} - {{ site.title }}</title>
    <link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">
  </head>
  <body>
    {{ content }}
  </body>
</html>
```
{% endraw %}

As you can see it's just a straightforward `HTML` document, but with some liquid templating. These files live within the `/_layouts/` directory

We can also specify some defaults site wide

```yaml
# _config.yml
defaults:
  -
    scope:
      path: "" # an empty string here means all files
    values:
      layout: "default"
```

## Pages

Next we have to create some content, essentially Jekyll will make pages available at the paths you have available in the root of the project. For example:

```text
adamcarlile.com/
├── assets/
├── blog/
│   ├── index.html
│   └── tags/
│       └── index.html
└── index.html
```

This will make `/blog` available as a path and render the `index.html` as the content, we can then use the following to loop over the contents of the posts array, using an include that encapsulates the content of a post summary given the incoming variable `post`

{% raw %}
```html
{% for post in site.posts %}
  {% include post/summary.html post=post %}
{% endfor %}
```

```html
<article>
  <div>
    <time datetime="{{ include.post.date | date_to_xmlschema }}">
      {{ include.post.date | date: "%b %d, %Y" }}
    </time>
    {% if include.post.tags.size > 0 %}
      {% for tag in include.post.tags limit:5 %}
      {% assign slugged_tag = tag | slugify %}
      <a href="{{ '/blog/tags/' | append: slugged_tag | relative_url }}">
        {{ tag }}
      </a>
      {% endfor %}
    {% endif %}
  </div>
  <div>
    <h3>
      <a href="{{ post.url | relative_url }}">
        {{ include.post.title }}
      </a>
    </h3>
    <p>
      {{ include.post.excerpt | strip_html | truncatewords: 50 }}
    </p>
  </div>
</article>
```
{% endraw %}

There's a bit going on here, and hopefully it's mostly self explanatory, we can use the passed in post, by referencing the `include.post`. We can also use Liquid filters, such as 
- `strip_html`
- `truncatewords: 50`

These filters allow us to chain functions together to output content in the desired format. We also have access to simple control structures, like `if`. 

## Posts

Posts live in the `_posts` directory and follow a specific naming convention: `YYYY-MM-DD-title.md`. Jekyll automatically processes these files and makes them available through the `site.posts` collection.

### Structure

Each post starts with front matter defining metadata, then the content in markdown. Jekyll automatically:
- Parses the filename for the date
- Converts markdown to HTML
- Makes posts available in reverse chronological order via `site.posts`
- Creates individual post pages at `/blog/YYYY/post-title.html`

> [!NOTE] 
> The path is configurable within the `_config.yml` file, see the `permalink:` attribute, for this blog it's set to: `/blog/:year/:title:output_ext`

### Styling with Tailwind Typography

As mentioned earlier, if we apply no style rules the content of these posts would be entirely un-styled.

The `@tailwindcss/typography` plugin provides the `.prose` class that automatically styles all standard HTML elements generated from markdown. In the post layout, we wrap the content like this:

{% raw %}
```html
<article class="prose prose-lg max-w-4xl mx-auto">
  {{ content }}
</article>
```
{% endraw %}

The end result is styling that is applied to tags, instead of via applied css classes. Meaning we get nice typography without having to do any additional work.

## Deployment

For deployment, I'm using GitHub Actions to automatically build and deploy to GitHub Pages whenever I push to the main branch. The workflow runs `bundle exec jekyll build` and publishes the `_site` directory. I've included the action below.

```yaml
name: Build and Deploy Jekyll Site

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version-file: '.ruby-version'
        bundler-cache: true

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install Node dependencies
      run: npm install

    - name: Setup Pages
      id: pages
      uses: actions/configure-pages@v4

    - name: Build with Jekyll
      run: bundle exec jekyll build --baseurl "${{ steps.pages.outputs.base_path }}"
      env:
        JEKYLL_ENV: production

    - name: Upload artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: ./_site

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

In Cloudflare DNS, I configure an apex CNAME record pointing `adamcarlile.com` to `adamcarlile.github.io`, with proxying enabled for SSL and performance optimization. GitHub Pages automatically handles the custom domain configuration once the CNAME file is present in the repository root.

## Summary

Setting up Jekyll in 2025 is remarkably straightforward when you leverage modern tooling. MISE handles your development environment, Jekyll provides the static site generation, and the PostCSS + Tailwind pipeline delivers professional styling with minimal configuration. After years away from blogging, it's nice to have a workflow that feels mature, well structured and flexible.

Next steps are to add archive pages, tag indexes, and some other assorted plugins. I hope that this has been a helpful introduction however.
