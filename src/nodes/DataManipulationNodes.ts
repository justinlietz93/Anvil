import { NodeDefinition } from '../services/BlueprintRegistry';

/**
 * Data manipulation nodes for the Blueprint System
 * 
 * @author Justin Lietz
 */

/**
 * Variable Set Node - Set a variable value
 */
export const VariableSetNode: NodeDefinition = {
  id: 'variable-set',
  type: 'data',
  category: 'Variables',
  name: 'Set Variable',
  description: 'Set a variable value',
  
  inputs: [
    {
      id: 'name',
      name: 'Variable Name',
      type: 'string',
      description: 'The name of the variable to set',
      required: true,
      defaultValue: 'myVariable'
    },
    {
      id: 'value',
      name: 'Value',
      type: 'any',
      description: 'The value to set',
      required: true,
      defaultValue: null
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
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any, context: any) => {
    if (context && context.variables) {
      context.variables[inputs.name] = inputs.value;
    }
    
    return { flow: true };
  }
};

/**
 * Variable Get Node - Get a variable value
 */
export const VariableGetNode: NodeDefinition = {
  id: 'variable-get',
  type: 'data',
  category: 'Variables',
  name: 'Get Variable',
  description: 'Get a variable value',
  
  inputs: [
    {
      id: 'name',
      name: 'Variable Name',
      type: 'string',
      description: 'The name of the variable to get',
      required: true,
      defaultValue: 'myVariable'
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
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'value',
      name: 'Value',
      type: 'any',
      description: 'The variable value',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any, context: any) => {
    let value = null;
    
    if (context && context.variables && inputs.name in context.variables) {
      value = context.variables[inputs.name];
    }
    
    return {
      flow: true,
      value
    };
  }
};

/**
 * Array Create Node - Create an array
 */
export const ArrayCreateNode: NodeDefinition = {
  id: 'array-create',
  type: 'data',
  category: 'Arrays',
  name: 'Create Array',
  description: 'Create an array from input values',
  
  inputs: [
    {
      id: 'item1',
      name: 'Item 1',
      type: 'any',
      description: 'First array item',
      required: false,
      defaultValue: null
    },
    {
      id: 'item2',
      name: 'Item 2',
      type: 'any',
      description: 'Second array item',
      required: false,
      defaultValue: null
    },
    {
      id: 'item3',
      name: 'Item 3',
      type: 'any',
      description: 'Third array item',
      required: false,
      defaultValue: null
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
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'array',
      name: 'Array',
      type: 'array',
      description: 'The created array',
      required: false,
      defaultValue: []
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const array = [];
    
    if (inputs.item1 !== undefined) array.push(inputs.item1);
    if (inputs.item2 !== undefined) array.push(inputs.item2);
    if (inputs.item3 !== undefined) array.push(inputs.item3);
    
    return {
      flow: true,
      array
    };
  }
};

/**
 * Array Get Item Node - Get an item from an array
 */
export const ArrayGetItemNode: NodeDefinition = {
  id: 'array-get-item',
  type: 'data',
  category: 'Arrays',
  name: 'Get Array Item',
  description: 'Get an item from an array at the specified index',
  
  inputs: [
    {
      id: 'array',
      name: 'Array',
      type: 'array',
      description: 'The array to get an item from',
      required: true,
      defaultValue: []
    },
    {
      id: 'index',
      name: 'Index',
      type: 'number',
      description: 'The index of the item to get (0-based)',
      required: true,
      defaultValue: 0
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
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'item',
      name: 'Item',
      type: 'any',
      description: 'The item at the specified index',
      required: false,
      defaultValue: null
    },
    {
      id: 'found',
      name: 'Found',
      type: 'boolean',
      description: 'Whether the item was found',
      required: false,
      defaultValue: false
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const array = inputs.array || [];
    const index = inputs.index || 0;
    
    if (Array.isArray(array) && index >= 0 && index < array.length) {
      return {
        flow: true,
        item: array[index],
        found: true
      };
    }
    
    return {
      flow: true,
      item: null,
      found: false
    };
  }
};

/**
 * Array Length Node - Get the length of an array
 */
export const ArrayLengthNode: NodeDefinition = {
  id: 'array-length',
  type: 'data',
  category: 'Arrays',
  name: 'Array Length',
  description: 'Get the length of an array',
  
  inputs: [
    {
      id: 'array',
      name: 'Array',
      type: 'array',
      description: 'The array to get the length of',
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
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'length',
      name: 'Length',
      type: 'number',
      description: 'The length of the array',
      required: false,
      defaultValue: 0
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const array = inputs.array || [];
    
    return {
      flow: true,
      length: Array.isArray(array) ? array.length : 0
    };
  }
};

// Export all data manipulation nodes
export const DataManipulationNodes = [
  VariableSetNode,
  VariableGetNode,
  ArrayCreateNode,
  ArrayGetItemNode,
  ArrayLengthNode
];
