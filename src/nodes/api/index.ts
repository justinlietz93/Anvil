/**
 * API Nodes Index
 * 
 * @fileoverview Index file that re-exports all API nodes following
 * APEX standard for max 500 lines per file (Rule #5: FILE-SIZE)
 */

// Export individual API nodes
export { APIRequestNode } from './APIRequestNode';
export { APIRouteHandlerNode } from './APIRouteHandlerNode';
export { APIResponseNode } from './APIResponseNode';
export { AuthenticationNode } from './AuthenticationNode';
export { DatabaseIntegrationNode } from './DatabaseIntegrationNode';
export { APIValidationNode } from './APIValidationNode';

// Export array of all API nodes
import { APIRequestNode } from './APIRequestNode';
import { APIRouteHandlerNode } from './APIRouteHandlerNode';
import { APIResponseNode } from './APIResponseNode';
import { AuthenticationNode } from './AuthenticationNode';
import { DatabaseIntegrationNode } from './DatabaseIntegrationNode';
import { APIValidationNode } from './APIValidationNode';
import { APINodeDefinition } from '../APINodeTypes';

// Export collection of all API nodes
export const APINodes: APINodeDefinition[] = [
  APIRequestNode,
  APIRouteHandlerNode,
  APIResponseNode,
  AuthenticationNode,
  DatabaseIntegrationNode,
  APIValidationNode
];