---
layout: blog/post
title: Heroku Airbrake post deploy hook
category: Software
tags:
- Airbrake
- Rails
- Heroku
- Deploy
---
After a lot of trawling around the internet I couldn't find any reference as
to how to set up a post deploy hook for heroku. Even the
`airbrake:heroku:add_post_deploy_hook` rake task didn't seem to work, so I have
managed to piece together my own custom post deploy hook

```
heroku addons:add deployhooks:http url='http://airbrake.io/deploys.txt?deploy[rails_env]=YOUR_ENVIRONMENT
                                    &api_key=YOUR_API_KEY&deploy[local_username]={user}
                                    &deploy[scm_repository]=git@github.com:youruser/your-repo.git&deploy[scm_revision]={head}'
                                    --app heroku_app_name
```

I hope this can help someone!

  * [Heroku post deploy hook docs](http://devcenter.heroku.com/articles/deploy-hooks)
  * [Airbrake post deploy hook docs](http://help.airbrake.io/kb/api-2/deploy-tracking)
