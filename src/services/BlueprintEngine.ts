/**
 * Blueprint Engine class for executing blueprints
 * 
 * @author Justin Lietz
 */
class BlueprintEngineClass {
  private nodes: Map<string, any> = new Map();
  private connections: any[] = [];
  private eventListeners: Map<string, Function> = new Map();
  
  /**
   * Add a node to the engine
   * 
   * @param node - The node instance to add
   */
  addNode(node: any): void {
    this.nodes.set(node.id, node);
  }
  
  /**
   * Remove a node from the engine
   * 
   * @param nodeId - The ID of the node to remove
   */
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.connections = this.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
  }
  
  /**
   * Add a connection to the engine
   * 
   * @param connection - The connection to add
   */
  addConnection(connection: any): void {
    this.connections.push(connection);
  }
  
  /**
   * Remove a connection from the engine
   * 
   * @param connectionId - The ID of the connection to remove
   */
  removeConnection(connectionId: string): void {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
  }
  
  /**
   * Add an event listener
   * 
   * @param eventType - The type of event to listen for
   * @param callback - The callback function to execute when the event occurs
   */
  addEventListener(eventType: string, callback: Function): void {
    this.eventListeners.set(eventType, callback);
  }
  
  /**
   * Remove an event listener
   * 
   * @param eventType - The type of event to remove the listener for
   */
  removeEventListener(eventType: string): void {
    this.eventListeners.delete(eventType);
  }
  
  /**
   * Trigger an event
   * 
   * @param eventType - The type of event to trigger
   * @param eventData - The data associated with the event
   */
  triggerEvent(eventType: string, eventData: any): void {
    const eventNodes = Array.from(this.nodes.values())
      .filter(node => node.type === 'event' && node.eventType === eventType);
    
    for (const node of eventNodes) {
      this.executeNode(node.id, eventData);
    }
  }
  
  /**
   * Execute a node
   * 
   * @param nodeId - The ID of the node to execute
   * @param inputData - The input data for the node
   * @returns The output data from the node
   */
  async executeNode(nodeId: string, inputData: any = {}): Promise<any> {
    const node = this.nodes.get(nodeId);
    if (!node) return null;
    
    const nodeInputs = this.gatherNodeInputs(nodeId, inputData);
    const nodeOutputs = await node.compute(nodeInputs, node.data);
    
    this.propagateOutputs(nodeId, nodeOutputs);
    
    return nodeOutputs;
  }
  
  /**
   * Gather inputs for a node
   * 
   * @param nodeId - The ID of the node to gather inputs for
   * @param externalInputs - External inputs to include
   * @returns The gathered inputs
   */
  private gatherNodeInputs(nodeId: string, externalInputs: any = {}): any {
    const inputs = { ...externalInputs };
    
    // Find connections that target this node
    const incomingConnections = this.connections.filter(
      conn => conn.targetNodeId === nodeId
    );
    
    for (const conn of incomingConnections) {
      const sourceNode = this.nodes.get(conn.sourceNodeId);
      if (sourceNode && sourceNode.outputs[conn.sourcePortId] !== undefined) {
        inputs[conn.targetPortId] = sourceNode.outputs[conn.sourcePortId];
      }
    }
    
    return inputs;
  }
  
  /**
   * Propagate outputs from a node
   * 
   * @param nodeId - The ID of the node to propagate outputs from
   * @param outputs - The outputs to propagate
   */
  private propagateOutputs(nodeId: string, outputs: any): void {
    // Find connections that source from this node
    const outgoingConnections = this.connections.filter(
      conn => conn.sourceNodeId === nodeId
    );
    
    for (const conn of outgoingConnections) {
      if (outputs[conn.sourcePortId] !== undefined) {
        this.executeNode(conn.targetNodeId, {
          [conn.targetPortId]: outputs[conn.sourcePortId]
        });
      }
    }
  }
}

// Export singleton instance
export const BlueprintEngine = new BlueprintEngineClass();
