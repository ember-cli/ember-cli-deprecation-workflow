import { registerDeprecationHandler } from '@ember/debug';

const LOG_LIMIT = 100;

let hasSetup = false;

export function setup(scope) {
  if (hasSetup) {
    throw new Error(
      'setup of ember-cli-deprecation-workflow must only be called once'
    );
  }
  hasSetup = true;

  scope.deprecationWorkflow = scope.deprecationWorkflow || {};
  scope.deprecationWorkflow.deprecationLog = {
    messages: {},
  };
  scope.deprecationWorkflow.logCounts = {};

  function detectWorkflow(config, message, options) {
    if (!config || !config.workflow) {
      return;
    }

    let i, workflow, matcher, idMatcher;
    for (i = 0; i < config.workflow.length; i++) {
      workflow = config.workflow[i];
      matcher = workflow.matchMessage;
      idMatcher = workflow.matchId;

      if (
        typeof idMatcher === 'string' &&
        options &&
        idMatcher === options.id
      ) {
        return workflow;
      } else if (typeof matcher === 'string' && matcher === message) {
        return workflow;
      } else if (matcher instanceof RegExp && matcher.exec(message)) {
        return workflow;
      }
    }
  }

  registerDeprecationHandler(function handleDeprecationWorkflow(
    message,
    options,
    next
  ) {
    let config = scope.deprecationWorkflow.config || {};

    let matchingWorkflow = detectWorkflow(config, message, options);
    if (!matchingWorkflow) {
      if (config && config.throwOnUnhandled) {
        throw new Error(message);
      } else {
        next(message, options);
      }
    } else {
      switch (matchingWorkflow.handler) {
        case 'silence':
          // no-op
          break;
        case 'log': {
          let key = (options && options.id) || message;
          let count = scope.deprecationWorkflow.logCounts[key] || 0;
          scope.deprecationWorkflow.logCounts[key] = count + 1;

          if (count <= LOG_LIMIT) {
            console.warn('DEPRECATION: ' + message);
            if (count === LOG_LIMIT) {
              console.warn(
                'To avoid console overflow, this deprecation will not be logged any more in this run.'
              );
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

  registerDeprecationHandler(function deprecationCollector(
    message,
    options,
    next
  ) {
    let key = (options && options.id) || message;
    let matchKey = options && key === options.id ? 'matchId' : 'matchMessage';

    scope.deprecationWorkflow.deprecationLog.messages[key] =
      '    { handler: "silence", ' +
      matchKey +
      ': ' +
      JSON.stringify(key) +
      ' }';
    next(message, options);
  });

  let preamble = [
    'self.deprecationWorkflow = self.deprecationWorkflow || {};',
    'self.deprecationWorkflow.config = {\n  workflow: [\n',
  ].join('\n');

  let postamble = ['  ]\n};'].join('\n');

  scope.deprecationWorkflow.flushDeprecations = function flushDeprecations() {
    let messages = scope.deprecationWorkflow.deprecationLog.messages;
    let logs = [];

    for (let message in messages) {
      logs.push(messages[message]);
    }

    let deprecations = logs.join(',\n') + '\n';

    return preamble + deprecations + postamble;
  };
}
