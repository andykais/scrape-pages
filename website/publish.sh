#!/bin/bash

git worktree add dist gh-pages

rm -r dist/*

npm run build \
  && cd dist \
  && git add --all \
  && git commit -m "publish to gh-pages" \
  && git push origin gh-pages
