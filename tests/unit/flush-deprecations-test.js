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

  test('calling flushDeprecations returns workflow config', function (assert) {
    self.deprecationWorkflow.deprecationLog.messages = {
      first: 'matchId',
      second: 'matchId',
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
});`,
    );
  });

  test('calling flushDeprecations with custom handler returns workflow config', function (assert) {
    self.deprecationWorkflow.deprecationLog.messages = {
      first: 'matchId',
      second: 'matchId',
    };

    let deprecationsPayload = flushDeprecations({ handler: 'log' });
    assert.strictEqual(
      deprecationsPayload,
      `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    { handler: "log", matchId: "first" },
    { handler: "log", matchId: "second" }
  ]
});`,
    );
  });
});
