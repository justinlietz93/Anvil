import { NodeDefinition } from '../services/BlueprintRegistry';

/**
 * Logic operation nodes for the Blueprint System
 * 
 * @author Justin Lietz
 */

/**
 * AND Node - Logical AND operation
 */
export const AndNode: NodeDefinition = {
  id: 'logic-and',
  type: 'logic',
  category: 'Logic',
  name: 'AND',
  description: 'Logical AND operation',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'boolean',
      description: 'First boolean value',
      required: true,
      defaultValue: false
    },
    {
      id: 'b',
      name: 'B',
      type: 'boolean',
      description: 'Second boolean value',
      required: true,
      defaultValue: false
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
      type: 'boolean',
      description: 'The result of A AND B',
      required: false,
      defaultValue: false
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = Boolean(inputs.a);
    const b = Boolean(inputs.b);
    
    return {
      flow: true,
      result: a && b
    };
  }
};

/**
 * OR Node - Logical OR operation
 */
export const OrNode: NodeDefinition = {
  id: 'logic-or',
  type: 'logic',
  category: 'Logic',
  name: 'OR',
  description: 'Logical OR operation',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'boolean',
      description: 'First boolean value',
      required: true,
      defaultValue: false
    },
    {
      id: 'b',
      name: 'B',
      type: 'boolean',
      description: 'Second boolean value',
      required: true,
      defaultValue: false
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
      type: 'boolean',
      description: 'The result of A OR B',
      required: false,
      defaultValue: false
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = Boolean(inputs.a);
    const b = Boolean(inputs.b);
    
    return {
      flow: true,
      result: a || b
    };
  }
};

/**
 * NOT Node - Logical NOT operation
 */
export const NotNode: NodeDefinition = {
  id: 'logic-not',
  type: 'logic',
  category: 'Logic',
  name: 'NOT',
  description: 'Logical NOT operation',
  
  inputs: [
    {
      id: 'value',
      name: 'Value',
      type: 'boolean',
      description: 'Boolean value to negate',
      required: true,
      defaultValue: false
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
      type: 'boolean',
      description: 'The result of NOT Value',
      required: false,
      defaultValue: false
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const value = Boolean(inputs.value);
    
    return {
      flow: true,
      result: !value
    };
  }
};

/**
 * Equal Node - Check if two values are equal
 */
export const EqualNode: NodeDefinition = {
  id: 'logic-equal',
  type: 'logic',
  category: 'Logic',
  name: 'Equal',
  description: 'Check if two values are equal',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'any',
      description: 'First value',
      required: true,
      defaultValue: null
    },
    {
      id: 'b',
      name: 'B',
      type: 'any',
      description: 'Second value',
      required: true,
      defaultValue: null
    },
    {
      id: 'strict',
      name: 'Strict',
      type: 'boolean',
      description: 'Use strict equality (===)',
      required: false,
      defaultValue: false
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
      type: 'boolean',
      description: 'Whether A and B are equal',
      required: false,
      defaultValue: false
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = inputs.a;
    const b = inputs.b;
    const strict = Boolean(inputs.strict);
    
    let result;
    
    if (strict) {
      result = a === b;
    } else {
      result = a == b;
    }
    
    return {
      flow: true,
      result
    };
  }
};

/**
 * Compare Node - Compare two values
 */
export const CompareNode: NodeDefinition = {
  id: 'logic-compare',
  type: 'logic',
  category: 'Logic',
  name: 'Compare',
  description: 'Compare two values',
  
  inputs: [
    {
      id: 'a',
      name: 'A',
      type: 'number',
      description: 'First value',
      required: true,
      defaultValue: 0
    },
    {
      id: 'b',
      name: 'B',
      type: 'number',
      description: 'Second value',
      required: true,
      defaultValue: 0
    },
    {
      id: 'operator',
      name: 'Operator',
      type: 'string',
      description: 'Comparison operator',
      required: true,
      defaultValue: '==',
      options: ['==', '!=', '>', '<', '>=', '<=']
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
      type: 'boolean',
      description: 'The result of the comparison',
      required: false,
      defaultValue: false
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const a = Number(inputs.a) || 0;
    const b = Number(inputs.b) || 0;
    const operator = inputs.operator || '==';
    
    let result = false;
    
    switch (operator) {
      case '==':
        result = a == b;
        break;
      case '!=':
        result = a != b;
        break;
      case '>':
        result = a > b;
        break;
      case '<':
        result = a < b;
        break;
      case '>=':
        result = a >= b;
        break;
      case '<=':
        result = a <= b;
        break;
    }
    
    return {
      flow: true,
      result
    };
  }
};

// Export all logic nodes
export const LogicNodes = [
  AndNode,
  OrNode,
  NotNode,
  EqualNode,
  CompareNode
];
