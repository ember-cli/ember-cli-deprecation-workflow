import Ember from "ember";
import {module} from "qunit";
import test from '../helpers/debug-test';

let originalWarn;

module("workflow config", {
  beforeEach() {
    originalWarn = console.warn;
  },
  afterEach() {
    Ember.ENV.RAISE_ON_DEPRECATION = false;
    window.deprecationWorkflow.deprecationLog = { messages: { } };
    console.warn = originalWarn;
  }
});

test('deprecation silenced with string matcher', (assert) => {
  Ember.ENV.RAISE_ON_DEPRECATION = true;
  Ember.deprecate('silence-me', false, { until: 'forever', id: 'test' });
  assert.ok(true, 'Deprecation did not raise');
});

test('deprecation logs with string matcher', (assert) => {
  assert.expect(1);

  let message = 'log-me';
  console.warn = function(passedMessage) {
    assert.ok(passedMessage.indexOf('DEPRECATION: ' + message) === 0, 'deprecation logs');
  };
  Ember.deprecate(message, false, { until: 'forever', id: 'test' });
});

test('deprecation thrown with string matcher', (assert) => {
  assert.throws(function() {
    Ember.deprecate('throw-me', false, { until: 'forever', id: 'test' });
  }, 'deprecation throws');
});

test('deprecation logs with id matcher', (assert) => {
  assert.expect(1);

  let message = 'log-id',
    options = { id: 'ember.workflow', until: '3.0.0' };
  console.warn = function(passedMessage) {
    assert.equal(passedMessage, 'DEPRECATION: ' + message, 'deprecation logs');
  };
  Ember.deprecate(message, false, options);
});
