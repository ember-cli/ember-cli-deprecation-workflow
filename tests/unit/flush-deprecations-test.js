/* eslint no-console: 0 */

import { module } from 'qunit';
import test from '../helpers/debug-test';
import { flushDeprecations } from '#src/index.js';

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
        messages: new Set(),
      },
    };
  });

  hooks.afterEach(function () {
    self.deprecationWorkflow.config = originalConfig;
    self.deprecationWorkflow.deprecationLog = { messages: new Set() };
    console.warn = originalWarn;
  });

  test('calling flushDeprecations returns workflow config', function (assert) {
    self.deprecationWorkflow.deprecationLog.messages = new Set([
      'first',
      'second',
    ]);

    let deprecationsPayload = flushDeprecations();
    let expectedConfig = {
      workflow: [
        { handler: 'silence', matchId: 'first' },
        { handler: 'silence', matchId: 'second' },
      ],
    };

    assert.strictEqual(
      deprecationsPayload,
      `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow(${JSON.stringify(expectedConfig, undefined, 2)});`,
    );
  });

  test('calling flushDeprecations with custom handler returns workflow config', function (assert) {
    self.deprecationWorkflow.deprecationLog.messages = new Set([
      'first',
      'second',
    ]);

    let deprecationsPayload = flushDeprecations({ handler: 'log' });
    let expectedConfig = {
      workflow: [
        { handler: 'log', matchId: 'first' },
        { handler: 'log', matchId: 'second' },
      ],
    };

    assert.strictEqual(
      deprecationsPayload,
      `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow(${JSON.stringify(expectedConfig, undefined, 2)});`,
    );
  });

  test('calling flushDeprecations with existing config and no deprecations returns original config', function (assert) {
    let config = {
      throwOnUnhandled: true,
      workflow: [{ handler: 'log', matchId: 'existing' }],
    };
    self.deprecationWorkflow.deprecationLog.messages = new Set([]);

    let deprecationsPayload = flushDeprecations({ config });
    assert.strictEqual(
      deprecationsPayload,
      `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow(${JSON.stringify(config, undefined, 2)});`,
    );
  });

  test('calling flushDeprecations with existing config returns augmented config', function (assert) {
    let config = {
      throwOnUnhandled: true,
      workflow: [{ handler: 'log', matchId: 'existing' }],
    };
    self.deprecationWorkflow.deprecationLog.messages = new Set([
      'first',
      'second',
    ]);

    let deprecationsPayload = flushDeprecations({ config });
    let expectedConfig = {
      throwOnUnhandled: true,
      workflow: [
        { handler: 'log', matchId: 'existing' },
        { handler: 'silence', matchId: 'first' },
        { handler: 'silence', matchId: 'second' },
      ],
    };
    assert.strictEqual(
      deprecationsPayload,
      `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow(${JSON.stringify(expectedConfig, undefined, 2)});`,
    );
  });

  test('calling flushDeprecations with existing config does not override existing deprecations', function (assert) {
    let config = {
      throwOnUnhandled: true,
      workflow: [{ handler: 'log', matchId: 'existing' }],
    };
    self.deprecationWorkflow.deprecationLog.messages = new Set([
      'first',
      'second',
      'existing',
    ]);

    let deprecationsPayload = flushDeprecations({ config });
    let expectedConfig = {
      throwOnUnhandled: true,
      workflow: [
        { handler: 'log', matchId: 'existing' },
        { handler: 'silence', matchId: 'first' },
        { handler: 'silence', matchId: 'second' },
      ],
    };
    assert.strictEqual(
      deprecationsPayload,
      `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow(${JSON.stringify(expectedConfig, undefined, 2)});`,
    );
  });
});
