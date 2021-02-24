import { runInDebug } from '@ember/debug';
import { test } from 'qunit';

let canRunDebugFunctions = false;

runInDebug(() => (canRunDebugFunctions = true));

export default function debugTest(description, callback) {
  return test(description, function (assert) {
    if (!canRunDebugFunctions) {
      assert.ok(true, 'debug functions are disabled');
      return;
    }

    return callback.apply(this, arguments);
  });
}
