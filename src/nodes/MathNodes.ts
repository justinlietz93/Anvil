import { NodeDefinition } from '../services/BlueprintRegistry';

/**
 * Math operation nodes for the Blueprint System
 * 
 * @author Justin Lietz
 */

/**
 * Add Node - Add two numbers
 */
export const AddNode: NodeDefinition = {
  id: 'math-add',
  type: 'math',
  category: 'Math',
  name: 'Add',
  description: 'Add two numbers',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'number',
      description: 'First number',
      required: true,
      defaultValue: 0
    },
    {
      id: 'b',
      name: 'B',
      type: 'number',
      description: 'Second number',
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
      id: 'result',
      name: 'Result',
      type: 'number',
      description: 'The sum of A and B',
      required: false,
      defaultValue: 0
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    
    return {
      flow: true,
      result: a + b
    };
  }
};

/**
 * Subtract Node - Subtract one number from another
 */
export const SubtractNode: NodeDefinition = {
  id: 'math-subtract',
  type: 'math',
  category: 'Math',
  name: 'Subtract',
  description: 'Subtract one number from another',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'number',
      description: 'Number to subtract from',
      required: true,
      defaultValue: 0
    },
    {
      id: 'b',
      name: 'B',
      type: 'number',
      description: 'Number to subtract',
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
      id: 'result',
      name: 'Result',
      type: 'number',
      description: 'The result of A - B',
      required: false,
      defaultValue: 0
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    
    return {
      flow: true,
      result: a - b
    };
  }
};

/**
 * Multiply Node - Multiply two numbers
 */
export const MultiplyNode: NodeDefinition = {
  id: 'math-multiply',
  type: 'math',
  category: 'Math',
  name: 'Multiply',
  description: 'Multiply two numbers',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'number',
      description: 'First number',
      required: true,
      defaultValue: 0
    },
    {
      id: 'b',
      name: 'B',
      type: 'number',
      description: 'Second number',
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
      id: 'result',
      name: 'Result',
      type: 'number',
      description: 'The product of A and B',
      required: false,
      defaultValue: 0
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    
    return {
      flow: true,
      result: a * b
    };
  }
};

/**
 * Divide Node - Divide one number by another
 */
export const DivideNode: NodeDefinition = {
  id: 'math-divide',
  type: 'math',
  category: 'Math',
  name: 'Divide',
  description: 'Divide one number by another',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'number',
      description: 'Number to divide (numerator)',
      required: true,
      defaultValue: 0
    },
    {
      id: 'b',
      name: 'B',
      type: 'number',
      description: 'Number to divide by (denominator)',
      required: true,
      defaultValue: 1
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
      id: 'result',
      name: 'Result',
      type: 'number',
      description: 'The result of A / B',
      required: false,
      defaultValue: 0
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if division by zero',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    
    if (b === 0) {
      return {
        flow: true,
        result: 0,
        error: 'Division by zero'
      };
    }
    
    return {
      flow: true,
      result: a / b,
      error: ''
    };
  }
};

/**
 * Modulo Node - Get the remainder of division
 */
export const ModuloNode: NodeDefinition = {
  id: 'math-modulo',
  type: 'math',
  category: 'Math',
  name: 'Modulo',
  description: 'Get the remainder of division',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'number',
      description: 'Number to divide (numerator)',
      required: true,
      defaultValue: 0
    },
    {
      id: 'b',
      name: 'B',
      type: 'number',
      description: 'Number to divide by (denominator)',
      required: true,
      defaultValue: 1
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
      id: 'result',
      name: 'Result',
      type: 'number',
      description: 'The remainder of A / B',
      required: false,
      defaultValue: 0
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if division by zero',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    
    if (b === 0) {
      return {
        flow: true,
        result: 0,
        error: 'Division by zero'
      };
    }
    
    return {
      flow: true,
      result: a % b,
      error: ''
    };
  }
};

// Export all math nodes
export const MathNodes = [
  AddNode,
  SubtractNode,
  MultiplyNode,
  DivideNode,
  ModuloNode
];
