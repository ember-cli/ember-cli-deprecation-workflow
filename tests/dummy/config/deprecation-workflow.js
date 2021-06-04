/* globals self */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  throwOnUnhandled: true,
  workflow: [
    /*
     * Actual controlled deprecations
     */
    { matchId: 'ember-global', handler: 'log' },
    { matchId: 'ember.component.reopen', handler: 'log' },

    /*
     * Deprecation setup for tests
     */
    { matchId: 'silence-strict', handler: 'silence' },
    { matchMessage: 'silence-strict', handler: 'silence' },
    { matchMessage: /silence-match/, handler: 'silence' },

    { matchId: 'log-strict', handler: 'log' },
    { matchMessage: 'log-strict', handler: 'log' },
    { matchMessage: /log-match/, handler: 'log' },

    { matchMessage: 'throw-strict', handler: 'throw' },
  ],
};
