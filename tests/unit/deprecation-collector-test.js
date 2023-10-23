/* eslint-disable qunit/require-expect */
/* eslint no-console: 0 */

import { module } from 'qunit';
import test from '../helpers/debug-test';
import {
  flushDeprecations,
  deprecationCollector,
  handleDeprecationWorkflow,
} from 'ember-cli-deprecation-workflow';

let originalWarn, originalConfig;

module('Unit tests', function (hooks) {
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

  module('deprecationCollector', function () {
    test('calling flushDeprecations returns string of deprecations', function (assert) {
      deprecationCollector(
        'First deprecation',
        {
          id: 'first',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        },
        () => {}
      );
      deprecationCollector(
        'Second deprecation',
        {
          id: 'second',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        },
        () => {}
      );
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
        next
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
        () => {}
      );
      deprecationCollector(
        'Second deprecation',
        {
          id: 'second',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        },
        () => {}
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
        () => {}
      );
      deprecationCollector(
        'Second deprecation',
        {
          id: 'second',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        },
        () => {}
      );

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

  module('handleDeprecationWorkflow', function () {
    test('specifying `throwOnUnhandled` as true raises', function (assert) {
      assert.expect(2);

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
            () => {}
          );
        },
        /Foobarrrzzzz/,
        'setting raiseOnUnhandled throws for unknown workflows'
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
        () => {}
      );
      assert.ok(true, 'did not throw when silenced');
    });

    test('specifying `throwOnUnhandled` as false does nothing', function (assert) {
      assert.expect(1);

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
        () => {}
      );

      assert.ok(true, 'does not die when throwOnUnhandled is false');
    });

    test('deprecation silenced with string matcher', function (assert) {
      const config = {
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
          'deprecation logs'
        );
      };

      const config = {
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
        () => {}
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
          () => {}
        );
      }, 'deprecation throws');
    });

    test('deprecation silenced with regex matcher', function (assert) {
      const config = {
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
        () => {}
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
          'deprecation logs'
        );
      };

      const config = {
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
        () => {}
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
          () => {}
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
          () => {}
        );
      }, 'deprecation throws');
    });

    test('deprecation silenced with id matcher', function (assert) {
      const config = {
        workflow: [
          { matchId: 'ember.deprecation-workflow', handler: 'silence' },
        ],
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
        () => {}
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
          'deprecation logs'
        );
      };

      const config = {
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
        () => {}
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
          () => {}
        );
      }, 'deprecation throws');
    });
  });

  module(
    'composing handleDeprecationWorkflow and deprecationCollector',
    function () {
      test('deprecation logging happens even if `throwOnUnhandled` is true', function (assert) {
        assert.expect(2);

        const config = {
          throwOnUnhandled: true,
        };

        const message = 'Foobarrrzzzz';

        const options = {
          id: 'foobar',
          since: 'the beginning',
          until: 'forever',
          for: 'testing',
        };

        assert.throws(
          function () {
            deprecationCollector(message, options, () =>
              handleDeprecationWorkflow(config, message, options, () => {})
            );
          },
          /Foobarrrzzzz/,
          'setting raiseOnUnhandled throws for unknown workflows'
        );

        let result = flushDeprecations();

        assert.ok(
          /foobar/.exec(result),
          'unhandled deprecation was added to the deprecationLog'
        );
      });
    }
  );
});
