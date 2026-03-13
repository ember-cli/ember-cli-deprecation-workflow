/* eslint no-console: 0 */

import { module } from 'qunit';
import test from '../helpers/debug-test';
import setupDeprecationWorkflow from '#src/index.js';

let originalWarn;

module('setupDeprecationWorkflow', function (hooks) {
  hooks.beforeEach(function () {
    originalWarn = console.warn;
    self.deprecationWorkflow = undefined;
  });

  hooks.afterEach(function () {
    console.warn = originalWarn;
  });

  test('initializes pressingSilenced as an empty Set', function (assert) {
    setupDeprecationWorkflow({
      workflow: [
        { handler: 'silence', matchId: 'first' },
        { handler: 'silence', matchId: 'second' },
      ],
    });

    assert.ok(
      self.deprecationWorkflow.pressingSilenced instanceof Set,
      'pressingSilenced is a Set',
    );
    assert.strictEqual(
      self.deprecationWorkflow.pressingSilenced.size,
      0,
      'pressingSilenced starts empty',
    );
  });

  test('does not log at setup time, even with silenced entries', function (assert) {
    assert.expect(1);

    let warnMessages = [];
    console.warn = function (message) {
      warnMessages.push(message);
    };

    setupDeprecationWorkflow({
      workflow: [
        { handler: 'silence', matchId: 'first' },
        { handler: 'silence', matchId: 'second' },
        { handler: 'log', matchId: 'third' },
      ],
    });

    assert.strictEqual(
      warnMessages.length,
      0,
      'no warnings are emitted at setup time',
    );
  });
});
