import { StateGraph, START, END } from '@langchain/langgraph';
import { AgentStateAnnotation, AgentState } from './state';
import {
  fetchEmailsNode,
  analyzeTasksNode,
  createEventsNode,
  sendSummaryNode,
} from './nodes';

function shouldContinue(state: AgentState): 'analyze' | typeof END {
  return state.status === 'error' ? END : 'analyze';
}

function afterAnalyze(state: AgentState): 'create_events' | typeof END {
  return state.status === 'error' ? END : 'create_events';
}

function afterCreateEvents(state: AgentState): 'send_summary' | typeof END {
  return state.status === 'error' ? END : 'send_summary';
}

export function buildAgentGraph() {
  // All addNode calls must be chained so TypeScript accumulates node names in N
  const graph = new StateGraph(AgentStateAnnotation)
    .addNode('fetch_emails', fetchEmailsNode)
    .addNode('analyze', analyzeTasksNode)
    .addNode('create_events', createEventsNode)
    .addNode('send_summary', sendSummaryNode)
    .addEdge(START, 'fetch_emails')
    .addConditionalEdges('fetch_emails', shouldContinue)
    .addConditionalEdges('analyze', afterAnalyze)
    .addConditionalEdges('create_events', afterCreateEvents)
    .addEdge('send_summary', END);

  return graph.compile();
}
