import { BlueprintRegistry, NodeDefinition, PortDefinition } from '../BlueprintRegistry';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid to return predictable values
jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('BlueprintRegistry', () => {
  let mockNode: NodeDefinition;
  
  beforeEach(() => {
    // Reset the mock and set a fixed return value for testing
    (uuidv4 as jest.Mock).mockReset();
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid');
    
    // Clear the registry before each test
    BlueprintRegistry['nodes'] = new Map();
    
    // Create a mock node for testing
    mockNode = {
      id: 'test-node',
      type: 'event',
      category: 'Events',
      name: 'Test Node',
      description: 'A test node',
      inputs: [
        {
          id: 'input1',
          name: 'Input 1',
          type: 'string',
          description: 'Test input',
          required: true,
          defaultValue: ''
        }
      ],
      outputs: [
        {
          id: 'output1',
          name: 'Output 1',
          type: 'string',
          description: 'Test output',
          required: false,
          defaultValue: null
        }
      ],
      compute: jest.fn()
    };
  });
  
  describe('registerNode', () => {
    it('should register a node in the registry', () => {
      BlueprintRegistry.registerNode(mockNode);
      
      const retrievedNode = BlueprintRegistry.getNode('test-node');
      expect(retrievedNode).toEqual(mockNode);
    });
    
    it('should override an existing node with the same ID', () => {
      BlueprintRegistry.registerNode(mockNode);
      
      const updatedNode = {
        ...mockNode,
        name: 'Updated Node'
      };
      
      BlueprintRegistry.registerNode(updatedNode);
      
      const retrievedNode = BlueprintRegistry.getNode('test-node');
      expect(retrievedNode).toEqual(updatedNode);
    });
  });
  
  describe('getNode', () => {
    it('should return the node with the specified ID', () => {
      BlueprintRegistry.registerNode(mockNode);
      
      const retrievedNode = BlueprintRegistry.getNode('test-node');
      expect(retrievedNode).toEqual(mockNode);
    });
    
    it('should return undefined if the node does not exist', () => {
      const retrievedNode = BlueprintRegistry.getNode('non-existent');
      expect(retrievedNode).toBeUndefined();
    });
  });
  
  describe('getAllNodes', () => {
    it('should return all registered nodes', () => {
      BlueprintRegistry.registerNode(mockNode);
      
      const anotherNode = {
        ...mockNode,
        id: 'test-node2',
        name: 'Test Node 2'
      };
      
      BlueprintRegistry.registerNode(anotherNode);
      
      const allNodes = BlueprintRegistry.getAllNodes();
      expect(allNodes).toHaveLength(2);
      expect(allNodes).toContainEqual(mockNode);
      expect(allNodes).toContainEqual(anotherNode);
    });
    
    it('should return an empty array if no nodes are registered', () => {
      const allNodes = BlueprintRegistry.getAllNodes();
      expect(allNodes).toHaveLength(0);
    });
  });
  
  describe('getNodesByCategory', () => {
    it('should return nodes in the specified category', () => {
      BlueprintRegistry.registerNode(mockNode);
      
      const anotherCategory = {
        ...mockNode,
        id: 'test-node2',
        name: 'Test Node 2',
        category: 'Logic'
      };
      
      BlueprintRegistry.registerNode(anotherCategory);
      
      const eventsNodes = BlueprintRegistry.getNodesByCategory('Events');
      expect(eventsNodes).toHaveLength(1);
      expect(eventsNodes[0]).toEqual(mockNode);
      
      const logicNodes = BlueprintRegistry.getNodesByCategory('Logic');
      expect(logicNodes).toHaveLength(1);
      expect(logicNodes[0]).toEqual(anotherCategory);
    });
    
    it('should return an empty array if no nodes are in the category', () => {
      BlueprintRegistry.registerNode(mockNode);
      
      const nonExistentCategory = BlueprintRegistry.getNodesByCategory('Non-Existent');
      expect(nonExistentCategory).toHaveLength(0);
    });
  });
  
  describe('getAllCategories', () => {
    it('should return all unique categories', () => {
      BlueprintRegistry.registerNode(mockNode);
      
      const anotherCategory = {
        ...mockNode,
        id: 'test-node2',
        name: 'Test Node 2',
        category: 'Logic'
      };
      
      const sameCategory = {
        ...mockNode,
        id: 'test-node3',
        name: 'Test Node 3'
      };
      
      BlueprintRegistry.registerNode(anotherCategory);
      BlueprintRegistry.registerNode(sameCategory);
      
      const categories = BlueprintRegistry.getAllCategories();
      expect(categories).toHaveLength(2);
      expect(categories).toContain('Events');
      expect(categories).toContain('Logic');
    });
    
    it('should return an empty array if no nodes are registered', () => {
      const categories = BlueprintRegistry.getAllCategories();
      expect(categories).toHaveLength(0);
    });
  });
  
  describe('createNodeInstance', () => {
    it('should create a node instance from a registered node', () => {
      BlueprintRegistry.registerNode(mockNode);
      
      const position = { x: 100, y: 200 };
      const instance = BlueprintRegistry.createNodeInstance('test-node', position);
      
      expect(instance).toEqual({
        id: 'test-uuid',
        type: 'test-node',
        position,
        data: {},
        inputs: {
          input1: ''
        },
        outputs: {
          output1: null
        }
      });
    });
    
    it('should include default data if provided in the node definition', () => {
      const nodeWithData = {
        ...mockNode,
        defaultData: { foo: 'bar' }
      };
      
      BlueprintRegistry.registerNode(nodeWithData);
      
      const position = { x: 100, y: 200 };
      const instance = BlueprintRegistry.createNodeInstance('test-node', position);
      
      expect(instance?.data).toEqual({ foo: 'bar' });
    });
    
    it('should return null if the node does not exist', () => {
      const position = { x: 100, y: 200 };
      const instance = BlueprintRegistry.createNodeInstance('non-existent', position);
      expect(instance).toBeNull();
    });
  });
  
  describe('createConnection', () => {
    it('should create a connection between two nodes', () => {
      const connection = BlueprintRegistry.createConnection(
        'source-node',
        'source-port',
        'target-node',
        'target-port'
      );
      
      expect(connection).toEqual({
        id: 'test-uuid',
        sourceNodeId: 'source-node',
        sourcePortId: 'source-port',
        targetNodeId: 'target-node',
        targetPortId: 'target-port'
      });
    });
  });
  
  describe('createBlueprint', () => {
    it('should create a new blueprint with the specified name and description', () => {
      const blueprint = BlueprintRegistry.createBlueprint('Test Blueprint', 'A test blueprint');
      
      expect(blueprint).toEqual({
        id: 'test-uuid',
        name: 'Test Blueprint',
        description: 'A test blueprint',
        nodes: [],
        connections: []
      });
    });
  });
});
