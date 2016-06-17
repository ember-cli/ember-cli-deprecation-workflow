/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-deprecation-workflow',

  init: function() {
    this._super.init && this._super.init.apply(this, arguments);
    
    this._templateDeprecations = [];
  },

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

  treeForVendor: function(tree) {
    var root = process.env._DUMMY_CONFIG_ROOT_PATH || this.project.root;
    var mergeTrees = require('broccoli-merge-trees');
    var Funnel = require('broccoli-funnel');
    var configTree = new Funnel(root + '/config', {
      include: ['deprecation-workflow.js'],

      destDir: 'ember-cli-deprecation-workflow'
    });

    return mergeTrees([tree, configTree], { overwrite: true });
  },

  _findHtmlbarsPreprocessor: function(registry) {
    var plugins = registry.load('template');

    return plugins.filter(function(plugin) {
      return plugin.name === 'ember-cli-htmlbars';
    })[0];
  },

  _monkeyPatch_EmberDeprecate: function(htmlbarsCompilerPreprocessor) {
    if (!htmlbarsCompilerPreprocessor._addon) {
      // not a new enough ember-cli-htmlbars to monkey patch
      // we need 1.0.3
      return;
    }
    var addonContext = this;
    var originalHtmlbarsOptions = htmlbarsCompilerPreprocessor._addon.htmlbarsOptions;
    var logToNodeConsole = this.project.config(process.env.EMBER_ENV).logTemplateLintToConsole;

    htmlbarsCompilerPreprocessor._addon.htmlbarsOptions = function() {
      var options = originalHtmlbarsOptions.apply(this, arguments);
      var Ember = options.templateCompiler._Ember;

      if (Ember.Debug && Ember.Debug.registerDeprecationHandler) {
        Ember.Debug.registerDeprecationHandler(function(message, options, next) {
          addonContext._templateDeprecations.push({
            message: JSON.stringify(message),
            test: false,
            options: JSON.stringify(options)
          });

          if (logToNodeConsole) {
            next();
          }
        });
      }

      var originalDeprecate = options.templateCompiler._Ember.deprecate;
      Ember.deprecate = function(message, test, options) {

        var noDeprecation;

        if (typeof test === "function") {
          noDeprecation = test();
        } else {
          noDeprecation = test;
        }

        if (!noDeprecation) {
          addonContext._templateDeprecations.push({
            message: JSON.stringify(message),
            test: !!test,
            options: JSON.stringify(options)
          });
        }

        if (logToNodeConsole) {
          return originalDeprecate.apply(this, arguments);
        }
      };

      return options;
    };
  },

  setupPreprocessorRegistry: function(type, registry) {
    if (type === 'parent') {
      var htmlbarsCompilerPreprocessor = this._findHtmlbarsPreprocessor(registry);

      this._monkeyPatch_EmberDeprecate(htmlbarsCompilerPreprocessor);
    }
  },

  lintTree: function(type, tree) {
    var TemplateLinter = require('./generate-deprecations-tree');

    return new TemplateLinter(this);
  }
};
