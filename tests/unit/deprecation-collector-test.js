/* eslint-disable qunit/require-expect */
/* eslint no-console: 0 */

import { module } from 'qunit';
import test from '../helpers/debug-test';
import { deprecationCollector } from 'ember-cli-deprecation-workflow';

let originalWarn, originalConfig;

module('deprecationCollector', function (hooks) {
  hooks.beforeEach(function () {
    originalWarn = console.warn;

    /*
     * Clear config for these tests
     */
    originalConfig = self.deprecationWorkflow = {
      config: null,
      deprecationLog: {
        messages: {},
      },
    };
  });

  hooks.afterEach(function () {
    self.deprecationWorkflow.config = originalConfig;
    self.deprecationWorkflow.deprecationLog = { messages: {} };
    console.warn = originalWarn;
  });

  test('it collects deprecations', function (assert) {
    deprecationCollector(
      'First deprecation',
      {
        id: 'first',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );
    deprecationCollector(
      'Second deprecation',
      {
        id: 'second',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );

    assert.deepEqual(self.deprecationWorkflow.deprecationLog.messages, {
      first: 'matchId',
      second: 'matchId',
    });
  });

  test('should call next', function (assert) {
    assert.expect(1);

    function next() {
      assert.ok(true, 'next has been called');
    }

    deprecationCollector(
      'First deprecation',
      {
        id: 'first',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      next,
    );
  });

  test('deprecations are not duplicated', function (assert) {
    deprecationCollector(
      'First deprecation',
      {
        id: 'first',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );
    deprecationCollector(
      'Second deprecation',
      {
        id: 'second',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );

    // do it again
    deprecationCollector(
      'First deprecation',
      {
        id: 'first',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );
    deprecationCollector(
      'Second deprecation',
      {
        id: 'second',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );

    assert.deepEqual(self.deprecationWorkflow.deprecationLog.messages, {
      first: 'matchId',
      second: 'matchId',
    });
  });
});
