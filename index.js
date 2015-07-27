/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-deprecation-workflow',

  _shouldInclude: function() {
    // the presence of `this.app.tests` shows that we are in one of:
    //
    // * running non-production build
    // * running tests against production
    //
    return this.app.tests;
  },

  included: function() {
    // From https://github.com/rwjblue/ember-debug-handlers-polyfill/blob/master/index.js
    var app = this.app;

    if (this._shouldInclude()) {
      app.import('vendor/ember-debug-handlers-polyfill/debug.js');
      app.import('vendor/ember-cli-deprecation-workflow/main.js');
    } else {
      app.import('vendor/ember-debug-handlers-polyfill/prod.js');
    }
  },
  contentFor: function(type) {
    if (this._shouldInclude() && type === 'vendor-prefix') {
      var fs = require('fs');
      var path = require('path');
      var existsSync = require('exists-sync');
      var root = process.env._DUMMY_CONFIG_ROOT_PATH || this.project.root;
      var configPath = path.join(root, 'config', 'deprecation-workflow.js');

      if (existsSync(configPath)) {
        return fs.readFileSync(configPath);
      }
    }
  }
};
