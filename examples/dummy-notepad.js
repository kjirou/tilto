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

const logUpdate = require('log-update');
const keypress = require('keypress');


let root = tilto.createBox({width: 40, height: 20});

const statusBar = tilto.createBox({width: 40, height: 3});
statusBar.borders = tilto.createBordersByType('default');
statusBar.content = '[C]lear | [Q]uit';

let textarea = tilto.createBox({y: 3, width: 40, height: 17});
Object.assign(textarea.borders, {
  bottomWidth: 1,
  leftWidth: 1,
  rightWidth: 1,
  bottomSymbols: ['-'],
  leftSymbols: ['|'],
  rightSymbols: ['|'],
  bottomLeftSymbols: ['+'],
  bottomRightSymbols: ['+'],
});

root.children.push(statusBar, textarea);


keypress(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (ch, key) => {
  if (key && key.ctrl && (key.name === 'd' || key.name === 'q')) {
    process.stdin.pause();
    process.exit();
  } else if (key && key.ctrl && key.name === 'c') {
    textarea.content = '';
    logUpdate(tilto.render(root));
  } else {
    let character = ch;
    if (key && key.name === 'return') {
      character = '\n';
    }
    textarea.content += character;
    logUpdate(tilto.render(root));
  }
});

logUpdate(tilto.render(root));
