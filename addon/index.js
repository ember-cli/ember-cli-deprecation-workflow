import { registerDeprecationHandler } from '@ember/debug';

const LOG_LIMIT = 100;

export default function setupDeprecationWorkflow(config) {
  self.deprecationWorkflow = self.deprecationWorkflow || {};
  self.deprecationWorkflow.deprecationLog = {
    messages: new Set(),
  };

  registerDeprecationHandler((message, options, next) =>
    handleDeprecationWorkflow(config, message, options, next),
  );

  registerDeprecationHandler(deprecationCollector);

  self.deprecationWorkflow.flushDeprecations = (options) =>
    flushDeprecations({ config, ...options });
}

function matchesWorkflow(matcher, value) {
  return (
    (typeof matcher === 'string' && matcher === value) ||
    (matcher instanceof RegExp && matcher.exec(value))
  );
}

export function detectWorkflow(config, message, options) {
  if (!config || !config.workflow) {
    return;
  }

  let i, workflow, matcher, idMatcher;
  for (i = 0; i < config.workflow.length; i++) {
    workflow = config.workflow[i];
    matcher = workflow.matchMessage;
    idMatcher = workflow.matchId;

    if (
      matchesWorkflow(idMatcher, options?.id) ||
      matchesWorkflow(matcher, message)
    ) {
      return workflow;
    }
  }
}

export function flushDeprecations({ handler = 'silence', config = {} } = {}) {
  let messages = self.deprecationWorkflow.deprecationLog.messages;
  let existing = config.workflow ?? [];
  let collected = messages
    .values()
    .filter((matchId) => !existing.some((entry) => entry.matchId === matchId))
    .map((matchId) => ({
      handler,
      matchId,
    }));

  let mergedConfig = {
    ...config,
    workflow: [...existing, ...collected],
  };

  return `import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

setupDeprecationWorkflow(${JSON.stringify(mergedConfig, undefined, 2)});`;
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
  self.deprecationWorkflow.deprecationLog.messages.add(options.id);

  next(message, options);
}
