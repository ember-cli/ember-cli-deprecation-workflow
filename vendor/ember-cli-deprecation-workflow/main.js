/* globals self */

const LOG_LIMIT = 100;

(function(){
  self.deprecationWorkflow = self.deprecationWorkflow || {};
  self.deprecationWorkflow.deprecationLog = {
    messages: { }
  };
  self.deprecationWorkflow.logCounts = {};

  function detectWorkflow(config, message, options) {
    if (!config || !config.workflow) {
      return;
    }

    let i, workflow, matcher, idMatcher;
    for (i=0; i<config.workflow.length; i++) {
      workflow = config.workflow[i];
      matcher = workflow.matchMessage;
      idMatcher = workflow.matchId;

      if (typeof idMatcher === 'string' && options && idMatcher === options.id) {
        return workflow;
      } else if (typeof matcher === 'string' && matcher === message) {
        return workflow;
      } else if (matcher instanceof RegExp && matcher.exec(message)) {
        return workflow;
      }
    }
  }

  let registerDeprecationHandler = require.has('@ember/debug') ? require('@ember/debug').registerDeprecationHandler : Ember.Debug.registerDeprecationHandler;

  registerDeprecationHandler(function handleDeprecationWorkflow(message, options, next){
    let config = self.deprecationWorkflow.config || {};

    let matchingWorkflow = detectWorkflow(config, message, options);
    if (!matchingWorkflow) {
      if (config && config.throwOnUnhandled) {
        throw new Error(message);
      } else {
        next(message, options);
      }
    } else {
      switch(matchingWorkflow.handler) {
        case 'silence':
          // no-op
          break;
        case 'log': {
          let key = (options && options.id) || message;
          let count = self.deprecationWorkflow.logCounts[key] || 0;
          self.deprecationWorkflow.logCounts[key] = ++count;

          if (count <= LOG_LIMIT) {
            console.warn('DEPRECATION: ' + message);
            if (count === LOG_LIMIT) {
              console.warn('To avoid console overflow, this deprecation will not be logged any more in this run.');
            }
          }

          break;
        }
        case 'throw':
          throw new Error(message);
        default:
          next(message, options);
          break;
      }
    }
  });

  registerDeprecationHandler(function deprecationCollector(message, options, next){
    let key = options && options.id || message;
    let matchKey = options && key === options.id ? 'matchId' : 'matchMessage';

    self.deprecationWorkflow.deprecationLog.messages[key] = '    { handler: "silence", ' + matchKey + ': ' + JSON.stringify(key) + ' }';
    next(message, options);
  });

  let preamble = [
    'self.deprecationWorkflow = self.deprecationWorkflow || {};',
    'self.deprecationWorkflow.config = {\n  workflow: [\n',
  ].join('\n');

  let postamble = [
    '  ]\n};'
  ].join('\n');

  self.deprecationWorkflow.flushDeprecations = function flushDeprecations() {
    let messages = self.deprecationWorkflow.deprecationLog.messages;
    let logs = [];

    for (let message in messages) {
      logs.push(messages[message]);
    }

    let deprecations = logs.join(',\n') + '\n';

    return preamble + deprecations + postamble;
  };
})();
