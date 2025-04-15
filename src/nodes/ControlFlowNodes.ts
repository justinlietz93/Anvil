import { NodeDefinition } from '../services/BlueprintRegistry';
import { ConfigManager } from '../services/ConfigManager';

/**
 * Basic control flow nodes for the Blueprint System
 * 
 * @author Justin Lietz
 */

/**
 * Branch Node - Conditional execution based on a boolean input
 */
export const BranchNode: NodeDefinition = {
  id: 'branch',
  type: 'control',
  category: 'Control Flow',
  name: 'Branch',
  description: 'Conditionally execute one of two paths based on a boolean condition',
  
  inputs: [
    {
      id: 'condition',
      name: 'Condition',
      type: 'boolean',
      description: 'The condition to evaluate',
      required: true,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'controlFlow', 'ifDefaultCondition'], false)
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'true',
      name: 'True',
      type: 'flow',
      description: 'Execution flow when condition is true',
      required: false,
      defaultValue: null
    },
    {
      id: 'false',
      name: 'False',
      type: 'flow',
      description: 'Execution flow when condition is false',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    if (inputs.condition) {
      return { true: true };
    } else {
      return { false: true };
    }
  }
};

/**
 * Sequence Node - Execute a series of nodes in sequence
 */
export const SequenceNode: NodeDefinition = {
  id: 'sequence',
  type: 'control',
  category: 'Control Flow',
  name: 'Sequence',
  description: 'Execute a series of nodes in sequence',
  
  inputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'flow1',
      name: 'Flow 1',
      type: 'flow',
      description: 'First execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'flow2',
      name: 'Flow 2',
      type: 'flow',
      description: 'Second execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'flow3',
      name: 'Flow 3',
      type: 'flow',
      description: 'Third execution flow output',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    return {
      flow1: true,
      flow2: true,
      flow3: true
    };
  }
};

/**
 * Delay Node - Pause execution for a specified time
 */
export const DelayNode: NodeDefinition = {
  id: 'delay',
  type: 'control',
  category: 'Control Flow',
  name: 'Delay',
  description: 'Pause execution for a specified time in milliseconds',
  
  inputs: [
    {
      id: 'delay',
      name: 'Delay (ms)',
      type: 'number',
      description: 'The delay in milliseconds',
      required: true,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'controlFlow', 'defaultDelay'], 1000)
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output after delay',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: async (inputs: any, data: any) => {
    await new Promise(resolve => setTimeout(resolve, inputs.delay));
    return { flow: true };
  }
};

/**
 * Loop Node - Execute a flow repeatedly
 */
export const LoopNode: NodeDefinition = {
  id: 'loop',
  type: 'control',
  category: 'Control Flow',
  name: 'Loop',
  description: 'Execute a flow repeatedly for a specified number of iterations',
  
  inputs: [
    {
      id: 'iterations',
      name: 'Iterations',
      type: 'number',
      description: 'The number of iterations',
      required: true,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'controlFlow', 'loopInitialCount'], 5)
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'loop',
      name: 'Loop',
      type: 'flow',
      description: 'Execution flow for each iteration',
      required: false,
      defaultValue: null
    },
    {
      id: 'complete',
      name: 'Complete',
      type: 'flow',
      description: 'Execution flow when all iterations are complete',
      required: false,
      defaultValue: null
    },
    {
      id: 'index',
      name: 'Index',
      type: 'number',
      description: 'The current iteration index (0-based)',
      required: false,
      defaultValue: 0
    }
  ],
  
  compute: (inputs: any, data: any) => {
    // In a real implementation, this would be more complex to handle the loop
    // For now, we'll just return the outputs for demonstration
    return {
      loop: true,
      complete: true,
      index: 0
    };
  }
};

/**
 * ForEach Node - Execute a flow for each item in an array
 */
export const ForEachNode: NodeDefinition = {
  id: 'foreach',
  type: 'control',
  category: 'Control Flow',
  name: 'ForEach',
  description: 'Execute a flow for each item in an array',
  
  inputs: [
    {
      id: 'array',
      name: 'Array',
      type: 'array',
      description: 'The array to iterate over',
      required: true,
      defaultValue: []
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'item',
      name: 'Item',
      type: 'any',
      description: 'The current item in the array',
      required: false,
      defaultValue: null
    },
    {
      id: 'index',
      name: 'Index',
      type: 'number',
      description: 'The current item index (0-based)',
      required: false,
      defaultValue: 0
    },
    {
      id: 'loop',
      name: 'Loop',
      type: 'flow',
      description: 'Execution flow for each item',
      required: false,
      defaultValue: null
    },
    {
      id: 'complete',
      name: 'Complete',
      type: 'flow',
      description: 'Execution flow when all items are processed',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    // In a real implementation, this would be more complex to handle the loop
    // For now, we'll just return the outputs for demonstration
    return {
      item: null,
      index: 0,
      loop: true,
      complete: true
    };
  }
};

// Export all control flow nodes
export const ControlFlowNodes = [
  BranchNode,
  SequenceNode,
  DelayNode,
  LoopNode,
  ForEachNode
];
