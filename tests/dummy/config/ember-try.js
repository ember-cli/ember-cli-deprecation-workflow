'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  let emberReleaseVersion = await getChannelURL('release');
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-3.28',
        npm: {
          // this needs to be in dependencies because @embroider/macros dependencySatisfies
          // can only look at dependencies and not dev dependencies
          dependencies: {
            'ember-qunit': '~8.0.0',
          },
          devDependencies: {
            'ember-source': '~3.28.0',
            'ember-cli': '^4.12.0',
            '@ember/test-helpers': '^3.0.0',
            '@ember/test-waiters': '^3.0.0',
          },
        },
      },
      {
        name: 'ember-lts-4.4',
        npm: {
          // this needs to be in dependencies because @embroider/macros dependencySatisfies
          // can only look at dependencies and not dev dependencies
          dependencies: {
            'ember-qunit': '~8.0.0',
          },
          devDependencies: {
            'ember-source': '~4.4.0',
            '@ember/test-helpers': '^3.0.0',
            '@ember/test-waiters': '^3.0.0',
          },
        },
      },
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            'ember-source': '~5.4.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': emberReleaseVersion,
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      {
        name: 'ember-3.28-with-jquery',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          // this needs to be in dependencies because @embroider/macros dependencySatisfies
          // can only look at dependencies and not dev dependencies
          dependencies: {
            'ember-qunit': '~8.0.0',
          },
          devDependencies: {
            'ember-source': '~3.28.0',
            '@ember/jquery': '^2.0.0',
            'ember-cli': '^4.12.0',
            '@ember/test-helpers': '^3.0.0',
            '@ember/test-waiters': '^3.0.0',
          },
        },
      },
      {
        name: 'ember-3.28-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          // this needs to be in dependencies because @embroider/macros dependencySatisfies
          // can only look at dependencies and not dev dependencies
          dependencies: {
            'ember-qunit': '~8.0.0',
          },
          devDependencies: {
            'ember-source': '~3.28.0',
            'ember-cli': '^4.12.0',
            '@ember/test-helpers': '^3.0.0',
            '@ember/test-waiters': '^3.0.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
