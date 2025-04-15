import { NodeDefinition } from '../services/BlueprintRegistry';

/**
 * UI event nodes for the Blueprint System
 * 
 * @author Justin Lietz
 */

/**
 * Button Click Node - Triggered when a button is clicked
 */
export const ButtonClickNode: NodeDefinition = {
  id: 'ui-button-click',
  type: 'event',
  category: 'UI Events',
  name: 'Button Click',
  description: 'Triggered when a button is clicked',
  
  inputs: [
    {
      id: 'buttonId',
      name: 'Button ID',
      type: 'string',
      description: 'The ID of the button to listen for clicks',
      required: true,
      defaultValue: 'button1'
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output when the button is clicked',
      required: false,
      defaultValue: null
    },
    {
      id: 'event',
      name: 'Event',
      type: 'object',
      description: 'The click event data',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    // This would be triggered by the event system
    return {
      flow: true,
      event: {
        type: 'click',
        target: inputs.buttonId,
        timestamp: Date.now()
      }
    };
  }
};

/**
 * Input Change Node - Triggered when an input value changes
 */
export const InputChangeNode: NodeDefinition = {
  id: 'ui-input-change',
  type: 'event',
  category: 'UI Events',
  name: 'Input Change',
  description: 'Triggered when an input value changes',
  
  inputs: [
    {
      id: 'inputId',
      name: 'Input ID',
      type: 'string',
      description: 'The ID of the input to listen for changes',
      required: true,
      defaultValue: 'input1'
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output when the input changes',
      required: false,
      defaultValue: null
    },
    {
      id: 'value',
      name: 'Value',
      type: 'any',
      description: 'The new input value',
      required: false,
      defaultValue: null
    },
    {
      id: 'event',
      name: 'Event',
      type: 'object',
      description: 'The change event data',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    // This would be triggered by the event system
    return {
      flow: true,
      value: '',
      event: {
        type: 'change',
        target: inputs.inputId,
        timestamp: Date.now()
      }
    };
  }
};

/**
 * Form Submit Node - Triggered when a form is submitted
 */
export const FormSubmitNode: NodeDefinition = {
  id: 'ui-form-submit',
  type: 'event',
  category: 'UI Events',
  name: 'Form Submit',
  description: 'Triggered when a form is submitted',
  
  inputs: [
    {
      id: 'formId',
      name: 'Form ID',
      type: 'string',
      description: 'The ID of the form to listen for submissions',
      required: true,
      defaultValue: 'form1'
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output when the form is submitted',
      required: false,
      defaultValue: null
    },
    {
      id: 'formData',
      name: 'Form Data',
      type: 'object',
      description: 'The form data as key-value pairs',
      required: false,
      defaultValue: null
    },
    {
      id: 'event',
      name: 'Event',
      type: 'object',
      description: 'The submit event data',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    // This would be triggered by the event system
    return {
      flow: true,
      formData: {},
      event: {
        type: 'submit',
        target: inputs.formId,
        timestamp: Date.now()
      }
    };
  }
};

/**
 * Page Load Node - Triggered when the page loads
 */
export const PageLoadNode: NodeDefinition = {
  id: 'ui-page-load',
  type: 'event',
  category: 'UI Events',
  name: 'Page Load',
  description: 'Triggered when the page loads',
  
  inputs: [],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output when the page loads',
      required: false,
      defaultValue: null
    }
  ],
  
  compute: (inputs: any, data: any) => {
    // This would be triggered by the event system
    return {
      flow: true
    };
  }
};

/**
 * Timer Node - Triggered at specified intervals
 */
export const TimerNode: NodeDefinition = {
  id: 'ui-timer',
  type: 'event',
  category: 'UI Events',
  name: 'Timer',
  description: 'Triggered at specified intervals',
  
  inputs: [
    {
      id: 'interval',
      name: 'Interval (ms)',
      type: 'number',
      description: 'The interval in milliseconds',
      required: true,
      defaultValue: 1000
    },
    {
      id: 'autoStart',
      name: 'Auto Start',
      type: 'boolean',
      description: 'Whether to start the timer automatically',
      required: false,
      defaultValue: true
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output when the timer fires',
      required: false,
      defaultValue: null
    },
    {
      id: 'count',
      name: 'Count',
      type: 'number',
      description: 'The number of times the timer has fired',
      required: false,
      defaultValue: 0
    }
  ],
  
  compute: (inputs: any, data: any) => {
    // This would be triggered by the event system
    return {
      flow: true,
      count: 0
    };
  }
};

// Export all UI event nodes
export const UIEventNodes = [
  ButtonClickNode,
  InputChangeNode,
  FormSubmitNode,
  PageLoadNode,
  TimerNode
];
