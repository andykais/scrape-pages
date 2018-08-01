#!/bin/bash

set -x

cd $(dirname $(dirname $0)) \
  && rm -rf lib \
  && npm run build \
  && cp -r src lib \
  && cp package.json lib \
  && cp package-lock.json lib \
  && cp LICENSE lib \
  && cp README.md lib \
  && cd lib \
  && ls -al

echo package
cat package.json
npm version --no-git-tag-version 2.99.1
  # && npm publish
  # && git push
