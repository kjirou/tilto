# tilto

[![Build Status](https://travis-ci.org/kjirou/tilto.svg?branch=master)](https://travis-ci.org/kjirou/tilto)

A TUI (Text User Interface) renderer


## :rocket: Installation

```bash
npm install tilto
```


## :eyes: Overview

```js
const tilto = require('tilto');

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
```

:point_down:

![](/documents/overview-output.png)

See also [examples](/examples).


## :page_facing_up: About Basic Design

The `render` method receives a syntax tree expressed by pure-object and converts it to a rectangular string.

You can change the output by modifying the arguments according to the schema.
Also, [some utilities for that are defined as public API](/src/index.ts).

In this case, it is recommended to use a library that can safely update objects such as [immer](https://github.com/mweststrate/immer).

The schema of that is the following image if it is expressed by TypeScript.
If you want to know more about schema, please refer to the source code.

```ts
type Box = {
  borders: Borders;
  children: Box[];
  content: string,
  matrix: Matrix,
  scroll?: {
    thumbElement?: ElementBody,
    trackElement?: ElementBody,
    y: number,
  },
  symbolRuler: SymbolRuler,
  x: number,
  y: number,
  zIndex: number,
};
```


## :wrench: Development
### Softwares that needs to be locally installed

- [Node.js](https://nodejs.org/) `== 10`

### Install this application

```bash
git clone git@github.com:kjirou/tit.git
cd ./tilto
npm install
```
