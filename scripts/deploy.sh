#!/bin/sh

cd "${BASH_SOURCE%/*}/../" || exit

# DOMAIN=$(node -e "console.log(require('./package.json').domain);")

# echo $DOMAIN > site/CNAME
# echo 'google-site-verification: googleab6fe5ea20df429c.html' > build/googleab6fe5ea20df429c.html

git checkout -b gh-pages
cp node_modules/jsqr/dist/jsQR.js site/jsQR.js
git add -f site
git commit -m 'Deploy to gh-pages'
git push origin `git subtree split --prefix site`:gh-pages --force
git checkout master
git branch -D gh-pages