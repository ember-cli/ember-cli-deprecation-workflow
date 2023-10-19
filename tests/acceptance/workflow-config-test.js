import { deprecate } from '@ember/debug';
import { module } from 'qunit';
import test from '../helpers/debug-test';

let originalWarn;

module('workflow config', function (hooks) {
  hooks.beforeEach(function () {
    originalWarn = window.Testem.handleConsoleMessage;
  });

  hooks.afterEach(function () {
    window.deprecationWorkflow.deprecationLog = { messages: {} };
    window.Testem.handleConsoleMessage = originalWarn;
  });

  test('deprecation silenced with string matcher', function (assert) {
    deprecate('silence-strict', false, {
      since: '2.0.0',
      until: 'forever',
      id: 'test',
      for: 'testing',
    });
    assert.ok(true, 'Deprecation did not raise');
  });

  test('deprecation logs with message matcher', function (assert) {
    assert.expect(1);

    let message = 'log-strict';
    window.Testem.handleConsoleMessage = function (passedMessage) {
      assert.strictEqual(
        passedMessage.indexOf('DEPRECATION: ' + message),
        0,
        'deprecation logs'
      );
    };
    deprecate(message, false, {
      since: '2.0.0',
      until: 'forever',
      id: 'test',
      for: 'testing',
    });
  });

  test('deprecation logs with message matcher by regex', function (assert) {
    assert.expect(1);

    let message = ' foo log-match foo';
    window.Testem.handleConsoleMessage = function (passedMessage) {
      assert.strictEqual(
        passedMessage.indexOf('DEPRECATION: ' + message),
        0,
        'deprecation logs'
      );
    };
    deprecate(message, false, {
      since: 'now',
      until: 'forever',
      id: 'test',
      for: 'testing',
    });
  });

  test('deprecation logs with id matcher', function (assert) {
    assert.expect(1);

    let message = ' foo foo';
    window.Testem.handleConsoleMessage = function (passedMessage) {
      assert.strictEqual(
        passedMessage.indexOf('DEPRECATION: ' + message),
        0,
        'deprecation logs'
      );
    };
    deprecate(message, false, {
      since: 'now',
      until: 'forever',
      id: 'log-strict',
      for: 'testing',
    });
  });

  test('deprecation thrown with string matcher', function (assert) {
    assert.throws(function () {
      deprecate('throw-strict', false, {
        since: '2.0.0',
        until: 'forever',
        id: 'test',
        for: 'testing',
      });
    }, 'deprecation throws');
  });

  test('deprecation logs with id matcher and options', function (assert) {
    assert.expect(1);

    let message = 'arbitrary-unmatched-message';
    let id = 'log-strict';
    let options = {
      id,
      since: '2.0.0',
      until: '3.0.0',
      for: 'testing',
    };
    let expected = `DEPRECATION: ${message}`;
    window.Testem.handleConsoleMessage = function (passedMessage) {
      assert.equal(
        passedMessage.substr(0, expected.length),
        expected,
        'deprecation logs'
      );
    };
    deprecate(message, false, options);
  });

  test('deprecation limits each id to 100 console.logs', function (assert) {
    assert.expect(104);
    let limit = 100;

    let message = 'log-match';
    let id = 'first-and-unique-to-limit-test';
    let options = {
      id,
      since: '2.0.0',
      until: '3.0.0',
      for: 'testing',
    };
    let expected = `DEPRECATION: ${message}`;

    let count = 0;
    window.Testem.handleConsoleMessage = function (passedMessage) {
      count++;
      if (count <= limit) {
        // eslint-disable-next-line qunit/no-conditional-assertions
        assert.equal(
          passedMessage.substr(0, expected.length),
          expected,
          'deprecation logs'
        );
      }
      if (count === limit) {
        window.Testem.handleConsoleMessage = function (passedMessage) {
          assert.equal(
            passedMessage,
            'To avoid console overflow, this deprecation will not be logged any more in this run.'
          );
        };
      }
    };

    // Run one more time than the limit
    for (let i = 0; i <= limit; i++) {
      deprecate(message, false, options);
    }

    assert.equal(count, limit, 'logged 100 times, including final notice');

    let secondMessage = 'log-strict';
    let secondId = 'second-and-unique-to-limit-test';
    let secondOptions = {
      id: secondId,
      since: '2.0.0',
      until: '3.0.0',
      for: 'testing',
    };
    let secondExpected = `DEPRECATION: ${secondMessage}`;

    let secondCount = 0;
    window.Testem.handleConsoleMessage = function (passedMessage) {
      secondCount++;
      assert.equal(
        passedMessage.substr(0, secondExpected.length),
        secondExpected,
        'second deprecation logs'
      );
      window.Testem.handleConsoleMessage = function () {
        assert.ok(false, 'No further logging expected');
      };
    };

    deprecate(secondMessage, false, secondOptions);

    assert.equal(secondCount, 1, 'logged deprecation with different id');
  });
});
