#!/bin/bash

cd $(dirname $(dirname $0))

package_version="$TRAVIS_TAG"

publish_package_to_npm() {
  echo '//registry.npmjs.org/:_authToken=${NPM_AUTH_TOKEN}' >> ~/.npmrc \
    && npm run build \
    && cd lib \
    && npm publish \
    && cd ..
}

push_version_to_github() {
  git checkout -b master \
    && git add package.json package-lock.json \
    && git commit --message "release $package_version" \
    && git remote add deploy https://${GITHUB_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git \
    && git push deploy master
}

set -x

npm version --no-git-tag-version "$package_version" \
  && publish_package_to_npm \
  && push_version_to_github
