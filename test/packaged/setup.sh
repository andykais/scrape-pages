#!/bin/bash

set -x
set -e

# we install with npm specifically because that is what most users will do
function npm_install_local_package() {
  local cwd="$PWD" \
    && local package_folder=$1 \
    && echo "package_folder $package_folder" \
    && cd $1 \
    && local tarball=$(pnpm pack) \
    && echo "tarball $tarball" \
    && local fullpath="$package_folder/$tarball" \
    && cd "$cwd" \
    && npm install "$fullpath" \
    && rm "$package_folder/$tarball"
}


cd $(dirname $0)
test_packaged_folder=$PWD
cd ../..
project_root=$PWD
build_folder=$project_root/build
tmp_folder=/tmp/scrape-pages-full-packaging-test

npm run build
rm -rf $tmp_folder
mkdir -p $tmp_folder
cd $tmp_folder
npm init --yes
npm_install_local_package $build_folder
cp $test_packaged_folder/full-module.test.js .
node full-module.test.js
