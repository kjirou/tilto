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

const createRoot = (width) => {
  const root = tilto.createBox({width, height: 20});
  root.borders = tilto.createBordersByType('default');
  const trackElement = tilto.createElementBody(' ');
  trackElement.style.backgroundColor = 'bgWhite';
  const thumbElement = tilto.createElementBody(' ');
  thumbElement.style.backgroundColor = 'bgBlackBright';
  root.scroll = {
    y: 0,
    thumbElement,
    trackElement,
  };
  root.content = `　メロスは激怒した。必ず、かの邪智暴虐じゃちぼうぎゃくの王を除かなければならぬと決意した。メロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。きょう未明メロスは村を出発し、野を越え山越え、十里はなれた此このシラクスの市にやって来た。メロスには父も、母も無い。女房も無い。十六の、内気な妹と二人暮しだ。この妹は、村の或る律気な一牧人を、近々、花婿はなむことして迎える事になっていた。結婚式も間近かなのである。メロスは、それゆえ、花嫁の衣裳やら祝宴の御馳走やらを買いに、はるばる市にやって来たのだ。先ず、その品々を買い集め、それから都の大路をぶらぶら歩いた。メロスには竹馬の友があった。セリヌンティウスである。今は此のシラクスの市で、石工をしている。その友を、これから訪ねてみるつもりなのだ。久しく逢わなかったのだから、訪ねて行くのが楽しみである。歩いているうちにメロスは、まちの様子を怪しく思った。ひっそりしている。もう既に日も落ちて、まちの暗いのは当りまえだが、けれども、なんだか、夜のせいばかりでは無く、市全体が、やけに寂しい。のんきなメロスも、だんだん不安になって来た。路で逢った若い衆をつかまえて、何かあったのか、二年まえに此の市に来たときは、夜でも皆が歌をうたって、まちは賑やかであった筈はずだが、と質問した。若い衆は、首を振って答えなかった。しばらく歩いて老爺ろうやに逢い、こんどはもっと、語勢を強くして質問した。老爺は答えなかった。メロスは両手で老爺のからだをゆすぶって質問を重ねた。老爺は、あたりをはばかる低声で、わずか答えた。
  「王様は、人を殺します。」
  「なぜ殺すのだ。」
  「悪心を抱いている、というのですが、誰もそんな、悪心を持っては居りませぬ。」
  「たくさんの人を殺したのか。」
  「はい、はじめは王様の妹婿さまを。それから、御自身のお世嗣よつぎを。それから、妹さまを。それから、妹さまの御子さまを。それから、皇后さまを。それから、賢臣のアレキス様を。」
  「おどろいた。国王は乱心か。」
  「いいえ、乱心ではございませぬ。人を、信ずる事が出来ぬ、というのです。このごろは、臣下の心をも、お疑いになり、少しく派手な暮しをしている者には、人質ひとりずつ差し出すことを命じて居ります。御命令を拒めば十字架にかけられて、殺されます。きょうは、六人殺されました。」
  　聞いて、メロスは激怒した。「呆あきれた王だ。生かして置けぬ。」`;
  return root;
};
let root = createRoot(40);

keypress(process.stdin);
process.stdin.setRawMode(true);

process.stdin.on('keypress', (ch, key) => {
  if (key && key.ctrl && (key.name === 'd' || key.name === 'q')) {
    process.stdin.pause();
    process.exit();
  } else if (key.name === 'w') {
    root = createRoot(tilto.getWidth(root) + 1);
    logUpdate(tilto.render(root));
  } else if (key.name === 's') {
    root = createRoot(tilto.getWidth(root) - 1);
    logUpdate(tilto.render(root));
  } else if (key.name === 'up') {
    root.scroll.y = root.scroll.y - 1;
    logUpdate(tilto.render(root));
  } else if (key.name === 'down') {
    root.scroll.y = root.scroll.y + 1;
    logUpdate(tilto.render(root));
  }
});

logUpdate(tilto.render(root));
