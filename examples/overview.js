#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

let tilto;
if (fs.existsSync(path.join(__dirname, '../dist/index.js'))) {
  tilto = require('../dist');
} else {
  require('../setup/ts-node-reigister-for-test');
  tilto = require('../src');
}

// ========

const box = tilto.createBox({width: 20, height: 6});

box.borders = tilto.createBordersByType('default');
box.content = 'The quick brown fox jumps over the lazy dog.';
console.log(tilto.render(box));

const ansiRed = '\u001b[31m';
const ansiGreen = '\u001b[32m';
const ansiReset = '\u001b[0m';
box.content = 'It also supports マルチバイト文字, Surrogate-pairs and ' +
  `${ansiRed}ANSI${ansiReset} ${ansiGreen}escape${ansiReset} codes.`;
console.log(tilto.render(box));

box.content = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].join('\n');
box.scroll = {
  y: 4,
};
console.log(tilto.render(box));
