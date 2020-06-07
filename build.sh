#! /bin/bash

echo "Rebuilding Game"
rm -rf dist
mkdir -p dist/js
cp index_dist.html dist/index.html
cp favicon.ico dist/favicon.ico

echo "Copying Assets"
cp -r assets dist/

echo "Transpiling with Babel"
npx babel js/library -d dist/js/library
npx babel js/game.js -o dist/js/game.js
npx babel js/LOGSCORE.js -o dist/js/LOGSCORE.js

echo "Browserifying"
npx browserify dist/js/game.js -o dist/js/game_browserify.js

echo "Cleaning up"
rm -rf dist/js/library

echo "Minifying"
npx google-closure-compiler --js=dist/js/game_browserify.js --js_output_file=dist/js/game.js --jscomp_off=checkVars

rm dist/js/LOGSCORE.js
rm dist/js/game_browserify.js

echo "Done! (ignore the warnings)"