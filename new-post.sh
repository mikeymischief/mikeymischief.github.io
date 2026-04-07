#!/bin/bash

# Prompt for title
read -p "Post title: " TITLE

# Generate slug from title (lowercase, spaces to hyphens, strip special chars)
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]//g' | tr ' ' '-' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')

# Generate date
DATE=$(date +%Y-%m-%d)
DATETIME=$(date +"%Y-%m-%d %H:%M:%S %z")

# Prompt for categories
read -p "Categories (default: mtg cube): " CATEGORIES
CATEGORIES=${CATEGORIES:-"mtg cube"}

FILENAME="_posts/${DATE}-${SLUG}.md"

cat > "$FILENAME" <<EOF
---
published: false
layout: post
title: ${TITLE}
author: mikey
date: ${DATETIME}
comments: true
excerpt_separator: <!--more-->
categories: ${CATEGORIES}
---

Write your intro here.

<!--more-->

## Section

Content goes here.
EOF

echo "Created: $FILENAME"
