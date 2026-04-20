# Mischief's Gaming Blog

A Jekyll blog hosted on GitHub Pages at https://mikeymischief.github.io.

## About the blog
- Magic: The Gathering focused — primarily cube drafts and Commander
- Author: mikey (mikeymischief)
- Theme: `pages-themes/slate@v0.2.0`

## Post structure
Posts live in `_posts/` and are named `YYYY-MM-DD-slug.md`.

### Frontmatter template
```yaml
---
published: true
layout: post
title: Post Title Here
author: mikey
date: YYYY-MM-DD HH:MM:SS -0800
comments: true
excerpt_separator: <!--more-->
categories: mtg cube
---
```

- Set `published: false` while drafting
- Common category combos: `mtg cube`, `mtg cube primer`, `mtg commander`
- The `<!--more-->` tag splits the preview from the full post

### Images
Card images are stored in `/images/mtg/` and referenced like:
```html
<img src="/images/mtg/set-num-card-name.jpg" alt="Card Name" width="200"/>
```

## Git workflow
- Never run `git push` — always leave that to mikey
- Commit changes to the worktree branch, then merge into master locally
- mikey will push when ready

## Useful scripts
- `./new-post.sh` — scaffold a new post with correct filename and frontmatter
