import Ember from "ember";
import {module, test} from "qunit";

let originalWarn;

module("deprecation collector", {
  beforeEach() {
    originalWarn = Ember.Logger.warn;
  },
  afterEach() {
    Ember.ENV.RAISE_ON_DEPRECATION = false;
    window.deprecationWorkflow.config = null;
    window.deprecationWorkflow.deprecationLog = { messages: {} };
    Ember.Logger.warn = originalWarn;
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
    Ember.deprecate('Foobarrrzzzz');
  }, /Foobarrrzzzz/, 'setting raiseOnUnhandled throws for unknown workflows');

  Ember.deprecate('Sshhhhh!!');
  assert.ok(true, 'did not throw when silenced');
});

test('specifying `throwOnUnhandled` as false does nothing', function(assert) {
  assert.expect(1);

  Ember.ENV.RAISE_ON_DEPRECATION = false;

  window.deprecationWorkflow.config = {
    throwOnUnhandled: false
  };

  Ember.deprecate('Sshhhhh!!');
  assert.ok(true, 'does not die when throwOnUnhandled is false');
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
  Ember.Logger.warn = function(passedMessage) {
    assert.equal(passedMessage, 'DEPRECATION: ' + message, 'deprecation logs');
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
  Ember.Logger.warn = function(passedMessage) {
    assert.equal(passedMessage, 'DEPRECATION: ' + message, 'deprecation logs');
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

test('deprecation thrown with string matcher', (assert) => {
  let message = "Some string that includes ().  If treated like a regexp this will not match.";

  window.deprecationWorkflow.config = {
    workflow: [
      { matchMessage: message, handler: 'throw' }
    ]
  };

  assert.throws(function() {
    Ember.deprecate(message);
  }, 'deprecation throws');
});

test('deprecation logging happens even if `throwOnUnhandled` is true', function(assert) {
  assert.expect(2);

  Ember.ENV.RAISE_ON_DEPRECATION = false;

  window.deprecationWorkflow.config = {
    throwOnUnhandled: true
  };

  assert.throws(function() {
    Ember.deprecate('Foobarrrzzzz');
  }, /Foobarrrzzzz/, 'setting raiseOnUnhandled throws for unknown workflows');

  let result = window.deprecationWorkflow.flushDeprecations();

  assert.ok(/Foobarrrzzzz/.exec(result), 'unhandled deprecation was added to the deprecationLog');
});
