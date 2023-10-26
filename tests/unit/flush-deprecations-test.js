/* eslint no-console: 0 */

import { module } from 'qunit';
import test from '../helpers/debug-test';
import { flushDeprecations } from 'ember-cli-deprecation-workflow';

let originalWarn, originalConfig;

module('flushDeprecations', function (hooks) {
  hooks.beforeEach(function () {
    originalWarn = console.warn;

    /*
     * Clear config for these tests
     */
    originalConfig = self.deprecationWorkflow = {
      config: null,
      deprecationLog: {
        messages: [],
      },
    };
  });

  hooks.afterEach(function () {
    self.deprecationWorkflow.config = originalConfig;
    self.deprecationWorkflow.deprecationLog = { messages: {} };
    console.warn = originalWarn;
  });

  test('calling flushDeprecations returns string of deprecations', function (assert) {
    self.deprecationWorkflow.deprecationLog.messages = {
      first: '    { handler: "silence", matchId: "first" }',
      second: '    { handler: "silence", matchId: "second" }',
    };

    let deprecationsPayload = flushDeprecations();
    assert.strictEqual(
      deprecationsPayload,
      `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    { handler: "silence", matchId: "first" },
    { handler: "silence", matchId: "second" }
  ]
});`
    );
  });
});
