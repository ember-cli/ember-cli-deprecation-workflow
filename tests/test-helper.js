import EmberApp from 'ember-strict-application-resolver';
import { loadTests } from 'ember-qunit/test-loader';
import EmberRouter from '@ember/routing/router';
import { dependencySatisfies } from '@embroider/macros';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';
import './deprecation-workflow';

class Router extends EmberRouter {
  location = 'none';
  rootURL = '/';
}

class TestApp extends EmberApp {
  modules = {
    './router': Router,
    // add any custom services here
    // import.meta.glob('./services/*', { eager: true }),
  };
}

Router.map(function () {});

export function start() {
  /**
   * We only need to explicitly call load tests when we're on a newer ember-qunit. This check is here
   * because we have an ember-try setup that tests ember versions that aren't supported on the newer
   * ember-qunit so we need to downgrade ember-qunit for them too
   */
  if (!dependencySatisfies('ember-qunit', '<9.0.0')) {
    loadTests();
  }
  setApplication(
    TestApp.create({
      autoboot: false,
      rootElement: '#ember-testing',
    }),
  );
  setup(QUnit.assert);
  setupEmberOnerrorValidation();
  qunitStart();
}
