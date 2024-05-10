#!/bin/bash

NA_DIR=$PWD
DIST_DIR=dist/neuralarena-docs

rm -rf dist/neuralarena-docs
cd ../neuralarena-docs && npm run build && cp -r ./build $NA_DIR/$DIST_DIR && cd $NA_DIR

echo '[{"match": ".well-known", "ignore": false}]' >./$DIST_DIR/.ic-assets.json
mkdir ./$DIST_DIR/.well-known
echo 'docs.neuralarena.ai' >./$DIST_DIR/.well-known/ic-domains
