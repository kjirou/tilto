# tilto

A TUI (Text User Interface) renderer


## Installation
```bash
npm install tilto
```


## Usage

```js
const tilto = require('tilto');

let box = tilto.createBox({width: 20, height: 5});
box = tilto.setBorderType(box, 'default');
box.content = 'The quick brown fox jumps over the lazy dog.';

console.log(tilto.render(box));
// -> +------------------+
//    |The quick brown fo|
//    |x jumps over the l|
//    |azy dog.          |
//    +------------------+
```

See also [examples](/examples).
