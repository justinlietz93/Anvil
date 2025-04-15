import { v4 as uuidv4 } from 'uuid';
import { Blueprint, NodeInstance, Connection } from '../contexts/ProjectContext';

/**
 * Interface for node definition
 */
export interface NodeDefinition {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  defaultData?: Record<string, any>;
  compute: (inputs: any, data: any) => any;
}

/**
 * Interface for port definition
 */
export interface PortDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
}

/**
 * Blueprint Registry class for managing available node types
 */
class BlueprintRegistryClass {
  private nodes: Map<string, NodeDefinition> = new Map();
  
  /**
   * Register a node type in the registry
   * 
   * @param node - The node definition to register
   */
  registerNode(node: NodeDefinition): void {
    this.nodes.set(node.id, node);
  }
  
  /**
   * Get a node type by ID
   * 
   * @param id - The ID of the node type to get
   * @returns The node definition or undefined if not found
   */
  getNode(id: string): NodeDefinition | undefined {
    return this.nodes.get(id);
  }
  
  /**
   * Get all registered node types
   * 
   * @returns Array of all node definitions
   */
  getAllNodes(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }
  
  /**
   * Get node types by category
   * 
   * @param category - The category to filter by
   * @returns Array of node definitions in the specified category
   */
  getNodesByCategory(category: string): NodeDefinition[] {
    return this.getAllNodes().filter(node => node.category === category);
  }
  
  /**
   * Get all node categories
   * 
   * @returns Array of unique category names
   */
  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.getAllNodes().forEach(node => categories.add(node.category));
    return Array.from(categories);
  }
  
  /**
   * Create a node instance from a node definition
   * 
   * @param nodeId - The ID of the node definition
   * @param position - The position of the node in the blueprint editor
   * @returns A new NodeInstance object
   */
  createNodeInstance(nodeId: string, position: { x: number, y: number }): NodeInstance | null {
    const nodeDef = this.getNode(nodeId);
    if (!nodeDef) return null;
    
    // Create inputs object with default values
    const inputs: Record<string, any> = {};
    nodeDef.inputs.forEach(input => {
      inputs[input.id] = input.defaultValue;
    });
    
    // Create outputs object
    const outputs: Record<string, any> = {};
    nodeDef.outputs.forEach(output => {
      outputs[output.id] = null;
    });
    
    return {
      id: uuidv4(),
      type: nodeId,
      position,
      data: { ...nodeDef.defaultData },
      inputs,
      outputs
    };
  }
  
  /**
   * Create a connection between two nodes
   * 
   * @param sourceNodeId - The ID of the source node
   * @param sourcePortId - The ID of the source port
   * @param targetNodeId - The ID of the target node
   * @param targetPortId - The ID of the target port
   * @returns A new Connection object
   */
  createConnection(
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string
  ): Connection {
    return {
      id: uuidv4(),
      sourceNodeId,
      sourcePortId,
      targetNodeId,
      targetPortId
    };
  }
  
  /**
   * Create a new blueprint
   * 
   * @param name - The name of the blueprint
   * @param description - The description of the blueprint
   * @returns A new Blueprint object
   */
  createBlueprint(name: string, description: string): Blueprint {
    return {
      id: uuidv4(),
      name,
      description,
      nodes: [],
      connections: []
    };
  }
}

// Export singleton instance
export const BlueprintRegistry = new BlueprintRegistryClass();
