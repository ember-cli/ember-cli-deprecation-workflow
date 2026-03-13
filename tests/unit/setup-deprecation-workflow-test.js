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

  test('prints count of silenced deprecations when there are silenced entries', function (assert) {
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

    assert.ok(
      warnMessages.some((m) => m.includes('2 deprecation(s) silenced')),
      'logs the number of silenced deprecations',
    );
  });

  test('does not print silenced count when no entries are silenced', function (assert) {
    assert.expect(1);

    let warnMessages = [];
    console.warn = function (message) {
      warnMessages.push(message);
    };

    setupDeprecationWorkflow({
      workflow: [
        { handler: 'log', matchId: 'first' },
        { handler: 'throw', matchId: 'second' },
      ],
    });

    assert.notOk(
      warnMessages.some((m) => m.includes('silenced')),
      'does not log silenced count when no entries are silenced',
    );
  });

  test('does not print silenced count when there is no workflow config', function (assert) {
    assert.expect(1);

    let warnMessages = [];
    console.warn = function (message) {
      warnMessages.push(message);
    };

    setupDeprecationWorkflow({});

    assert.notOk(
      warnMessages.some((m) => m.includes('silenced')),
      'does not log silenced count when there is no workflow',
    );
  });
});
