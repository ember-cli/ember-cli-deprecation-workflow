/* global QUnit */
import { registerDeprecationHandler } from '@ember/debug';
import { VERSION } from '@ember/version';

const LOG_LIMIT = 100;

// Number of minor versions before an upcoming `until` that counts as "approaching"
const APPROACHING_MINOR_WINDOW = 2;

// Minimum current minor version to be considered approaching the next major version.
// For example, if minor releases go 0–9, versions X.8 and X.9 are within the window.
const CROSS_MAJOR_MINOR_THRESHOLD = 10 - APPROACHING_MINOR_WINDOW;

export default function setupDeprecationWorkflow(config) {
  self.deprecationWorkflow = self.deprecationWorkflow || {};
  self.deprecationWorkflow.deprecationLog = {
    messages: new Set(),
  };
  self.deprecationWorkflow.pressingSilenced = new Set();

  registerDeprecationHandler((message, options, next) =>
    handleDeprecationWorkflow(config, message, options, next),
  );

  registerDeprecationHandler(deprecationCollector);

  self.deprecationWorkflow.flushDeprecations = (options) =>
    flushDeprecations({ config, ...options });

  if (typeof QUnit !== 'undefined') {
    let pressingSilenced = self.deprecationWorkflow.pressingSilenced;
    QUnit.done(() => {
      let count = pressingSilenced.size;
      if (count > 0) {
        console.warn(`Deprecation Workflow: ${count} deprecation(s) silenced.`);
      }
    });
  }
}

export function isApproaching(until, currentVersion = VERSION) {
  const untilParts = String(until ?? '').split('.');
  const untilMajor = parseInt(untilParts[0], 10);

  if (isNaN(untilMajor)) return false;

  const untilMinor = parseInt(untilParts[1] ?? '0', 10);

  const currentParts = String(currentVersion).split('.');
  const currentMajor = parseInt(currentParts[0], 10);
  const currentMinor = parseInt(currentParts[1] ?? '0', 10);

  if (untilMajor === currentMajor + 1) {
    // Crossing to the next major: approaching if we're in the last few minor releases
    return currentMinor >= CROSS_MAJOR_MINOR_THRESHOLD;
  }

  if (untilMajor === currentMajor) {
    // Same major: approaching if within the minor window
    return (
      untilMinor - currentMinor <= APPROACHING_MINOR_WINDOW &&
      untilMinor >= currentMinor
    );
  }

  return false;
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
      case 'silence': {
        if (
          !options ||
          options.for !== 'ember-source' ||
          !isApproaching(options.until)
        )
          break;
        let key = options.id || message;
        self.deprecationWorkflow.pressingSilenced.add(key);
        break;
      }
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
        throw new Error(message + ` (id: ${options?.id || 'unknown'})`);
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
