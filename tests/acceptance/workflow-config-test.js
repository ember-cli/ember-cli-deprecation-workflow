import Ember from "ember";
import {module, test} from "qunit";

let originalLog;

module("workflow config", {
  beforeEach() {
    originalLog = Ember.Logger.log;
  },
  afterEach() {
    Ember.ENV.RAISE_ON_DEPRECATION = false;
    window.deprecationWorkflow.deprecationLog = { messages: { } };
    Ember.Logger.log = originalLog;
  }
});

test('deprecation silenced with string matcher', (assert) => {
  Ember.ENV.RAISE_ON_DEPRECATION = true;
  Ember.deprecate('silence-me');
  assert.ok(true, 'Deprecation did not raise');
});

test('deprecation logs with string matcher', (assert) => {
  assert.expect(1);

  let message = 'log-me';
  Ember.Logger.log = function(passedMessage) {
    assert.equal(passedMessage, message, 'deprecation logs');
  };
  Ember.deprecate(message);
});

test('deprecation thrown with string matcher', (assert) => {
  assert.throws(function() {
    Ember.deprecate('throw-me');
  }, 'deprecation throws');
});
