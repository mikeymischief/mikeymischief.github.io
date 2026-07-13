#!/bin/bash

# Prompt for title
read -p "Post title: " TITLE

# Generate slug from title (lowercase, spaces to hyphens, strip special chars)
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

# Generate date
DATE=$(date +%Y-%m-%d)
DATETIME=$(date +"%Y-%m-%d %H:%M:%S %z")

# Prompt for description
read -p "Description (short summary): " DESCRIPTION

# Prompt for categories
read -p "Categories (default: mtg cube): " CATEGORIES
CATEGORIES=${CATEGORIES:-"mtg cube"}

# Pick a random hero image based on category
if echo "$CATEGORIES" | grep -q "commander"; then
  IMAGE_DIR="images/bg/commander"
elif echo "$CATEGORIES" | grep -q "cube"; then
  IMAGE_DIR="images/bg/cube"
fi

if [ -n "$IMAGE_DIR" ]; then
  IMAGE_FILE=$(ls "$IMAGE_DIR" 2>/dev/null | shuf -n 1)
  IMAGE_FIELD="image: /${IMAGE_DIR}/${IMAGE_FILE}"
else
  IMAGE_FIELD=""
fi

FILENAME="_posts/${DATE}-${SLUG}.md"

cat > "$FILENAME" <<EOF
---
published: false
layout: post
title: "${TITLE}"
author: mikey
date: ${DATETIME}
pubDate: ${DATE}
description: "${DESCRIPTION}"
comments: true
excerpt_separator: <!--more-->
categories: ${CATEGORIES}
${IMAGE_FIELD}
---

Write your intro here.

<!--more-->

## Section

Content goes here.

{% if page.comments %}
<div id="disqus_thread"></div>
<script>
(function() {
var d = document, s = d.createElement('script');
s.src = 'https://mikeymischief-github-io.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
<script id="dsq-count-scr" src="//mikeymischief-github-io.disqus.com/count.js" async></script>
{% endif %}
EOF

echo "Created: $FILENAME"
