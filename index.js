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
    let addonOptions = app.options['ember-cli-deprecation-workflow'];

    if (addonOptions) {
      return addonOptions.enabled;
    } else {
      return app.tests;
    }
  },

  included() {
    // From https://github.com/rwjblue/ember-debug-handlers-polyfill/blob/master/index.js
    var app = this.app || this._findHost();

    if (this._shouldInclude()) {
      app.import('vendor/ember-cli-deprecation-workflow/main.js');
    }
  },
};
