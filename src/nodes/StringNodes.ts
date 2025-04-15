import { NodeDefinition } from '../services/BlueprintRegistry';
import { ConfigManager } from '../services/ConfigManager';

/**
 * String operation nodes for the Blueprint System
 * 
 * @author Justin Lietz
 */

/**
 * String Concat Node - Concatenate multiple strings
 */
export const StringConcatNode: NodeDefinition = {
  id: 'string-concat',
  type: 'string',
  category: 'Strings',
  name: 'Concatenate',
  description: 'Concatenate multiple strings together',
  
  inputs: [
    {
      id: 'string1',
      name: 'String 1',
      type: 'string',
      description: 'First string',
      required: true,
      defaultValue: ''
    },
    {
      id: 'string2',
      name: 'String 2',
      type: 'string',
      description: 'Second string',
      required: false,
      defaultValue: ''
    },
    {
      id: 'string3',
      name: 'String 3',
      type: 'string',
      description: 'Third string',
      required: false,
      defaultValue: ''
    },
    {
      id: 'separator',
      name: 'Separator',
      type: 'string',
      description: 'Separator between strings',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'string', 'defaultDelimiter'], '')
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
      type: 'string',
      description: 'The concatenated string',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const string1 = inputs.string1 || '';
    const string2 = inputs.string2 || '';
    const string3 = inputs.string3 || '';
    const separator = inputs.separator || '';
    
    const parts = [string1, string2, string3].filter(s => s !== '');
    const result = parts.join(separator);
    
    return {
      flow: true,
      result
    };
  }
};

/**
 * String Split Node - Split a string by a delimiter
 */
export const StringSplitNode: NodeDefinition = {
  id: 'string-split',
  type: 'string',
  category: 'Strings',
  name: 'Split',
  description: 'Split a string by a delimiter',
  
  inputs: [
    {
      id: 'string',
      name: 'String',
      type: 'string',
      description: 'The string to split',
      required: true,
      defaultValue: ''
    },
    {
      id: 'delimiter',
      name: 'Delimiter',
      type: 'string',
      description: 'The delimiter to split by',
      required: true,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'string', 'defaultDelimiter'], ',')
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
      description: 'The array of split strings',
      required: false,
      defaultValue: []
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const string = inputs.string || '';
    const delimiter = inputs.delimiter || ',';
    
    return {
      flow: true,
      array: string.split(delimiter)
    };
  }
};

/**
 * String Replace Node - Replace text in a string
 */
export const StringReplaceNode: NodeDefinition = {
  id: 'string-replace',
  type: 'string',
  category: 'Strings',
  name: 'Replace',
  description: 'Replace text in a string',
  
  inputs: [
    {
      id: 'string',
      name: 'String',
      type: 'string',
      description: 'The string to modify',
      required: true,
      defaultValue: ''
    },
    {
      id: 'search',
      name: 'Search',
      type: 'string',
      description: 'The text to search for',
      required: true,
      defaultValue: ''
    },
    {
      id: 'replace',
      name: 'Replace',
      type: 'string',
      description: 'The text to replace with',
      required: true,
      defaultValue: ''
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
      type: 'string',
      description: 'The modified string',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const string = inputs.string || '';
    const search = inputs.search || '';
    const replace = inputs.replace || '';
    
    if (!search) {
      return {
        flow: true,
        result: string
      };
    }
    
    return {
      flow: true,
      result: string.split(search).join(replace)
    };
  }
};

/**
 * String Length Node - Get the length of a string
 */
export const StringLengthNode: NodeDefinition = {
  id: 'string-length',
  type: 'string',
  category: 'Strings',
  name: 'Length',
  description: 'Get the length of a string',
  
  inputs: [
    {
      id: 'string',
      name: 'String',
      type: 'string',
      description: 'The string to measure',
      required: true,
      defaultValue: ''
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
      description: 'The length of the string',
      required: false,
      defaultValue: 0
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const string = inputs.string || '';
    
    return {
      flow: true,
      length: string.length
    };
  }
};

/**
 * String Case Node - Change the case of a string
 */
export const StringCaseNode: NodeDefinition = {
  id: 'string-case',
  type: 'string',
  category: 'Strings',
  name: 'Change Case',
  description: 'Change the case of a string',
  
  inputs: [
    {
      id: 'string',
      name: 'String',
      type: 'string',
      description: 'The string to modify',
      required: true,
      defaultValue: ''
    },
    {
      id: 'case',
      name: 'Case',
      type: 'string',
      description: 'The case to convert to',
      required: true,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'string', 'defaultCase'], 'lower'),
      options: ['lower', 'upper', 'title', 'sentence']
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
      type: 'string',
      description: 'The modified string',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const string = inputs.string || '';
    const caseType = inputs.case || 'lower';
    
    let result = string;
    
    switch (caseType) {
      case 'lower':
        result = string.toLowerCase();
        break;
      case 'upper':
        result = string.toUpperCase();
        break;
      case 'title':
        result = string.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      case 'sentence':
        result = string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
        break;
    }
    
    return {
      flow: true,
      result
    };
  }
};

/**
 * String Format Node - Format a string with placeholders
 */
export const StringFormatNode: NodeDefinition = {
  id: 'string-format',
  type: 'string',
  category: 'Strings',
  name: 'Format',
  description: 'Format a string with placeholders {0}, {1}, etc.',
  
  inputs: [
    {
      id: 'format',
      name: 'Format',
      type: 'string',
      description: 'Format string with {0}, {1}, etc. placeholders',
      required: true,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'string', 'defaultFormat'], '{0}')
    },
    {
      id: 'arg0',
      name: 'Argument 0',
      type: 'any',
      description: 'Value for {0} placeholder',
      required: true,
      defaultValue: ''
    },
    {
      id: 'arg1',
      name: 'Argument 1',
      type: 'any',
      description: 'Value for {1} placeholder',
      required: false,
      defaultValue: ''
    },
    {
      id: 'arg2',
      name: 'Argument 2',
      type: 'any',
      description: 'Value for {2} placeholder',
      required: false,
      defaultValue: ''
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
      type: 'string',
      description: 'The formatted string',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: (inputs: any, data: any) => {
    const format = inputs.format || '{0}';
    const args = [
      inputs.arg0 !== undefined ? inputs.arg0 : '',
      inputs.arg1 !== undefined ? inputs.arg1 : '',
      inputs.arg2 !== undefined ? inputs.arg2 : ''
    ];
    
    let result = format;
    for (let i = 0; i < args.length; i++) {
      const placeholder = `{${i}}`;
      result = result.split(placeholder).join(String(args[i]));
    }
    
    return {
      flow: true,
      result
    };
  }
};

// Export all string nodes
export const StringNodes = [
  StringConcatNode,
  StringSplitNode,
  StringReplaceNode,
  StringLengthNode,
  StringCaseNode,
  StringFormatNode
];
