/* eslint no-console: 0 */
/* global QUnit */

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

  test('does not log at setup time', function (assert) {
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

  test('registers a QUnit.done callback that logs silenced pressing deprecation count', function (assert) {
    assert.expect(2);

    let registeredCallback;
    let originalQUnitDone = QUnit.done;
    QUnit.done = function (callback) {
      registeredCallback = callback;
    };

    let warnMessages = [];
    console.warn = function (message) {
      warnMessages.push(message);
    };

    setupDeprecationWorkflow({});
    QUnit.done = originalQUnitDone;

    // Simulate two pressing silenced deprecations discovered during the run
    self.deprecationWorkflow.pressingSilenced.add('ember.first');
    self.deprecationWorkflow.pressingSilenced.add('ember.second');

    assert.ok(registeredCallback, 'QUnit.done was called with a callback');
    registeredCallback();
    assert.ok(
      warnMessages.some((m) => m.includes('2 deprecation(s) silenced')),
      'QUnit.done callback logs the count of pressing silenced deprecations',
    );
  });

  test('QUnit.done callback logs nothing when no pressing deprecations are silenced', function (assert) {
    assert.expect(1);

    let registeredCallback;
    let originalQUnitDone = QUnit.done;
    QUnit.done = function (callback) {
      registeredCallback = callback;
    };

    let warnMessages = [];
    console.warn = function (message) {
      warnMessages.push(message);
    };

    setupDeprecationWorkflow({});
    QUnit.done = originalQUnitDone;

    // No pressing silenced deprecations
    registeredCallback();

    assert.strictEqual(
      warnMessages.length,
      0,
      'QUnit.done callback logs nothing when pressingSilenced is empty',
    );
  });
});
