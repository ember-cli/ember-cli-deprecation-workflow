/* eslint-disable qunit/require-expect */
/* eslint no-console: 0 */

import { deprecate } from '@ember/debug';
import { module } from 'qunit';
import test from '../helpers/debug-test';

let originalWarn, originalConfig;

module('deprecation collector', function (hooks) {
  hooks.beforeEach(function () {
    originalWarn = console.warn;

    /*
     * Clear config for these tests
     */
    originalConfig = self.deprecationWorkflow.config;
    self.deprecationWorkflow.config = null;
  });

  hooks.afterEach(function () {
    self.deprecationWorkflow.config = originalConfig;
    self.deprecationWorkflow.deprecationLog = { messages: {} };
    console.warn = originalWarn;
  });

  test('calling flushDeprecations returns string of deprecations', function (assert) {
    deprecate('First deprecation', false, {
      id: 'first',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
    deprecate('Second deprecation', false, {
      id: 'second',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
    let deprecationsPayload = self.deprecationWorkflow.flushDeprecations();
    assert.strictEqual(
      deprecationsPayload,
      `self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "first" },
    { handler: "silence", matchId: "second" }
  ]
};`,
    );
  });

  test('deprecations are not duplicated', function (assert) {
    deprecate('First deprecation', false, {
      id: 'first',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
    deprecate('Second deprecation', false, {
      id: 'second',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });

    // do it again
    deprecate('First deprecation', false, {
      id: 'first',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
    deprecate('Second deprecation', false, {
      id: 'second',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });

    let deprecationsPayload = self.deprecationWorkflow.flushDeprecations();
    assert.strictEqual(
      deprecationsPayload,
      `self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: "silence", matchId: "first" },
    { handler: "silence", matchId: "second" }
  ]
};`,
    );
  });

  test('specifying `throwOnUnhandled` as true raises', function (assert) {
    assert.expect(2);

    self.deprecationWorkflow.config = {
      throwOnUnhandled: true,
      workflow: [{ handler: 'silence', matchMessage: 'Sshhhhh!!' }],
    };

    assert.throws(
      function () {
        deprecate('Foobarrrzzzz', false, {
          since: 'the beginning',
          until: 'forever',
          id: 'foobar',
          for: 'testing',
        });
      },
      /Foobarrrzzzz/,
      'setting raiseOnUnhandled throws for unknown workflows',
    );

    deprecate('Sshhhhh!!', false, {
      id: 'quiet',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
    assert.ok(true, 'did not throw when silenced');
  });

  test('specifying `throwOnUnhandled` as false does nothing', function (assert) {
    assert.expect(1);

    self.deprecationWorkflow.config = {
      throwOnUnhandled: false,
    };

    deprecate('Sshhhhh!!', false, {
      id: 'quiet',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
    assert.ok(true, 'does not die when throwOnUnhandled is false');
  });

  test('deprecation silenced with string matcher', function (assert) {
    self.deprecationWorkflow.config = {
      workflow: [{ matchMessage: 'Interesting', handler: 'silence' }],
    };
    deprecate('Interesting', false, {
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
    self.deprecationWorkflow.config = {
      workflow: [{ matchMessage: message, handler: 'log' }],
    };
    deprecate(message, false, {
      since: 'the beginning',
      until: 'forever',
      id: 'interesting',
      for: 'testing',
    });
  });

  test('deprecation thrown with string matcher', function (assert) {
    self.deprecationWorkflow.config = {
      workflow: [{ matchMessage: 'Interesting', handler: 'throw' }],
    };
    assert.throws(function () {
      deprecate('Interesting', false, {
        id: 'interesting',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      });
    }, 'deprecation throws');
  });

  test('deprecation silenced with regex matcher', function (assert) {
    self.deprecationWorkflow.config = {
      workflow: [{ matchMessage: /Inter/, handler: 'silence' }],
    };
    deprecate('Interesting', false, {
      id: 'interesting',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
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
    self.deprecationWorkflow.config = {
      workflow: [{ matchMessage: /Inter/, handler: 'log' }],
    };
    deprecate(message, false, {
      id: 'interesting',
      since: 'the beginning',
      until: 'forever',
      for: 'testing',
    });
  });

  test('deprecation thrown with regex matcher', function (assert) {
    self.deprecationWorkflow.config = {
      workflow: [{ matchMessage: /Inter/, handler: 'throw' }],
    };
    assert.throws(function () {
      deprecate('Interesting', false, {
        id: 'interesting',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      });
    }, 'deprecation throws');
  });

  test('deprecation thrown with string matcher with parens', function (assert) {
    let message =
      'Some string that includes ().  If treated like a regexp this will not match.';

    self.deprecationWorkflow.config = {
      workflow: [{ matchMessage: message, handler: 'throw' }],
    };

    assert.throws(function () {
      deprecate(message, false, {
        id: 'throws',
        since: 'the beginning',
        until: 'forever',
        for: 'testing',
      });
    }, 'deprecation throws');
  });

  test('deprecation silenced with id matcher', function (assert) {
    self.deprecationWorkflow.config = {
      workflow: [{ matchId: 'ember.deprecation-workflow', handler: 'silence' }],
    };
    deprecate('Slightly interesting', false, {
      id: 'ember.deprecation-workflow',
      since: 'the beginning',
      until: '3.0.0',
      for: 'testing',
    });
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
    self.deprecationWorkflow.config = {
      workflow: [{ matchId: 'ember.deprecation-workflow', handler: 'log' }],
    };
    deprecate('Slightly interesting', false, {
      id: 'ember.deprecation-workflow',
      since: 'the beginning',
      until: '3.0.0',
      for: 'testing',
    });
  });

  test('deprecation thrown with id matcher', function (assert) {
    self.deprecationWorkflow.config = {
      workflow: [{ matchId: 'ember.deprecation-workflow', handler: 'throw' }],
    };
    assert.throws(function () {
      deprecate('Slightly interesting', false, {
        id: 'ember.deprecation-workflow',
        since: 'the beginning',
        until: '3.0.0',
        for: 'testing',
      });
    }, 'deprecation throws');
  });

  test('deprecation logging happens even if `throwOnUnhandled` is true', function (assert) {
    assert.expect(2);

    self.deprecationWorkflow.config = {
      throwOnUnhandled: true,
    };

    assert.throws(
      function () {
        deprecate('Foobarrrzzzz', false, {
          id: 'foobar',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        });
      },
      /Foobarrrzzzz/,
      'setting raiseOnUnhandled throws for unknown workflows',
    );

    let result = self.deprecationWorkflow.flushDeprecations();

    assert.ok(
      /foobar/.exec(result),
      'unhandled deprecation was added to the deprecationLog',
    );
  });
});
