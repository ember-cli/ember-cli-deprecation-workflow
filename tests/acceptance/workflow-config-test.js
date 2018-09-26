import { deprecate } from '@ember/application/deprecations';
import Ember from "ember";
import { module } from "qunit";
import test from '../helpers/debug-test';

let originalWarn;

module("workflow config", function(hooks) {
  hooks.beforeEach(function() {
    originalWarn = window.Testem.handleConsoleMessage;
  });

  hooks.afterEach(function() {
    Ember.ENV.RAISE_ON_DEPRECATION = false;
    window.deprecationWorkflow.deprecationLog = { messages: { } };
    window.Testem.handleConsoleMessage = originalWarn;
  });

  test('deprecation silenced with string matcher', (assert) => {
    deprecate('silence-me', false, { until: 'forever', id: 'test' });
    assert.ok(true, 'Deprecation did not raise');
  });

  test('deprecation logs with string matcher', (assert) => {
    assert.expect(1);

    let message = 'log-me';
    window.Testem.handleConsoleMessage = function(passedMessage) {
      assert.ok(passedMessage.indexOf('DEPRECATION: ' + message) === 0, 'deprecation logs');
    };
    deprecate(message, false, { until: 'forever', id: 'test' });
  });

  test('deprecation thrown with string matcher', (assert) => {
    Ember.ENV.RAISE_ON_DEPRECATION = true;
    assert.throws(function() {
      deprecate('throw-me', false, { until: 'forever', id: 'test' });
    }, 'deprecation throws');
  });

  test('deprecation logs with id matcher', (assert) => {
    assert.expect(1);

    let message = 'log-id';
    let id = 'ember.workflow';
    let options = { id, until: '3.0.0' };
    let expected = `DEPRECATION: ${message}`;
    window.Testem.handleConsoleMessage = function(passedMessage) {
      assert.equal(passedMessage.substr(0, expected.length), expected, 'deprecation logs');
    };
    deprecate(message, false, options);
  });
});
