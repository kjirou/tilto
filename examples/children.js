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

const ANSI_RED = '\u001b[31m';
const ANSI_GREEN = '\u001b[32m';
const ANSI_RESET = '\u001b[0m';

let root = tilto.createBox({width: 80, height: 20});

const sideBar = tilto.createBox({width: 20, height: 20});
sideBar.borders = tilto.createBordersByType('default');
sideBar.content = `Channels
#elona
#ftl
${ANSI_GREEN}#rimworld
#stellaris
#skyrim${ANSI_RESET}
#tome4

Direct Messages
@slackbot
@kjirou
@foo
@bart`;

const messageListContainer = tilto.createBox({x: 20, width: 60, height: 20});
Object.assign(messageListContainer.borders, {
  topWidth: 1,
  bottomWidth: 1,
  rightWidth: 1,
  topSymbols: ['-'],
  bottomSymbols: ['-'],
  rightSymbols: ['|'],
  topRightSymbols: ['+'],
  bottomRightSymbols: ['+'],
});
messageListContainer.content = `  あああああああああああああああああ！
  うああああああああああ！

kjirou 1:17PM
　ああああああああああああああああああああああ！
　ふああああああああああああああああああ！

kjirou 2:33PM
　この${ANSI_RED}一部は赤い${ANSI_RESET}です！
　ぶるあああああああああああああ！

kjirou 3:12PM
  今日も一日あああああああああああ！
  はあああああああああ！
`;

const messageInput = tilto.createBox({y: 15, width: 59, height: 4});
Object.assign(messageInput.borders, {
  topWidth: 1,
  topSymbols: ['-'],
});
messageInput.content = '5000兆円欲しい_';

messageListContainer.children.push(messageInput);
root.children.push(sideBar, messageListContainer);

console.log(tilto.render(root));
