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
      app.import('vendor/ember-cli-deprecation-workflow/deprecation-workflow.js');
      app.import('vendor/ember-cli-deprecation-workflow/main.js');
    } else {
      app.import('vendor/ember-debug-handlers-polyfill/prod.js');
    }
  },

  treeForVendor(tree) {
    var root = process.env._DUMMY_CONFIG_ROOT_PATH || this.project.root;
    var mergeTrees = require('broccoli-merge-trees');
    var Funnel = require('broccoli-funnel');
    var configTree = new Funnel(root + '/config', {
      include: ['deprecation-workflow.js'],

      destDir: 'ember-cli-deprecation-workflow'
    });

    return mergeTrees([tree, configTree], { overwrite: true });
  }
};
