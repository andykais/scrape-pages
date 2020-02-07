#!/bin/bash

set -e

cd $(dirname $0)
cd ../..

function npm_install_local_package() {
  local cwd="$PWD" \
    && local package_folder=$1 \
    && echo "package_folder $package_folder" \
    && cd $1 \
    && local tarball=$(npm pack) \
    && echo "tarball $tarball" \
    && local fullpath="$package_folder/$tarball" \
    && cd "$cwd" \
    && npm install "$fullpath" \
    && rm "$package_folder/$tarball"
}


project_root=$PWD
build_folder=$PWD/lib
tmp_folder=/tmp/scrape-pages-full-packaging-test

npm run build
rm -rf $tmp_folder
mkdir -p $tmp_folder
cd $tmp_folder
npm init --yes
npm_install_local_package $build_folder
cp $project_root/testing/packaging/full-module.test.js .
node full-module.test.js
