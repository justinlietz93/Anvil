// filepath: c:\git\Anvil\Anvil\src\nodes\APINodes.ts

/**
 * API Nodes - Export collection of API nodes
 * 
 * @fileoverview Re-exports API nodes from the api subfolder.
 * Compliant with Rule #5 (FILE-SIZE) for max 500 lines per file.
 * All node implementations have been moved to individual files in the api/ subfolder.
 */

// Export the core API node types
export * from './APINodeTypes';

// Export all API nodes from the api subfolder
export * from './api';

// Import all nodes for the APINodes array
import { 
  APIRequestNode,
  APIRouteHandlerNode,
  APIResponseNode,
  AuthenticationNode,
  DatabaseIntegrationNode,
  APIValidationNode,
  APINodes as ApiNodesCollection
} from './api';

// Re-export the collection of all API nodes
export const APINodes = ApiNodesCollection;