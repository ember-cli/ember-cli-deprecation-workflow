import { deprecate } from '@ember/application/deprecations';
import Ember from 'ember';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Acceptance | workflow config', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    this.originalWarn = console.warn;
  });

  hooks.afterEach(function () {
    Ember.ENV.RAISE_ON_DEPRECATION = false;
    window.deprecationWorkflow.deprecationLog = { messages: {} };
    console.warn = this.originalWarn;
  });

  test('deprecation silenced with string matcher', (assert) => {
    deprecate('silence-me', false, {
      until: 'forever',
      since: '0.0.0',
      id: 'test',
      for: 'testing',
    });
    assert.ok(true, 'Deprecation did not raise');
  });

  test('deprecation logs with string matcher', (assert) => {
    assert.expect(1);

    let message = 'log-me';
    console.warn = function (passedMessage) {
      assert.ok(
        passedMessage.indexOf('DEPRECATION: ' + message) === 0,
        'deprecation logs'
      );
    };
    deprecate(message, false, {
      until: 'forever',
      since: '0.0.0',
      id: 'test',
      for: 'testing',
    });
  });

  test('deprecation thrown with string matcher', (assert) => {
    Ember.ENV.RAISE_ON_DEPRECATION = true;
    assert.throws(function () {
      deprecate('throw-me', false, {
        until: 'forever',
        since: '0.0.0',
        id: 'test',
        for: 'testing',
      });
    }, 'deprecation throws');
  });

  test('deprecation logs with id matcher', (assert) => {
    assert.expect(1);

    let message = 'log-id';
    let id = 'ember.workflow';
    let options = { id, since: '2.0.0', until: '3.0.0', for: 'testing' };
    let expected = `DEPRECATION: ${message}`;
    console.warn = function (passedMessage) {
      assert.equal(
        passedMessage.substr(0, expected.length),
        expected,
        'deprecation logs'
      );
    };
    deprecate(message, false, options);
  });
});
