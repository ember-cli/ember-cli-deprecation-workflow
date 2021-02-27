'use strict';

const fs = require('fs');
const path = require('path');

const Plugin = require('broccoli-plugin');

module.exports = class DeprecationWorkflowTemplateDeprecationProducer extends (
  Plugin
) {
  constructor(workflowAddonInstance, tree) {
    super([tree], {
      annotation: 'deprecation-workflow-template-deprecations',
      persistentOutput: true,
      needsCache: false,
    });

    this.workflowAddonInstance = workflowAddonInstance;
    this.lastContent = undefined;
  }

  content() {
    return this.workflowAddonInstance._templateDeprecations
      .map(function (item) {
        return (
          'Ember.deprecate(\n' +
          '  ' +
          item.message +
          ',\n' +
          '  ' +
          item.test +
          ',\n' +
          '  ' +
          item.options +
          '\n' +
          ');'
        );
      })
      .join('\n');
  }

  build() {
    let outputPath = path.join(
      this.outputPath,
      'template-deprecations-test.js'
    );

    let content = this.content();
    if (this.lastContent !== content) {
      this.lastContent = content;
      fs.writeFileSync(outputPath, content);
    }
  }
};
