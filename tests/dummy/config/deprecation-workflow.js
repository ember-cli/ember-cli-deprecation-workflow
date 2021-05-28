/* globals self */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  throwOnUnhandled: true,
  workflow: [
    /*
     * Actual controlled deprecations
     *
     * The ember-global log configuration is only required for
     * ember-release-with-jquery. All other ember-try scenarios pass with that
     * handler removed (and defaulting to a throw).
     */
    { matchId: 'ember-global', handler: 'log' },

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
