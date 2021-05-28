import { deprecate } from '@ember/debug';
import Ember from 'ember';
import { module } from 'qunit';
import test from '../helpers/debug-test';

let originalWarn;

module('workflow config', function (hooks) {
  hooks.beforeEach(function () {
    originalWarn = window.Testem.handleConsoleMessage;
  });

  hooks.afterEach(function () {
    Ember.ENV.RAISE_ON_DEPRECATION = false;
    window.deprecationWorkflow.deprecationLog = { messages: {} };
    window.Testem.handleConsoleMessage = originalWarn;
  });

  test('deprecation silenced with string matcher', (assert) => {
    deprecate('silence-me', false, {
      since: '2.0.0',
      until: 'forever',
      id: 'test',
      for: 'testing',
    });
    assert.ok(true, 'Deprecation did not raise');
  });

  test('deprecation logs with string matcher', (assert) => {
    assert.expect(1);

    let message = 'log-me';
    window.Testem.handleConsoleMessage = function (passedMessage) {
      assert.ok(
        passedMessage.indexOf('DEPRECATION: ' + message) === 0,
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

  test('deprecation thrown with string matcher', (assert) => {
    Ember.ENV.RAISE_ON_DEPRECATION = true;
    assert.throws(function () {
      deprecate('throw-me', false, {
        since: '2.0.0',
        until: 'forever',
        id: 'test',
        for: 'testing',
      });
    }, 'deprecation throws');
  });

  test('deprecation logs with id matcher', (assert) => {
    assert.expect(1);

    let message = 'log-id';
    let id = 'ember.workflow';
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

  test('deprecation limits each id to 100 console.logs', (assert) => {
    let limit = 100;

    let message = 'log-id';
    let id = 'ember.workflow';
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
        assert.equal(
          passedMessage.substr(0, expected.length),
          expected,
          'deprecation logs'
        );
      } else if (count === limit + 1) {
        assert.equal(
          passedMessage,
          'To avoid console overflow, this deprecation will not be logged any more in this run.'
        );
      } else {
        assert.ok(false, 'No further logging expected');
      }
    };

    // Run one more time than the limit
    for (let i = 0; i <= limit; i++) {
      deprecate(message, false, options);
    }

    assert.equal(count, limit + 1, 'logged 101 times, including final notice');

    let secondMessage = 'log-id2';
    let secondId = 'ember.workflow2';
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
    };

    deprecate(secondMessage, false, secondOptions);

    assert.equal(secondCount, 1, 'logged deprecation with different id');
  });
});
