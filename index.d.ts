export default function setupDeprecationWorkflow(config: {
  throwOnUnhandled: boolean;
  workflow: {
    handler: 'log' | 'silence' | 'throw';
    matchId: string;
    matchMessage: string;
  }[];
}): void;
