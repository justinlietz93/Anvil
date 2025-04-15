import { NodeDefinition } from '../services/BlueprintRegistry';

/**
 * UI component nodes for the Blueprint System
 * 
 * @author Justin Lietz
 */

/**
 * Button Node - Create a button component
 */
export const ButtonNode: NodeDefinition = {
  id: 'ui-button',
  type: 'component',
  category: 'UI Components',
  name: 'Button',
  description: 'Create a button component',
  
  inputs: [
    {
      id: 'id',
      name: 'ID',
      type: 'string',
      description: 'The ID of the button',
      required: true,
      defaultValue: 'button1'
    },
    {
      id: 'text',
      name: 'Text',
      type: 'string',
      description: 'The button text',
      required: true,
      defaultValue: 'Button'
    },
    {
      id: 'variant',
      name: 'Variant',
      type: 'string',
      description: 'The button variant',
      required: false,
      defaultValue: 'primary',
      options: ['primary', 'secondary', 'default']
    },
    {
      id: 'disabled',
      name: 'Disabled',
      type: 'boolean',
      description: 'Whether the button is disabled',
      required: false,
      defaultValue: false
    }
  ],
  
  outputs: [
    {
      id: 'component',
      name: 'Component',
      type: 'component',
      description: 'The button component',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    return {
      component: {
        type: 'button',
        id: inputs.id,
        props: {
          text: inputs.text,
          variant: inputs.variant,
          disabled: inputs.disabled
        }
      }
    };
  }
};

/**
 * Input Node - Create an input component
 */
export const InputNode: NodeDefinition = {
  id: 'ui-input',
  type: 'component',
  category: 'UI Components',
  name: 'Input',
  description: 'Create an input component',
  
  inputs: [
    {
      id: 'id',
      name: 'ID',
      type: 'string',
      description: 'The ID of the input',
      required: true,
      defaultValue: 'input1'
    },
    {
      id: 'label',
      name: 'Label',
      type: 'string',
      description: 'The input label',
      required: false,
      defaultValue: 'Input'
    },
    {
      id: 'placeholder',
      name: 'Placeholder',
      type: 'string',
      description: 'The input placeholder',
      required: false,
      defaultValue: 'Enter text...'
    },
    {
      id: 'type',
      name: 'Type',
      type: 'string',
      description: 'The input type',
      required: false,
      defaultValue: 'text',
      options: ['text', 'number', 'email', 'password']
    },
    {
      id: 'value',
      name: 'Value',
      type: 'string',
      description: 'The input value',
      required: false,
      defaultValue: ''
    },
    {
      id: 'disabled',
      name: 'Disabled',
      type: 'boolean',
      description: 'Whether the input is disabled',
      required: false,
      defaultValue: false
    }
  ],
  
  outputs: [
    {
      id: 'component',
      name: 'Component',
      type: 'component',
      description: 'The input component',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    return {
      component: {
        type: 'input',
        id: inputs.id,
        props: {
          label: inputs.label,
          placeholder: inputs.placeholder,
          type: inputs.type,
          value: inputs.value,
          disabled: inputs.disabled
        }
      }
    };
  }
};

/**
 * Text Node - Create a text component
 */
export const TextNode: NodeDefinition = {
  id: 'ui-text',
  type: 'component',
  category: 'UI Components',
  name: 'Text',
  description: 'Create a text component',
  
  inputs: [
    {
      id: 'id',
      name: 'ID',
      type: 'string',
      description: 'The ID of the text component',
      required: true,
      defaultValue: 'text1'
    },
    {
      id: 'text',
      name: 'Text',
      type: 'string',
      description: 'The text content',
      required: true,
      defaultValue: 'Text content'
    },
    {
      id: 'variant',
      name: 'Variant',
      type: 'string',
      description: 'The text variant',
      required: false,
      defaultValue: 'body',
      options: ['title', 'subtitle', 'heading', 'subheading', 'body', 'caption']
    }
  ],
  
  outputs: [
    {
      id: 'component',
      name: 'Component',
      type: 'component',
      description: 'The text component',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    return {
      component: {
        type: 'text',
        id: inputs.id,
        props: {
          text: inputs.text,
          variant: inputs.variant
        }
      }
    };
  }
};

/**
 * Container Node - Create a container component
 */
export const ContainerNode: NodeDefinition = {
  id: 'ui-container',
  type: 'component',
  category: 'UI Components',
  name: 'Container',
  description: 'Create a container component',
  
  inputs: [
    {
      id: 'id',
      name: 'ID',
      type: 'string',
      description: 'The ID of the container',
      required: true,
      defaultValue: 'container1'
    },
    {
      id: 'direction',
      name: 'Direction',
      type: 'string',
      description: 'The flex direction',
      required: false,
      defaultValue: 'column',
      options: ['row', 'column']
    },
    {
      id: 'gap',
      name: 'Gap',
      type: 'number',
      description: 'The gap between children',
      required: false,
      defaultValue: 8
    },
    {
      id: 'padding',
      name: 'Padding',
      type: 'number',
      description: 'The padding',
      required: false,
      defaultValue: 16
    },
    {
      id: 'children',
      name: 'Children',
      type: 'array',
      description: 'The child components',
      required: false,
      defaultValue: []
    }
  ],
  
  outputs: [
    {
      id: 'component',
      name: 'Component',
      type: 'component',
      description: 'The container component',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    return {
      component: {
        type: 'container',
        id: inputs.id,
        props: {
          direction: inputs.direction,
          gap: inputs.gap,
          padding: inputs.padding,
          children: inputs.children || []
        }
      }
    };
  }
};

/**
 * Image Node - Create an image component
 */
export const ImageNode: NodeDefinition = {
  id: 'ui-image',
  type: 'component',
  category: 'UI Components',
  name: 'Image',
  description: 'Create an image component',
  
  inputs: [
    {
      id: 'id',
      name: 'ID',
      type: 'string',
      description: 'The ID of the image',
      required: true,
      defaultValue: 'image1'
    },
    {
      id: 'src',
      name: 'Source',
      type: 'string',
      description: 'The image source URL',
      required: true,
      defaultValue: 'https://via.placeholder.com/150'
    },
    {
      id: 'alt',
      name: 'Alt Text',
      type: 'string',
      description: 'The alternative text',
      required: false,
      defaultValue: 'Image'
    },
    {
      id: 'width',
      name: 'Width',
      type: 'number',
      description: 'The image width',
      required: false,
      defaultValue: 150
    },
    {
      id: 'height',
      name: 'Height',
      type: 'number',
      description: 'The image height',
      required: false,
      defaultValue: 150
    }
  ],
  
  outputs: [
    {
      id: 'component',
      name: 'Component',
      type: 'component',
      description: 'The image component',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    return {
      component: {
        type: 'image',
        id: inputs.id,
        props: {
          src: inputs.src,
          alt: inputs.alt,
          width: inputs.width,
          height: inputs.height
        }
      }
    };
  }
};

// Export all UI component nodes
export const UIComponentNodes = [
  ButtonNode,
  InputNode,
  TextNode,
  ContainerNode,
  ImageNode
];
