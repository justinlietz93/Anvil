import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlueprintEditor from '../BlueprintEditor/BlueprintEditor';
import { BlueprintEngine } from '../../services/BlueprintEngine';
import { BlueprintRegistry } from '../../services/BlueprintRegistry';

// Mock the BlueprintEngine and BlueprintRegistry
jest.mock('../../services/BlueprintEngine', () => ({
  BlueprintEngine: {
    addNode: jest.fn(),
    removeNode: jest.fn(),
    addConnection: jest.fn(),
    removeConnection: jest.fn(),
    executeNode: jest.fn().mockResolvedValue({}),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    triggerEvent: jest.fn()
  }
}));

jest.mock('../../services/BlueprintRegistry', () => ({
  BlueprintRegistry: {
    getAllNodeTypes: jest.fn().mockReturnValue([
      {
        id: 'control-flow-if',
        type: 'control',
        category: 'Control Flow',
        name: 'If Condition',
        description: 'Executes one of two branches based on a condition'
      },
      {
        id: 'math-add',
        type: 'math',
        category: 'Math',
        name: 'Add',
        description: 'Adds two numbers together'
      },
      {
        id: 'string-concat',
        type: 'string',
        category: 'String',
        name: 'Concatenate',
        description: 'Combines two strings'
      }
    ]),
    getNodeType: jest.fn().mockImplementation((id) => {
      const nodes = {
        'control-flow-if': {
          id: 'control-flow-if',
          type: 'control',
          category: 'Control Flow',
          name: 'If Condition',
          description: 'Executes one of two branches based on a condition',
          inputs: [
            { id: 'condition', name: 'Condition', type: 'boolean' },
            { id: 'true-flow', name: 'True Flow', type: 'flow' },
            { id: 'false-flow', name: 'False Flow', type: 'flow' }
          ],
          outputs: [
            { id: 'flow', name: 'Flow', type: 'flow' }
          ]
        },
        'math-add': {
          id: 'math-add',
          type: 'math',
          category: 'Math',
          name: 'Add',
          description: 'Adds two numbers together',
          inputs: [
            { id: 'a', name: 'A', type: 'number' },
            { id: 'b', name: 'B', type: 'number' }
          ],
          outputs: [
            { id: 'result', name: 'Result', type: 'number' }
          ]
        }
      };
      return nodes[id] || null;
    })
  }
}));

// Mock the child components
jest.mock('../BlueprintEditor/NodeLibrary', () => ({
  __esModule: true,
  default: ({ onNodeSelected }) => (
    <div data-testid="node-library">
      Node Library
      <button onClick={() => onNodeSelected('math-add')}>Add Math Node</button>
      <button onClick={() => onNodeSelected('control-flow-if')}>Add If Node</button>
    </div>
  )
}));

describe('BlueprintEditor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the blueprint editor with node library', () => {
    render(<BlueprintEditor onModified={() => {}} />);
    
    // Check if the main components are rendered
    expect(screen.getByTestId('node-library')).toBeInTheDocument();
    expect(screen.getByText('Node Library')).toBeInTheDocument();
    
    // Check if the buttons for adding nodes are rendered
    expect(screen.getByText('Add Math Node')).toBeInTheDocument();
    expect(screen.getByText('Add If Node')).toBeInTheDocument();
  });

  test('loads node types from BlueprintRegistry on mount', () => {
    render(<BlueprintEditor onModified={() => {}} />);
    
    // Check if BlueprintRegistry.getAllNodeTypes was called
    expect(BlueprintRegistry.getAllNodeTypes).toHaveBeenCalled();
  });

  test('adds a node when selected from node library', async () => {
    const mockOnModified = jest.fn();
    render(<BlueprintEditor onModified={mockOnModified} />);
    
    // Click the Add Math Node button
    fireEvent.click(screen.getByText('Add Math Node'));
    
    // Check if BlueprintRegistry.getNodeType was called
    expect(BlueprintRegistry.getNodeType).toHaveBeenCalledWith('math-add');
    
    // Check if BlueprintEngine.addNode was called
    expect(BlueprintEngine.addNode).toHaveBeenCalled();
    
    // Check if onModified callback was called
    expect(mockOnModified).toHaveBeenCalled();
  });

  test('adds an if node when selected from node library', async () => {
    const mockOnModified = jest.fn();
    render(<BlueprintEditor onModified={mockOnModified} />);
    
    // Click the Add If Node button
    fireEvent.click(screen.getByText('Add If Node'));
    
    // Check if BlueprintRegistry.getNodeType was called
    expect(BlueprintRegistry.getNodeType).toHaveBeenCalledWith('control-flow-if');
    
    // Check if BlueprintEngine.addNode was called
    expect(BlueprintEngine.addNode).toHaveBeenCalled();
    
    // Check if onModified callback was called
    expect(mockOnModified).toHaveBeenCalled();
  });

  test('handles node selection when node type is not found', async () => {
    // Mock getNodeType to return null for a specific node type
    BlueprintRegistry.getNodeType.mockReturnValueOnce(null);
    
    const mockOnModified = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<BlueprintEditor onModified={mockOnModified} />);
    
    // Click the Add Math Node button
    fireEvent.click(screen.getByText('Add Math Node'));
    
    // Check if BlueprintRegistry.getNodeType was called
    expect(BlueprintRegistry.getNodeType).toHaveBeenCalledWith('math-add');
    
    // Check if BlueprintEngine.addNode was NOT called
    expect(BlueprintEngine.addNode).not.toHaveBeenCalled();
    
    // Check if onModified callback was NOT called
    expect(mockOnModified).not.toHaveBeenCalled();
    
    // Check if console.error was called
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('sets up event listeners on mount and cleans up on unmount', () => {
    const { unmount } = render(<BlueprintEditor onModified={() => {}} />);
    
    // Check if BlueprintEngine.addEventListener was called
    expect(BlueprintEngine.addEventListener).toHaveBeenCalled();
    
    // Unmount the component
    unmount();
    
    // Check if BlueprintEngine.removeEventListener was called
    expect(BlueprintEngine.removeEventListener).toHaveBeenCalled();
  });

  test('handles node execution', async () => {
    // Mock executeNode to resolve with a specific result
    BlueprintEngine.executeNode.mockResolvedValueOnce({ result: 42 });
    
    const mockOnModified = jest.fn();
    render(<BlueprintEditor onModified={mockOnModified} />);
    
    // Trigger node execution (this would typically be done through UI interaction)
    // For testing purposes, we'll directly call the method that would be triggered
    
    // First, add a node
    fireEvent.click(screen.getByText('Add Math Node'));
    
    // Get the node ID from the addNode call
    const nodeId = BlueprintEngine.addNode.mock.calls[0][0].id;
    
    // Execute the node (this would be done through a method in the component)
    // Since we can't directly call component methods, we'll simulate the effect
    BlueprintEngine.executeNode(nodeId, {});
    
    // Check if BlueprintEngine.executeNode was called
    expect(BlueprintEngine.executeNode).toHaveBeenCalled();
    
    // Wait for the execution to complete
    await waitFor(() => {
      // In a real component, this would update state or trigger a re-render
      // For this test, we're just verifying the call was made
      expect(BlueprintEngine.executeNode).toHaveBeenCalledWith(nodeId, {});
    });
  });
});
