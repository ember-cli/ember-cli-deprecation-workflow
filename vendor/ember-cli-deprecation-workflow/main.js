(function(){
  window.deprecationWorkflow = window.deprecationWorkflow || {};
  window.deprecationWorkflow.deprecationLog = [];

  Ember.Debug.registerDeprecationHandler(function deprecationCollector(message, options, next){
    window.deprecationWorkflow.deprecationLog.push({ matchMessage: message, handler: 'silence' });
    next(message, options);
  });

  function detectWorkflow(config, message, options) {
    var i, workflow, regex;
    for (i=0; i<config.workflow.length; i++) {
      workflow = config.workflow[i];
      regex = new RegExp(workflow.matchMessage);
      if (regex.exec(message)) {
        return workflow;
      }
    }
  }

  Ember.Debug.registerDeprecationHandler(function handleDeprecationWorkflow(message, options, next){
    var config = window.deprecationWorkflow.config;
    if (!config) {
      return next(message, options);
    }

    var matchingWorkflow = detectWorkflow(config, message, options);
    if (!matchingWorkflow) {
      next(message, options);
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

  var preamble = [
    'window.deprecationWorkflow = window.deprecationWorkflow || {};',
    'window.deprecationWorkflow.config = {"workflow":',
  ].join('\n');

  var postamble = [
    '};'
  ].join('\n');

  window.deprecationWorkflow.flushDeprecations = function flushDeprecations() {
    return preamble+JSON.stringify(window.deprecationWorkflow.deprecationLog)+postamble;
  };
})();
