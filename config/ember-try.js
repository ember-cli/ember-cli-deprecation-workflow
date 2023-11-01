'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  let emberReleaseVersion = await getChannelURL('release');
  return {
    useYarn: true,
    scenarios: [
      {
        name: 'ember-lts-2.12',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^1.7.3',
            'ember-qunit': '^4.6.0',
            'ember-source': '~2.12.0',
            qunit: null,
          },
        },
      },
      {
        name: 'ember-lts-2.18',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^1.7.3',
            'ember-qunit': '^4.6.0',
            'ember-source': '~2.18.0',
            qunit: null,
          },
        },
      },
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
          },
        },
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            'ember-source': '~3.20.5',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.0',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
          },
        },
      },
      {
        name: 'ember-lts-4.4',
        npm: {
          devDependencies: {
            'ember-source': '~4.4.0',
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
          devDependencies: {
            'ember-source': '~3.28.0',
            '@ember/jquery': '^2.0.0',
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
          devDependencies: {
            'ember-source': '~3.28.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
    ],
  };
};
