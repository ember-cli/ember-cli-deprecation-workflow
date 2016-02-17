import Ember from 'ember';
import { test } from 'qunit';

let canRunDebugFunctions = false;

Ember.runInDebug(() => canRunDebugFunctions = true);

export default function debugTest(description, callback) {
  return test(description, function(assert) {
    if (!canRunDebugFunctions) {
      assert.ok(true, 'debug functions are disabled');
      return;
    }

    return callback.apply(this, arguments);
  });
}
