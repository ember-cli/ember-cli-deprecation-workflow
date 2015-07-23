(function(){
  window.deprecationWorkflow = window.deprecationWorkflow || {};
  window.deprecationWorkflow.deprecationLog = {
    messages: { }
  };

  function detectWorkflow(config, message, options) {
    if (!config || !config.workflow) {
      return;
    }

    var i, workflow, regex, matcher;
    for (i=0; i<config.workflow.length; i++) {
      workflow = config.workflow[i];
      matcher = workflow.matchMessage;

      if (typeof matcher === 'string' && matcher === message) {
        return workflow;
      } else if (matcher instanceof RegExp && matcher.exec(message)) {
        return workflow;
      }
    }
  }

  Ember.Debug.registerDeprecationHandler(function handleDeprecationWorkflow(message, options, next){
    var config = window.deprecationWorkflow.config || {};

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
          Ember.Logger.log(message);
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
    window.deprecationWorkflow.deprecationLog.messages[message] = '    { handler: "silence", matchMessage: ' + JSON.stringify(message) + ' }';
    next(message, options);
  });

  var preamble = [
    'window.deprecationWorkflow = window.deprecationWorkflow || {};',
    'window.deprecationWorkflow.config = {\n  throwOnUnhandled: true,\n  workflow: [\n',
  ].join('\n');

  var postamble = [
    '  ]\n};'
  ].join('\n');

  window.deprecationWorkflow.flushDeprecations = function flushDeprecations() {
    var messages = window.deprecationWorkflow.deprecationLog.messages;
    var logs = [];

    for (var message in messages) {
      logs.push(messages[message]);
    }

    var deprecations = logs.join(',\n') + '\n';

    return preamble + deprecations + postamble;
  };
})();
