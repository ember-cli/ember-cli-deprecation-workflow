/* globals self */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { matchMessage: 'silence-me', handler: 'silence' },
    { matchMessage: 'log-me', handler: 'log' },
    { matchMessage: 'throw-me', handler: 'throw' },
    { matchId: 'ember.workflow', handler: 'log' },
  ],
};
