window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {"workflow":[
  { matchMessage: 'silence-me', handler: 'silence' },
  { matchMessage: 'log-me', handler: 'log' },
  { matchMessage: 'throw-me', handler: 'throw' }
]};
