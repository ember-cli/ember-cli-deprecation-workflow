import { deprecate } from '@ember/debug';
import { module } from 'qunit';
import test from '../helpers/debug-test';

let originalWarn;

module('flushDeprecations', function (hooks) {
  hooks.beforeEach(function () {
    originalWarn = window.Testem.handleConsoleMessage;
  });

  hooks.afterEach(function () {
    window.deprecationWorkflow.deprecationLog = { messages: {} };
    window.Testem.handleConsoleMessage = originalWarn;
  });

  test('works', function (assert) {
    deprecate('silence-strict', false, {
      since: '2.0.0',
      until: 'forever',
      id: 'test',
      for: 'testing',
    });

    deprecate('log-strict', false, {
      since: '2.0.0',
      until: 'forever',
      id: 'test',
      for: 'testing',
    });

    deprecate(' foo log-match foo', false, {
      since: 'now',
      until: 'forever',
      id: 'test',
      for: 'testing',
    });

    deprecate(' foo foo', false, {
      since: 'now',
      until: 'forever',
      id: 'log-strict',
      for: 'testing',
    });

    deprecate('arbitrary-unmatched-message', false, {
      id: 'log-strict',
      since: '2.0.0',
      until: '3.0.0',
      for: 'testing',
    });

    const deprecationsPayload = self.deprecationWorkflow.flushDeprecations();

    assert.strictEqual(
      deprecationsPayload,
      `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
    { handler: "silence", matchId: "test" },
    { handler: "silence", matchId: "log-strict" }
  ]
});`,
    );
  });
});
