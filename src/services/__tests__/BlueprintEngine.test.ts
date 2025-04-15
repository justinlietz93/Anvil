import { BlueprintEngine } from '../BlueprintEngine';

describe('BlueprintEngine', () => {
  beforeEach(() => {
    // Reset the BlueprintEngine before each test
    jest.clearAllMocks();
    // Clear all nodes and connections
    (BlueprintEngine as any).nodes = new Map();
    (BlueprintEngine as any).connections = [];
    (BlueprintEngine as any).eventListeners = new Map();
  });

  test('should add and remove nodes', () => {
    const testNode = {
      id: 'test-node-1',
      type: 'test',
      compute: jest.fn()
    };
    
    BlueprintEngine.addNode(testNode);
    
    // Check if node was added
    expect((BlueprintEngine as any).nodes.get('test-node-1')).toBe(testNode);
    
    // Remove the node
    BlueprintEngine.removeNode('test-node-1');
    
    // Check if node was removed
    expect((BlueprintEngine as any).nodes.get('test-node-1')).toBeUndefined();
  });

  test('should add and remove connections', () => {
    const testConnection = {
      id: 'test-connection-1',
      sourceNodeId: 'source-node',
      targetNodeId: 'target-node',
      sourcePortId: 'output1',
      targetPortId: 'input1'
    };
    
    BlueprintEngine.addConnection(testConnection);
    
    // Check if connection was added
    expect((BlueprintEngine as any).connections.length).toBe(1);
    expect((BlueprintEngine as any).connections[0]).toBe(testConnection);
    
    // Remove the connection
    BlueprintEngine.removeConnection('test-connection-1');
    
    // Check if connection was removed
    expect((BlueprintEngine as any).connections.length).toBe(0);
  });

  test('should remove connections when removing a node', () => {
    const testNode = {
      id: 'test-node-1',
      type: 'test',
      compute: jest.fn()
    };
    
    const connection1 = {
      id: 'connection-1',
      sourceNodeId: 'test-node-1',
      targetNodeId: 'other-node',
      sourcePortId: 'output1',
      targetPortId: 'input1'
    };
    
    const connection2 = {
      id: 'connection-2',
      sourceNodeId: 'other-node',
      targetNodeId: 'test-node-1',
      sourcePortId: 'output1',
      targetPortId: 'input1'
    };
    
    const connection3 = {
      id: 'connection-3',
      sourceNodeId: 'node-a',
      targetNodeId: 'node-b',
      sourcePortId: 'output1',
      targetPortId: 'input1'
    };
    
    BlueprintEngine.addNode(testNode);
    BlueprintEngine.addConnection(connection1);
    BlueprintEngine.addConnection(connection2);
    BlueprintEngine.addConnection(connection3);
    
    // Check initial state
    expect((BlueprintEngine as any).connections.length).toBe(3);
    
    // Remove the node
    BlueprintEngine.removeNode('test-node-1');
    
    // Check if related connections were removed
    expect((BlueprintEngine as any).connections.length).toBe(1);
    expect((BlueprintEngine as any).connections[0]).toBe(connection3);
  });

  test('should add and remove event listeners', () => {
    const testCallback = jest.fn();
    
    BlueprintEngine.addEventListener('test-event', testCallback);
    
    // Check if event listener was added
    expect((BlueprintEngine as any).eventListeners.get('test-event')).toBe(testCallback);
    
    // Remove the event listener
    BlueprintEngine.removeEventListener('test-event');
    
    // Check if event listener was removed
    expect((BlueprintEngine as any).eventListeners.get('test-event')).toBeUndefined();
  });

  test('should trigger events', () => {
    const eventNode1 = {
      id: 'event-node-1',
      type: 'event',
      eventType: 'test-event',
      compute: jest.fn()
    };
    
    const eventNode2 = {
      id: 'event-node-2',
      type: 'event',
      eventType: 'test-event',
      compute: jest.fn()
    };
    
    const nonEventNode = {
      id: 'non-event-node',
      type: 'regular',
      compute: jest.fn()
    };
    
    // Add nodes
    BlueprintEngine.addNode(eventNode1);
    BlueprintEngine.addNode(eventNode2);
    BlueprintEngine.addNode(nonEventNode);
    
    // Mock executeNode method
    const executeNodeSpy = jest.spyOn(BlueprintEngine, 'executeNode').mockImplementation(() => Promise.resolve({}));
    
    // Trigger event
    BlueprintEngine.triggerEvent('test-event', { testData: 'value' });
    
    // Check if executeNode was called for event nodes
    expect(executeNodeSpy).toHaveBeenCalledTimes(2);
    expect(executeNodeSpy).toHaveBeenCalledWith('event-node-1', { testData: 'value' });
    expect(executeNodeSpy).toHaveBeenCalledWith('event-node-2', { testData: 'value' });
    
    // Restore original method
    executeNodeSpy.mockRestore();
  });

  test('should execute a node', async () => {
    const testNode = {
      id: 'test-node',
      type: 'test',
      outputs: {},
      compute: jest.fn().mockResolvedValue({ result: 'test-output' })
    };
    
    BlueprintEngine.addNode(testNode);
    
    // Mock gatherNodeInputs and propagateOutputs methods
    const gatherNodeInputsSpy = jest.spyOn(BlueprintEngine as any, 'gatherNodeInputs').mockReturnValue({ input1: 'test-input' });
    const propagateOutputsSpy = jest.spyOn(BlueprintEngine as any, 'propagateOutputs').mockImplementation(() => {});
    
    // Execute node
    const result = await BlueprintEngine.executeNode('test-node', { externalInput: 'value' });
    
    // Check if methods were called correctly
    expect(gatherNodeInputsSpy).toHaveBeenCalledWith('test-node', { externalInput: 'value' });
    expect(testNode.compute).toHaveBeenCalledWith({ input1: 'test-input' }, testNode.data);
    expect(propagateOutputsSpy).toHaveBeenCalledWith('test-node', { result: 'test-output' });
    
    // Check result
    expect(result).toEqual({ result: 'test-output' });
    
    // Restore original methods
    gatherNodeInputsSpy.mockRestore();
    propagateOutputsSpy.mockRestore();
  });

  test('should gather node inputs', () => {
    // Set up test nodes and connections
    const sourceNode1 = {
      id: 'source-node-1',
      outputs: {
        output1: 'source-value-1'
      }
    };
    
    const sourceNode2 = {
      id: 'source-node-2',
      outputs: {
        output2: 'source-value-2'
      }
    };
    
    const targetNode = {
      id: 'target-node'
    };
    
    // Add nodes
    BlueprintEngine.addNode(sourceNode1);
    BlueprintEngine.addNode(sourceNode2);
    BlueprintEngine.addNode(targetNode);
    
    // Add connections
    BlueprintEngine.addConnection({
      id: 'connection-1',
      sourceNodeId: 'source-node-1',
      targetNodeId: 'target-node',
      sourcePortId: 'output1',
      targetPortId: 'input1'
    });
    
    BlueprintEngine.addConnection({
      id: 'connection-2',
      sourceNodeId: 'source-node-2',
      targetNodeId: 'target-node',
      sourcePortId: 'output2',
      targetPortId: 'input2'
    });
    
    // Call gatherNodeInputs
    const inputs = (BlueprintEngine as any).gatherNodeInputs('target-node', { externalInput: 'external-value' });
    
    // Check gathered inputs
    expect(inputs).toEqual({
      externalInput: 'external-value',
      input1: 'source-value-1',
      input2: 'source-value-2'
    });
  });

  test('should propagate outputs', async () => {
    // Set up test nodes and connections
    const sourceNode = {
      id: 'source-node',
      outputs: {}
    };
    
    const targetNode1 = {
      id: 'target-node-1'
    };
    
    const targetNode2 = {
      id: 'target-node-2'
    };
    
    // Add nodes
    BlueprintEngine.addNode(sourceNode);
    BlueprintEngine.addNode(targetNode1);
    BlueprintEngine.addNode(targetNode2);
    
    // Add connections
    BlueprintEngine.addConnection({
      id: 'connection-1',
      sourceNodeId: 'source-node',
      targetNodeId: 'target-node-1',
      sourcePortId: 'output1',
      targetPortId: 'input1'
    });
    
    BlueprintEngine.addConnection({
      id: 'connection-2',
      sourceNodeId: 'source-node',
      targetNodeId: 'target-node-2',
      sourcePortId: 'output2',
      targetPortId: 'input2'
    });
    
    // Mock executeNode method
    const executeNodeSpy = jest.spyOn(BlueprintEngine, 'executeNode').mockImplementation(() => Promise.resolve({}));
    
    // Call propagateOutputs
    (BlueprintEngine as any).propagateOutputs('source-node', {
      output1: 'value1',
      output2: 'value2',
      output3: 'value3' // No connection for this output
    });
    
    // Check if executeNode was called for connected outputs
    expect(executeNodeSpy).toHaveBeenCalledTimes(2);
    expect(executeNodeSpy).toHaveBeenCalledWith('target-node-1', {
      input1: 'value1'
    });
    expect(executeNodeSpy).toHaveBeenCalledWith('target-node-2', {
      input2: 'value2'
    });
    
    // Restore original method
    executeNodeSpy.mockRestore();
  });
});
