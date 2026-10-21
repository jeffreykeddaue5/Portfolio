#!/usr/bin/env bash
# New entry: copies posts/_template.js into a new entry file with today's date.
#
# Usage:
#   ./new-post.sh              → posts/2026-10-21.js
#   ./new-post.sh my-project   → posts/2026-10-21-my-project.js
#
# Does: creates the entry file (date filled in) · adds it to posts/list.js · creates media/<name>/
set -euo pipefail

cd "$(dirname "$0")"

today=$(date +%F)
slug=${1:-}

if [[ -n "$slug" && ! "$slug" =~ ^[a-z0-9-]+$ ]]; then
  echo "Name may only contain lowercase letters, numbers and hyphens: $slug" >&2
  exit 1
fi

name="$today${slug:+-$slug}"
file="posts/$name.js"

if [[ -e "$file" ]]; then
  echo "File already exists: $file" >&2
  exit 1
fi

# Copy the template without its header comment, filling in the date and media path
sed -e '1,/^$/d' \
    -e "s/date: \"[0-9-]*\"/date: \"$today\"/" \
    -e "s#media/my-post/#media/$name/#g" \
    posts/_template.js > "$file"

# Add to the top of list.js
sed -i "s/^const POST_FILES = \[/&\n  \"$name\",/" posts/list.js

mkdir -p "media/$name"

echo "Created:"
echo "  entry: $file"
echo "  media: media/$name/"
echo "  list:  added \"$name\" to posts/list.js"
