'use strict';

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);

    if (this._shouldIncludeConfig()) {
      let app = this._findHost();
      app.import(
        'vendor/ember-cli-deprecation-workflow/deprecation-workflow.js'
      );
    }
  },

  _shouldIncludeConfig() {
    let app = this._findHost();
    return app.tests || app.env === 'development';
  },

  treeForVendor(tree) {
    let root = this.project.root;
    let configDir = '/config';

    if (
      this.project.pkg['ember-addon'] &&
      this.project.pkg['ember-addon']['configPath']
    ) {
      configDir = '/' + this.project.pkg['ember-addon']['configPath'];
    }

    let mergeTrees = require('broccoli-merge-trees');
    let Funnel = require('broccoli-funnel');
    let configTree = new Funnel(root + configDir, {
      include: ['deprecation-workflow.js'],

      destDir: 'ember-cli-deprecation-workflow',
    });

    return mergeTrees([tree, configTree], { overwrite: true });
  },

  lintTree(type, tree) {
    if (type === 'template') {
      let TemplateLinter = require('./generate-deprecations-tree');

      return new TemplateLinter(this, tree);
    }
  },
};
