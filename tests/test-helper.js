import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import { setup as setupDeprecationWorkflow } from 'ember-cli-deprecation-workflow';

setApplication(Application.create(config.APP));

setupDeprecationWorkflow(self);

start();
