'use strict';

module.exports = {
  name: require('./package').name,

  _shouldInclude() {
    // the presence of `this.app.tests` shows that we are in one of:
    //
    // * running non-production build
    // * running tests against production
    //
    var app = this.app || this._findHost();
    return app.tests;
  },

  included() {
    // From https://github.com/rwjblue/ember-debug-handlers-polyfill/blob/master/index.js
    var app = this.app || this._findHost();

    if (this._shouldInclude()) {
      app.import(
        'vendor/ember-cli-deprecation-workflow/deprecation-workflow.js'
      );
      app.import('vendor/ember-cli-deprecation-workflow/main.js');
    }
  },

  treeForVendor(tree) {
    var root = process.env._DUMMY_CONFIG_ROOT_PATH || this.project.root;
    var configDir = '/config';

    if (
      this.project.pkg['ember-addon'] &&
      this.project.pkg['ember-addon']['configPath']
    ) {
      configDir = '/' + this.project.pkg['ember-addon']['configPath'];
    }

    var mergeTrees = require('broccoli-merge-trees');
    var Funnel = require('broccoli-funnel');
    var configTree = new Funnel(root + configDir, {
      include: ['deprecation-workflow.js'],

      destDir: 'ember-cli-deprecation-workflow',
    });

    return mergeTrees([tree, configTree], { overwrite: true });
  },
};
