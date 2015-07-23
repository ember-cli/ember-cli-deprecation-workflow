/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-deprecation-workflow',
  included: function() {
    // From https://github.com/rwjblue/ember-debug-handlers-polyfill/blob/master/index.js
    var app = this.app;

    if (app.env !== 'production') {
      app.import('vendor/ember-debug-handlers-polyfill/debug.js');
    } else {
      app.import('vendor/ember-debug-handlers-polyfill/prod.js');
    }

    // FIXME: This should be excluded in production
    app.import('vendor/ember-cli-deprecation-workflow/main.js');
  },
  contentFor: function(type) {
    if (type === 'vendor-prefix') {
      // FIXME: This should be excluded in production
      var fs = require('fs');
      var path = require('path');
      var existsSync = require('exists-sync');
      var root, configPath;
      if (process.env.USE_DUMMY_CONFIG) {
        // Ensures tests can find the dummy app config directory
        root = this.app.options.configPath;
        configPath = path.join(root, '..', 'deprecation-workflow.js');
      } else {
        root = this.project.root;
        configPath = path.join(root, 'config', 'deprecation-workflow.js');
      }
      if (existsSync(configPath)) {
        return fs.readFileSync(configPath);
      }
    }
  }
};
