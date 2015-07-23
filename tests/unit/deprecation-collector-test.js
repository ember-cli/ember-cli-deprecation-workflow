import Ember from "ember";
import {module, test} from "qunit";

let originalLog;

module("deprecation collector", {
  beforeEach() {
    originalLog = Ember.Logger.log;
  },
  afterEach() {
    Ember.ENV.RAISE_ON_DEPRECATION = false;
    window.deprecationWorkflow.config = null;
    window.deprecationWorkflow.deprecationLog = { messages: {} };
    Ember.Logger.log = originalLog;
  }
});

test('calling flushDeprecations returns string of deprecations', (assert) => {
  Ember.deprecate('First deprecation');
  Ember.deprecate('Second deprecation');
  let deprecationsPayload = window.deprecationWorkflow.flushDeprecations();
  assert.equal(deprecationsPayload, `window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchMessage: \"First deprecation\" },
    { handler: "silence", matchMessage: \"Second deprecation\" }
  ]
};`);
});

test('deprecations are not duplicated', function(assert) {
  Ember.deprecate('First deprecation');
  Ember.deprecate('Second deprecation');

  // do it again
  Ember.deprecate('First deprecation');
  Ember.deprecate('Second deprecation');

  let deprecationsPayload = window.deprecationWorkflow.flushDeprecations();
  assert.equal(deprecationsPayload, `window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchMessage: \"First deprecation\" },
    { handler: "silence", matchMessage: \"Second deprecation\" }
  ]
};`);
});

test('deprecation silenced with string matcher', (assert) => {
  Ember.ENV.RAISE_ON_DEPRECATION = true;
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: "Interesting", handler: 'silence' }
    ]
  };
  Ember.deprecate('Interesting');
  assert.ok(true, 'Deprecation did not raise');
});

test('deprecation logs with string matcher', (assert) => {
  assert.expect(1);

  let message = 'Interesting';
  Ember.Logger.log = function(passedMessage) {
    assert.equal(passedMessage, message, 'deprecation logs');
  };
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: message, handler: 'log' }
    ]
  };
  Ember.deprecate(message);
});

test('deprecation thrown with string matcher', (assert) => {
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: "Interesting", handler: 'throw' }
    ]
  };
  assert.throws(function() {
    Ember.deprecate('Interesting');
  }, 'deprecation throws');
});

test('deprecation silenced with regex matcher', (assert) => {
  Ember.ENV.RAISE_ON_DEPRECATION = true;
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: /Inter/, handler: 'silence' }
    ]
  };
  Ember.deprecate('Interesting');
  assert.ok(true, 'Deprecation did not raise');
});

test('deprecation logs with regex matcher', (assert) => {
  assert.expect(1);

  let message = 'Interesting';
  Ember.Logger.log = function(passedMessage) {
    assert.equal(passedMessage, message, 'deprecation logs');
  };
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: /Inter/, handler: 'log' }
    ]
  };
  Ember.deprecate(message);
});

test('deprecation thrown with regex matcher', (assert) => {
  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: /Inter/, handler: 'throw' }
    ]
  };
  assert.throws(function() {
    Ember.deprecate('Interesting');
  }, 'deprecation throws');
});
