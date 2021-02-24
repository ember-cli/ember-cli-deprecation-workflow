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

    var i, workflow, regex, matcher, idMatcher;
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

  Ember.Debug.registerDeprecationHandler(function handleDeprecationWorkflow(message, options, next){
    var config = self.deprecationWorkflow.config || {};

    var matchingWorkflow = detectWorkflow(config, message, options);
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
        case 'log':
          var key = options && options.id || message;
          let count = self.deprecationWorkflow.logCounts[key] || 0;
          self.deprecationWorkflow.logCounts[key] = count + 1;

          if (count <= LOG_LIMIT) {
            console.warn('DEPRECATION: ' + message);
            if (count === LOG_LIMIT) {
              console.warn('To avoid console overflow, this deprecation will not be logged any more in this run.');
            }
          }

          break;
        case 'throw':
          throw new Error(message);
          break;
        default:
          next(message, options);
          break;
      }
    }
  });

  Ember.Debug.registerDeprecationHandler(function deprecationCollector(message, options, next){
    var key = options && options.id || message;
    var matchKey = options && key === options.id ? 'matchId' : 'matchMessage';

    self.deprecationWorkflow.deprecationLog.messages[key] = '    { handler: "silence", ' + matchKey + ': ' + JSON.stringify(key) + ' }';
    next(message, options);
  });

  var preamble = [
    'self.deprecationWorkflow = self.deprecationWorkflow || {};',
    'self.deprecationWorkflow.config = {\n  workflow: [\n',
  ].join('\n');

  var postamble = [
    '  ]\n};'
  ].join('\n');

  self.deprecationWorkflow.flushDeprecations = function flushDeprecations() {
    var messages = self.deprecationWorkflow.deprecationLog.messages;
    var logs = [];

    for (var message in messages) {
      logs.push(messages[message]);
    }

    var deprecations = logs.join(',\n') + '\n';

    return preamble + deprecations + postamble;
  };
})();
