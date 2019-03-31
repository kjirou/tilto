import * as assert from 'assert';
import * as util from 'util';

import {
  validateSize,
} from '../src/utils';

describe('utils', function() {
  describe('validateSize', function() {
    [
      {subject: {width: 0, height: 0}, expected: true},
      {subject: {width: 1, height: 0}, expected: true},
      {subject: {width: 0, height: 1}, expected: true},
      {subject: {width: -1, height: 0}, expected: false},
      {subject: {width: 0, height: -1}, expected: false},
      {subject: {width: 0.1, height: 0}, expected: false},
      {subject: {width: 0, height: 0.1}, expected: false},
      {subject: {width: -0.1, height: 0}, expected: false},
      {subject: {width: 0, height: -0.1}, expected: false},
    ].forEach(({subject, expected}) => {
      it(`${util.inspect(subject)} -> ${expected}`, function() {
        assert.strictEqual(validateSize(subject), expected);
      });
    });
  });
});
