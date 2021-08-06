import QUnit from 'qunit';
import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

start();

QUnit.done(async function () {
  let deprecations = self.deprecationWorkflow.flushDeprecations();

  let response = await fetch('/report-deprecations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(deprecations),
  });

  return response.json();
});
