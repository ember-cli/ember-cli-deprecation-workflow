import { DEBUG } from '@glimmer/env'
import { test } from 'qunit';

export default function debugTest(description, callback) {
  return test(description, function (assert) {
    if (!DEBUG) {
      assert.ok(true, 'debug functions are disabled');
      return;
    }

    return callback.apply(this, arguments);
  });
}
