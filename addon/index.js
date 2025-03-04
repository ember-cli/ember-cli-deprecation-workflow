import { registerDeprecationHandler } from '@ember/debug';

const LOG_LIMIT = 100;

export default function setupDeprecationWorkflow(config) {
  self.deprecationWorkflow = self.deprecationWorkflow || {};
  self.deprecationWorkflow.deprecationLog = {
    messages: {},
  };

  registerDeprecationHandler((message, options, next) =>
    handleDeprecationWorkflow(config, message, options, next),
  );

  registerDeprecationHandler(deprecationCollector);

  self.deprecationWorkflow.flushDeprecations = flushDeprecations;
}

let preamble = `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow({
  workflow: [
`;

let postamble = `  ]
});`;

export function detectWorkflow(config, message, options) {
  if (!config || !config.workflow) {
    return;
  }

  let i, workflow, matcher, idMatcher;
  for (i = 0; i < config.workflow.length; i++) {
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

export function flushDeprecations() {
  let messages = self.deprecationWorkflow.deprecationLog.messages;
  let logs = [];

  for (let [deprecation, matcher] of Object.entries(messages)) {
    logs.push(
      `    { handler: "silence", ${matcher}: ${JSON.stringify(deprecation)} }`,
    );
  }

  let deprecations = logs.join(',\n') + '\n';

  return preamble + deprecations + postamble;
}

export function handleDeprecationWorkflow(config, message, options, next) {
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

        if (!self.deprecationWorkflow.logCounts) {
          self.deprecationWorkflow.logCounts = {};
        }

        let count = self.deprecationWorkflow.logCounts[key] || 0;
        self.deprecationWorkflow.logCounts[key] = ++count;

        if (count <= LOG_LIMIT) {
          console.warn('DEPRECATION: ' + message);
          if (count === LOG_LIMIT) {
            console.warn(
              'To avoid console overflow, this deprecation will not be logged any more in this run.',
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
}

export function deprecationCollector(message, options, next) {
  let key = (options && options.id) || message;
  let matchKey = options && key === options.id ? 'matchId' : 'matchMessage';

  self.deprecationWorkflow.deprecationLog.messages[key] = matchKey;

  next(message, options);
}
