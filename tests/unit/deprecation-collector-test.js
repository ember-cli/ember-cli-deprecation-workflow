/* eslint no-console: 0 */

import { deprecate } from '@ember/application/deprecations';
import Ember from "ember";
import { module } from "qunit";
import test from '../helpers/debug-test';

let originalWarn;

module("deprecation collector", {
  beforeEach() {
    originalWarn = console.warn;
  },
  afterEach() {
    Ember.ENV.RAISE_ON_DEPRECATION = false;
    window.deprecationWorkflow.config = null;
    window.deprecationWorkflow.deprecationLog = { messages: {} };
    console.warn = originalWarn;
  }
});

test('calling flushDeprecations returns string of deprecations', (assert) => {
  deprecate('First deprecation', false, { id: 'first', until: 'forever' });
  deprecate('Second deprecation', false, { id: 'second', until: 'forever' });
  let deprecationsPayload = window.deprecationWorkflow.flushDeprecations();
  assert.equal(deprecationsPayload, `window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "first" },
    { handler: "silence", matchId: "second" }
  ]
};`);
});

test('deprecation does not choke when called with poorly formatted messages', (assert) => {
  deprecate('silence-me', undefined, undefined);
  assert.ok(true, 'Deprecation did not raise');
});

test('deprecations are not duplicated', function(assert) {
  deprecate('First deprecation', false, { id: 'first', until: 'forever' });
  deprecate('Second deprecation', false, { id: 'second', until: 'forever' });

  // do it again
  deprecate('First deprecation', false, { id: 'first', until: 'forever' });
  deprecate('Second deprecation', false, { id: 'second', until: 'forever' });

  let deprecationsPayload = window.deprecationWorkflow.flushDeprecations();
  assert.equal(deprecationsPayload, `window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "first" },
    { handler: "silence", matchId: "second" }
  ]
};`);
});

test('calling flushDeprecations without ID returns full message plus an additional deprecation for missing ID', (assert) => {
  deprecate('First deprecation', false, { until: 'forever' });
  deprecate('Second deprecation', false, { until: 'forever' });
  let deprecationsPayload = window.deprecationWorkflow.flushDeprecations();
  assert.ok(/{ handler: "silence", matchMessage: "First deprecation" }/.exec(deprecationsPayload), 'first deprecation message in log');
  assert.ok(/{ handler: "silence", matchMessage: "Second deprecation" }/.exec(deprecationsPayload), 'second deprecation in log');
});

test('deprecations message without IDs are not duplicated', function(assert) {
  deprecate('First deprecation', false, { until: 'forever' });
  deprecate('Second deprecation', false, { until: 'forever' });

  // do it again
  deprecate('First deprecation', false, { until: 'forever' });
  deprecate('Second deprecation', false, { until: 'forever' });

  let deprecationsPayload = window.deprecationWorkflow.flushDeprecations();
  assert.ok(/{ handler: "silence", matchMessage: "First deprecation" }/.exec(deprecationsPayload), 'first deprecation message in log');
  assert.ok(/{ handler: "silence", matchMessage: "Second deprecation" }/.exec(deprecationsPayload), 'second deprecation in log');
});

test('specifying `throwOnUnhandled` as true raises', function(assert) {
  assert.expect(2);

  Ember.ENV.RAISE_ON_DEPRECATION = false;

  window.deprecationWorkflow.config = {
    throwOnUnhandled: true,
    workflow: [
      { handler: 'silence', matchMessage: 'Sshhhhh!!' }
    ]
  };

  assert.throws(function() {
    deprecate('Foobarrrzzzz', false, { until: 'forever', id: 'foobar' });
  }, /Foobarrrzzzz/, 'setting raiseOnUnhandled throws for unknown workflows');

  deprecate('Sshhhhh!!', false, { id: 'quiet', until: 'forever' });
  assert.ok(true, 'did not throw when silenced');
});

test('specifying `throwOnUnhandled` as false does nothing', function(assert) {
  assert.expect(1);

  Ember.ENV.RAISE_ON_DEPRECATION = false;

  window.deprecationWorkflow.config = {
    throwOnUnhandled: false
  };

  deprecate('Sshhhhh!!', false, { id: 'quiet', until: 'forever' });
  assert.ok(true, 'does not die when throwOnUnhandled is false');
});

