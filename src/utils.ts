/*
 * This file MUST NOT depend on any file in the project.
 */

import * as ansiRegex from 'ansi-regex';
import * as stripAnsi from 'strip-ansi';

const ansiStyles = require('ansi-styles');

export type Coordinate = {
  x: number,
  y: number,
};

export type Size = {
  width: number,
  height: number,
};

/**
 * Split a string considering surrogate-pairs.
 */
function stringToArray(str: string): string[] {
  return str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
}

/**
 * @param character A single character with or without ANSI escape codes.
 *                  It is mainly assumed to pass the return value of "slice-ansi-string".
 */
export function decodeAnsiStyles(character: string): {
  foregroundColor: string | void,
  backgroundColor: string | void,
  bold: boolean,
  dim: boolean,
  italic: boolean,
  underline: boolean,
  inverse: boolean,
  hidden: boolean,
  strikethrough: boolean,
} {
  const characterWithoutAnsi = stripAnsi(character);
  if (stringToArray(characterWithoutAnsi).length !== 1) {
    throw new Error('It should be used for single characters.');
  }

  const ansiEscapeCodes = character.match(ansiRegex()) || [];

  // From https://github.com/chalk/ansi-styles#colors
  const foregroundColorNames = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    // NOTE: "blackBright" will be added in the following commit.
    //       https://github.com/chalk/ansi-styles/commit/fb5b656d9fce745881c36deb8ff800b5080d9f89
    'grey',
    //'blackBright',
    'redBright',
    'greenBright',
    'yellowBright',
    'blueBright',
    'magentaBright',
    'cyanBright',
    'whiteBright',
  ];
  let foregroundColor = undefined;
  ansiEscapeCodes.some(code => {
    const foundName = foregroundColorNames.find(name => {
      return code === (ansiStyles.color[name] && ansiStyles.color[name].open);
    });
    if (foundName) {
      foregroundColor = foundName;
      return true;
    }
    return false;
  });

  // From https://github.com/chalk/ansi-styles#background-colors
  const backgroundColorNames = [
    'bgBlack',
    'bgRed',
    'bgGreen',
    'bgYellow',
    'bgBlue',
    'bgMagenta',
    'bgCyan',
    'bgWhite',
    'bgBlackBright',
    'bgRedBright',
    'bgGreenBright',
    'bgYellowBright',
    'bgBlueBright',
    'bgMagentaBright',
    'bgCyanBright',
    'bgWhiteBright',
  ];
  let backgroundColor = undefined;
  ansiEscapeCodes.some(code => {
    const foundName = backgroundColorNames.find(name => {
      return code === (ansiStyles.bgColor[name] && ansiStyles.bgColor[name].open);
    });
    if (foundName) {
      backgroundColor = foundName;
      return true;
    }
    return false;
  });

  // From) https://github.com/chalk/ansi-styles#modifiers
  const modifiers = {
    bold: false,
    dim: false,
    italic: false,
    underline: false,
    inverse: false,
    hidden: false,
    strikethrough: false,
  };
  ansiEscapeCodes.forEach(code => {
    if (code === ansiStyles.bold.open) {
      modifiers.bold = true;
    } else if (code === ansiStyles.dim.open) {
      modifiers.dim = true;
    } else if (code === ansiStyles.italic.open) {
      modifiers.italic = true;
    } else if (code === ansiStyles.underline.open) {
      modifiers.underline = true;
    } else if (code === ansiStyles.inverse.open) {
      modifiers.inverse = true;
    } else if (code === ansiStyles.hidden.open) {
      modifiers.hidden = true;
    } else if (code === ansiStyles.strikethrough.open) {
      modifiers.strikethrough = true;
    }
  });

  return Object.assign(
    {
      foregroundColor,
      backgroundColor,
      bold: false,
      dim: false,
      italic: false,
      underline: false,
      inverse: false,
      hidden: false,
      strikethrough: false,
    },
    modifiers
  );
}
