import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import { loadTests } from 'ember-qunit/test-loader';
import { start, setupEmberOnerrorValidation } from 'ember-qunit';
import { dependencySatisfies } from '@embroider/macros';

setupEmberOnerrorValidation();

/**
 * We only need to explicitly call load tests when we're on a newer ember-qunit. This check is here
 * because we have an ember-try setup that tests ember versions that aren't supported on the newer
 * ember-qunit so we need to downgrade ember-qunit for them too
 */
if (!dependencySatisfies('ember-qunit', '<9.0.0')) {
  loadTests();
}
setApplication(Application.create(config.APP));

start();