test('deprecation silenced with string matcher', (assert) => {
  Ember.ENV.RAISE_ON_DEPRECATION = true;
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: "Interesting", handler: 'silence' }
    ]
  };
  deprecate('Interesting', false, { id: 'interesting', until: 'forever' });
  assert.ok(true, 'Deprecation did not raise');
});

test('deprecation logs with string matcher', (assert) => {
  assert.expect(1);

  let message = 'Interesting';
  console.warn = function(passedMessage) {
    assert.ok(passedMessage.indexOf('DEPRECATION: ' + message) === 0, 'deprecation logs');
  };
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: message, handler: 'log' }
    ]
  };
  deprecate(message, false, { until: 'forever', id: 'interesting' });
});

test('deprecation thrown with string matcher', (assert) => {
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: "Interesting", handler: 'throw' }
    ]
  };
  assert.throws(function() {
    deprecate('Interesting', false, { id: 'interesting', until: 'forever' });
  }, 'deprecation throws');
});

test('deprecation silenced with regex matcher', (assert) => {
  Ember.ENV.RAISE_ON_DEPRECATION = true;
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: /Inter/, handler: 'silence' }
    ]
  };
  deprecate('Interesting', false, { id: 'interesting', until: 'forever' });
  assert.ok(true, 'Deprecation did not raise');
});

test('deprecation logs with regex matcher', (assert) => {
  assert.expect(1);

  let message = 'Interesting';
  console.warn = function(passedMessage) {
    assert.equal(passedMessage, 'DEPRECATION: ' + message, 'deprecation logs');
  };
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: /Inter/, handler: 'log' }
    ]
  };
  deprecate(message, false, { id: 'interesting', until: 'forever' });
});

test('deprecation thrown with regex matcher', (assert) => {
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: /Inter/, handler: 'throw' }
    ]
  };
  assert.throws(function() {
    deprecate('Interesting', false, { id: 'interesting', until: 'forever' });
  }, 'deprecation throws');
});

test('deprecation thrown with string matcher', (assert) => {
  let message = "Some string that includes ().  If treated like a regexp this will not match.";

  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: message, handler: 'throw' }
    ]
  };

  assert.throws(function() {
    deprecate(message, false, { id: 'throws', until: 'forever' });
  }, 'deprecation throws');
});

test('deprecation silenced with id matcher', (assert) => {
  Ember.ENV.RAISE_ON_DEPRECATION = true;
  window.deprecationWorkflow.config = {
    workflow: [
      { matchId: 'ember.deprecation-workflow', handler: 'silence' }
    ]
  };
  deprecate('Slightly interesting', false,
                  { id: 'ember.deprecation-workflow', until: '3.0.0' });
  assert.ok(true, 'Deprecation did not raise');
});

test('deprecation logs with id matcher', (assert) => {
  assert.expect(1);

  let message = 'Slightly interesting';
  console.warn = function(passedMessage) {
    assert.equal(passedMessage, 'DEPRECATION: ' + message, 'deprecation logs');
  };
  window.deprecationWorkflow.config = {
    workflow: [
      { matchId: 'ember.deprecation-workflow', handler: 'log' }
    ]
  };
  deprecate('Slightly interesting', false,
                  { id: 'ember.deprecation-workflow', until: '3.0.0' });
});

test('deprecation thrown with id matcher', (assert) => {
  window.deprecationWorkflow.config = {
    workflow: [
      { matchId: 'ember.deprecation-workflow', handler: 'throw' }
    ]
  };
  assert.throws(function() {
    deprecate('Slightly interesting', false,
                    { id: 'ember.deprecation-workflow', until: '3.0.0' });
  }, 'deprecation throws');
});

test('deprecation logging happens even if `throwOnUnhandled` is true', function(assert) {
  assert.expect(2);

  Ember.ENV.RAISE_ON_DEPRECATION = false;

  window.deprecationWorkflow.config = {
    throwOnUnhandled: true
  };

  assert.throws(function() {
    deprecate('Foobarrrzzzz', false, { id: 'foobar', until: 'forever' });
  }, /Foobarrrzzzz/, 'setting raiseOnUnhandled throws for unknown workflows');

  let result = window.deprecationWorkflow.flushDeprecations();

  assert.ok(/foobar/.exec(result), 'unhandled deprecation was added to the deprecationLog');
});
