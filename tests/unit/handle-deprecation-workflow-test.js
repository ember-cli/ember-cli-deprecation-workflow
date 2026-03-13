/* eslint no-console: 0 */

import { module } from 'qunit';
import test from '../helpers/debug-test';
import { handleDeprecationWorkflow } from '#src/index.js';

let originalWarn, originalConfig;

module('handleDeprecationWorkflow', function (hooks) {
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

  test('specifying `throwOnUnhandled` as true raises', function (assert) {
    const config = {
      throwOnUnhandled: true,
      workflow: [{ handler: 'silence', matchMessage: 'Sshhhhh!!' }],
    };

    assert.throws(
      function () {
        handleDeprecationWorkflow(
          config,
          'Foobarrrzzzz',
          {
            since: 'the beginning',
            until: 'forever',
            id: 'foobar',
            for: 'testing',
          },
          () => {},
        );
      },
      /Foobarrrzzzz/,
      'setting raiseOnUnhandled throws for unknown workflows',
    );

    handleDeprecationWorkflow(
      config,
      'Sshhhhh!!',
      {
        id: 'quiet',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );
    assert.ok(true, 'did not throw when silenced');
  });

  test('specifying `throwOnUnhandled` as false does nothing', function (assert) {
    const config = {
      throwOnUnhandled: false,
    };

    handleDeprecationWorkflow(
      config,
      'Sshhhhh!!',
      {
        id: 'quiet',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );

    assert.ok(true, 'does not die when throwOnUnhandled is false');
  });

  test('deprecation silenced with string matcher', function (assert) {
    const config = {
      throwOnUnhandled: true,
      workflow: [{ matchMessage: 'Interesting', handler: 'silence' }],
    };

    handleDeprecationWorkflow(config, 'Interesting', {
      id: 'interesting',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
    assert.ok(true, 'Deprecation did not raise');
  });

  test('deprecation logs with string matcher', function (assert) {
    assert.expect(1);

    let message = 'Interesting';
    console.warn = function (passedMessage) {
      assert.strictEqual(
        passedMessage.indexOf('DEPRECATION: ' + message),
        0,
        'deprecation logs',
      );
    };

    const config = {
      throwOnUnhandled: true,
      workflow: [{ matchMessage: message, handler: 'log' }],
    };

    handleDeprecationWorkflow(
      config,
      message,
      {
        since: 'the beginning',
        until: 'forever',
        id: 'interesting',
        for: 'testing',
      },
      () => {},
    );
  });

  test('deprecation thrown with string matcher', function (assert) {
    const config = {
      workflow: [{ matchMessage: 'Interesting', handler: 'throw' }],
    };

    assert.throws(function () {
      handleDeprecationWorkflow(
        config,
        'Interesting',
        {
          id: 'interesting',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        },
        () => {},
      );
    }, 'deprecation throws');
  });

  test('deprecation silenced with regex matcher', function (assert) {
    const config = {
      throwOnUnhandled: true,
      workflow: [{ matchMessage: /Inter/, handler: 'silence' }],
    };

    handleDeprecationWorkflow(
      config,
      'Interesting',
      {
        id: 'interesting',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );

    assert.ok(true, 'Deprecation did not raise');
  });

  test('deprecation logs with regex matcher', function (assert) {
    assert.expect(1);

    let message = 'Interesting';

    console.warn = function (passedMessage) {
      assert.strictEqual(
        passedMessage,
        'DEPRECATION: ' + message,
        'deprecation logs',
      );
    };

    const config = {
      throwOnUnhandled: true,
      workflow: [{ matchMessage: /Inter/, handler: 'log' }],
    };

    handleDeprecationWorkflow(
      config,
      message,
      {
        id: 'interesting',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      },
      () => {},
    );
  });

  test('deprecation thrown with regex matcher', function (assert) {
    const config = {
      workflow: [{ matchMessage: /Inter/, handler: 'throw' }],
    };

    assert.throws(function () {
      handleDeprecationWorkflow(
        config,
        'Interesting',
        {
          id: 'interesting',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        },
        () => {},
      );
    }, 'deprecation throws');
  });

  test('deprecation thrown with string matcher with parens', function (assert) {
    let message =
      'Some string that includes ().  If treated like a regexp this will not match.';

    const config = {
      workflow: [{ matchMessage: message, handler: 'throw' }],
    };

    assert.throws(function () {
      handleDeprecationWorkflow(
        config,
        message,
        {
          id: 'throws',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        },
        () => {},
      );
    }, 'deprecation throws');
  });

  test('deprecation silenced with id matcher', function (assert) {
    const config = {
      throwOnUnhandled: true,
      workflow: [{ matchId: 'ember.deprecation-workflow', handler: 'silence' }],
    };

    handleDeprecationWorkflow(
      config,
      'Slightly interesting',
      {
        id: 'ember.deprecation-workflow',
        since: 'the beginning',
        until: '3.0.0',
        for: 'testing',
      },
      () => {},
    );

    assert.ok(true, 'Deprecation did not raise');
  });

  test('deprecation logs with id matcher', function (assert) {
    assert.expect(1);

    let message = 'Slightly interesting';

    console.warn = function (passedMessage) {
      assert.strictEqual(
        passedMessage,
        'DEPRECATION: ' + message,
        'deprecation logs',
      );
    };

    const config = {
      throwOnUnhandled: true,
      workflow: [{ matchId: 'ember.deprecation-workflow', handler: 'log' }],
    };

    handleDeprecationWorkflow(
      config,
      'Slightly interesting',
      {
        id: 'ember.deprecation-workflow',
        since: 'the beginning',
        until: '3.0.0',
        for: 'testing',
      },
      () => {},
    );
  });

  test('deprecation thrown with id matcher', function (assert) {
    const config = {
      workflow: [{ matchId: 'ember.deprecation-workflow', handler: 'throw' }],
    };
    assert.throws(function () {
      handleDeprecationWorkflow(
        config,
        'Slightly interesting',
        {
          id: 'ember.deprecation-workflow',
          since: 'the beginning',
          until: '3.0.0',
          for: 'testing',
        },
        () => {},
      );
    }, 'deprecation throws');
  });

  test('deprecation silenced with id regex', function (assert) {
    const config = {
      throwOnUnhandled: true,
      workflow: [{ matchId: /^ember\..*/, handler: 'silence' }],
    };

    handleDeprecationWorkflow(
      config,
      'Slightly interesting',
      {
        id: 'ember.deprecation-workflow',
        since: 'the beginning',
        until: '3.0.0',
        for: 'testing',
      },
      () => {},
    );

    assert.ok(true, 'Deprecation did not raise');
  });

  test('deprecation logs with id regex', function (assert) {
    assert.expect(1);

    let message = 'Slightly interesting';

    console.warn = function (passedMessage) {
      assert.strictEqual(
        passedMessage,
        'DEPRECATION: ' + message,
        'deprecation logs',
      );
    };

    const config = {
      throwOnUnhandled: true,
      workflow: [{ matchId: /^ember\..*/, handler: 'log' }],
    };

    handleDeprecationWorkflow(
      config,
      'Slightly interesting',
      {
        id: 'ember.deprecation-workflow',
        since: 'the beginning',
        until: '3.0.0',
        for: 'testing',
      },
      () => {},
    );
  });

  test('deprecation thrown with id regex', function (assert) {
    const config = {
      workflow: [{ matchId: /^ember\..*/, handler: 'throw' }],
    };
    assert.throws(function () {
      handleDeprecationWorkflow(
        config,
        'Slightly interesting',
        {
          id: 'ember.deprecation-workflow',
          since: 'the beginning',
          until: '3.0.0',
          for: 'testing',
        },
        () => {},
      );
    }, 'deprecation throws');
  });

  test('pressing ember-source deprecation is tracked in pressingSilenced Set', function (assert) {
    assert.expect(2);

    self.deprecationWorkflow.pressingSilenced = new Set();

    const config = {
      workflow: [{ matchId: /^ember\..*/, handler: 'silence' }],
    };

    handleDeprecationWorkflow(
      config,
      'Some ember deprecation',
      {
        id: 'ember.some-feature',
        since: '6.0.0',
        until: '7.0',
        for: 'ember-source',
      },
      () => {},
    );

    assert.strictEqual(
      self.deprecationWorkflow.pressingSilenced.size,
      1,
      'pressing ember-source deprecation is added to the Set',
    );
    assert.ok(
      self.deprecationWorkflow.pressingSilenced.has('ember.some-feature'),
      'Set contains the deprecation id',
    );
  });

  test('pressing ember-source deprecation is only counted once per unique id', function (assert) {
    assert.expect(1);

    self.deprecationWorkflow.pressingSilenced = new Set();

    const config = {
      workflow: [{ matchId: /^ember\..*/, handler: 'silence' }],
    };

    const options = {
      id: 'ember.some-feature',
      since: '6.0.0',
      until: '7.0',
      for: 'ember-source',
    };

    handleDeprecationWorkflow(
      config,
      'Some ember deprecation',
      options,
      () => {},
    );
    handleDeprecationWorkflow(
      config,
      'Some ember deprecation',
      options,
      () => {},
    );
    handleDeprecationWorkflow(
      config,
      'Some ember deprecation',
      options,
      () => {},
    );

    assert.strictEqual(
      self.deprecationWorkflow.pressingSilenced.size,
      1,
      'Set contains only one entry after repeated firings of the same deprecation',
    );
  });

  test('multiple distinct pressing ember-source deprecations are all tracked', function (assert) {
    assert.expect(1);

    self.deprecationWorkflow.pressingSilenced = new Set();

    const config = {
      workflow: [{ matchId: /^ember\..*/, handler: 'silence' }],
    };

    handleDeprecationWorkflow(
      config,
      'First ember deprecation',
      { id: 'ember.first', since: '6.0.0', until: '7.0', for: 'ember-source' },
      () => {},
    );

    handleDeprecationWorkflow(
      config,
      'Second ember deprecation',
      { id: 'ember.second', since: '6.0.0', until: '7.0', for: 'ember-source' },
      () => {},
    );

    assert.strictEqual(
      self.deprecationWorkflow.pressingSilenced.size,
      2,
      'Set contains both deprecation ids',
    );
  });

  test('deprecation silenced for ember-source with non-approaching until is not tracked', function (assert) {
    assert.expect(1);

    self.deprecationWorkflow.pressingSilenced = new Set();

    const config = {
      workflow: [{ matchId: 'ember.far-future', handler: 'silence' }],
    };

    // 8.0 is not approaching from 6.11.0 (two major versions ahead)
    handleDeprecationWorkflow(
      config,
      'Far future ember deprecation',
      {
        id: 'ember.far-future',
        since: '6.0.0',
        until: '8.0',
        for: 'ember-source',
      },
      () => {},
    );

    assert.strictEqual(
      self.deprecationWorkflow.pressingSilenced.size,
      0,
      'non-approaching deprecation is not tracked',
    );
  });

  test('deprecation silenced for non-ember-source is not tracked', function (assert) {
    assert.expect(1);

    self.deprecationWorkflow.pressingSilenced = new Set();

    const config = {
      workflow: [{ matchId: 'some-addon.feature', handler: 'silence' }],
    };

    handleDeprecationWorkflow(
      config,
      'Some addon deprecation',
      {
        id: 'some-addon.feature',
        since: '1.0.0',
        until: '7.0',
        for: 'some-addon',
      },
      () => {},
    );

    assert.strictEqual(
      self.deprecationWorkflow.pressingSilenced.size,
      0,
      'non-ember-source deprecation is not tracked',
    );
  });
});
