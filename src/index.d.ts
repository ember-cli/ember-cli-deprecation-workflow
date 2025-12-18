interface WorkflowMatchId {
  handler?: 'log' | 'silence' | 'throw';
  matchId: string | RegExp;
}

interface WorkflowMatchMessage {
  handler?: 'log' | 'silence' | 'throw';
  matchMessage: string | RegExp;
}

type Workflow = WorkflowMatchId | WorkflowMatchMessage;

export default function setupDeprecationWorkflow(config?: {
  throwOnUnhandled?: boolean;
  workflow?: Workflow[];
}): void;
