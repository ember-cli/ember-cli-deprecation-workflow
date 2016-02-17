module.exports = {
  scenarios: [
    {
      name: 'default',
      dependencies: { }
    },
    {
      name: 'ember-1-13',
      dependencies: {
        'ember': 'release-1-13'
      },
      resolutions: {
        'ember': 'release-1-13'
      }
    },
    {
      name: 'ember-2-0',
      dependencies: {
        'ember': '~2.0.2'
      }
    },
    {
      name: 'ember-2-1',
      dependencies: {
        'ember': '~2.1.0'
      }
    },
    {
      name: 'ember-2-2',
      dependencies: {
        'ember': '~2.2.0'
      }
    },
    {
      name: 'ember-2-3',
      dependencies: {
        'ember': '~2.3.0'
      }
    },
    {
      name: 'ember-release',
      dependencies: {
        'ember': 'release'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        'ember': 'beta'
      },
      resolutions: {
        'ember': 'beta'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        'ember': 'canary'
      },
      resolutions: {
        'ember': 'canary'
      }
    }
  ]
};
