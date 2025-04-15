import { ConfigManager } from '../services/ConfigManager';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for LLM node definitions
 */
export interface LLMNodeDefinition {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  inputs: any[];
  outputs: any[];
  compute: Function;
}

/**
 * LLM Text Generation Node - Generate text using an LLM
 */
export const LLMTextGenerationNode: LLMNodeDefinition = {
  id: 'llm-text-generation',
  type: 'llm',
  category: 'LLM',
  name: 'Text Generation',
  description: 'Generate text using an LLM provider',
  
  inputs: [
    {
      id: 'providerId',
      name: 'Provider ID',
      type: 'string',
      description: 'The ID of the LLM provider',
      required: true,
      defaultValue: ''
    },
    {
      id: 'prompt',
      name: 'Prompt',
      type: 'string',
      description: 'The prompt to send to the LLM',
      required: true,
      defaultValue: 'Generate a creative story about a robot learning to paint.'
    },
    {
      id: 'systemPrompt',
      name: 'System Prompt',
      type: 'string',
      description: 'System instructions for the LLM',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'llm', 'defaultSystemPrompt'], 'You are a helpful assistant.')
    },
    {
      id: 'maxTokens',
      name: 'Max Tokens',
      type: 'number',
      description: 'The maximum number of tokens to generate',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'llm', 'defaultMaxTokens'], 1000)
    },
    {
      id: 'temperature',
      name: 'Temperature',
      type: 'number',
      description: 'The temperature for text generation (0.0-1.0)',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'llm', 'defaultTemperature'], 0.7)
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
      id: 'text',
      name: 'Text',
      type: 'string',
      description: 'The generated text',
      required: false,
      defaultValue: ''
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the text generation was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the text generation failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { LLMAgentIntegration } = await import('../services/LLMAgentIntegration');
      
      const providerId = inputs.providerId;
      const prompt = inputs.prompt;
      const systemPrompt = inputs.systemPrompt || ConfigManager.getNested('nodes', ['defaults', 'llm', 'defaultSystemPrompt'], 'You are a helpful assistant.');
      const maxTokens = inputs.maxTokens || ConfigManager.getNested('nodes', ['defaults', 'llm', 'defaultMaxTokens'], 1000);
      const temperature = inputs.temperature || ConfigManager.getNested('nodes', ['defaults', 'llm', 'defaultTemperature'], 0.7);
      
      if (!providerId) {
        return {
          flow: true,
          text: '',
          success: false,
          error: 'No provider ID provided'
        };
      }
      
      if (!prompt) {
        return {
          flow: true,
          text: '',
          success: false,
          error: 'No prompt provided'
        };
      }
      
      const result = await LLMAgentIntegration.sendRequest(providerId, {
        prompt,
        systemPrompt,
        maxTokens,
        temperature
      });
      
      return {
        flow: true,
        text: result.text || '',
        success: result.success,
        error: result.error || ''
      };
    } catch (error) {
      return {
        flow: true,
        text: '',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * LLM Classification Node - Classify text using an LLM
 */
export const LLMClassificationNode: LLMNodeDefinition = {
  id: 'llm-classification',
  type: 'llm',
  category: 'LLM',
  name: 'Classification',
  description: 'Classify text using an LLM provider',
  
  inputs: [
    {
      id: 'providerId',
      name: 'Provider ID',
      type: 'string',
      description: 'The ID of the LLM provider',
      required: true,
      defaultValue: ''
    },
    {
      id: 'text',
      name: 'Text',
      type: 'string',
      description: 'The text to classify',
      required: true,
      defaultValue: ''
    },
    {
      id: 'categories',
      name: 'Categories',
      type: 'array',
      description: 'The categories to classify into',
      required: true,
      defaultValue: ['positive', 'negative', 'neutral']
    },
    {
      id: 'temperature',
      name: 'Temperature',
      type: 'number',
      description: 'The temperature for classification (0.0-1.0)',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'llm', 'classificationTemperature'], 0.3)
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
      id: 'category',
      name: 'Category',
      type: 'string',
      description: 'The classified category',
      required: false,
      defaultValue: ''
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the classification was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the classification failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { LLMAgentIntegration } = await import('../services/LLMAgentIntegration');
      
      const providerId = inputs.providerId;
      const text = inputs.text;
      const categories = inputs.categories || ['positive', 'negative', 'neutral'];
      const temperature = inputs.temperature || ConfigManager.getNested('nodes', ['defaults', 'llm', 'classificationTemperature'], 0.3);
      
      if (!providerId) {
        return {
          flow: true,
          category: '',
          success: false,
          error: 'No provider ID provided'
        };
      }
      
      if (!text) {
        return {
          flow: true,
          category: '',
          success: false,
          error: 'No text provided'
        };
      }
      
      if (!Array.isArray(categories) || categories.length === 0) {
        return {
          flow: true,
          category: '',
          success: false,
          error: 'No categories provided'
        };
      }
      
      const categoriesStr = categories.join(', ');
      const prompt = `Classify the following text into one of these categories: ${categoriesStr}.\n\nText: "${text}"\n\nCategory:`;
      const systemPrompt = ConfigManager.getNested('nodes', ['defaults', 'llm', 'classificationSystemPrompt'], 'You are a helpful classification assistant. Respond with only the category name.');
      
      const result = await LLMAgentIntegration.sendRequest(providerId, {
        prompt,
        systemPrompt,
        maxTokens: 50,
        temperature
      });
      
      if (!result.success) {
        return {
          flow: true,
          category: '',
          success: false,
          error: result.error || 'Classification failed'
        };
      }
      
      // Extract the category from the response
      const category = result.text ? result.text.trim() : '';
      
      return {
        flow: true,
        category,
        success: true,
        error: ''
      };
    } catch (error) {
      return {
        flow: true,
        category: '',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * LLM Summarization Node - Summarize text using an LLM
 */
export const LLMSummarizationNode: LLMNodeDefinition = {
  id: 'llm-summarization',
  type: 'llm',
  category: 'LLM',
  name: 'Summarization',
  description: 'Summarize text using an LLM provider',
  
  inputs: [
    {
      id: 'providerId',
      name: 'Provider ID',
      type: 'string',
      description: 'The ID of the LLM provider',
      required: true,
      defaultValue: ''
    },
    {
      id: 'text',
      name: 'Text',
      type: 'string',
      description: 'The text to summarize',
      required: true,
      defaultValue: ''
    },
    {
      id: 'maxLength',
      name: 'Max Length',
      type: 'number',
      description: 'The maximum length of the summary in words',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'llm', 'summaryMaxLength'], 100)
    },
    {
      id: 'temperature',
      name: 'Temperature',
      type: 'number',
      description: 'The temperature for summarization (0.0-1.0)',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'llm', 'summaryTemperature'], 0.5)
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
      id: 'summary',
      name: 'Summary',
      type: 'string',
      description: 'The summarized text',
      required: false,
      defaultValue: ''
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the summarization was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the summarization failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { LLMAgentIntegration } = await import('../services/LLMAgentIntegration');
      
      const providerId = inputs.providerId;
      const text = inputs.text;
      const maxLength = inputs.maxLength || ConfigManager.getNested('nodes', ['defaults', 'llm', 'summaryMaxLength'], 100);
      const temperature = inputs.temperature || ConfigManager.getNested('nodes', ['defaults', 'llm', 'summaryTemperature'], 0.5);
      
      if (!providerId) {
        return {
          flow: true,
          summary: '',
          success: false,
          error: 'No provider ID provided'
        };
      }
      
      if (!text) {
        return {
          flow: true,
          summary: '',
          success: false,
          error: 'No text provided'
        };
      }
      
      const prompt = `Summarize the following text in ${maxLength} words or less:\n\n${text}\n\nSummary:`;
      const systemPrompt = ConfigManager.getNested('nodes', ['defaults', 'llm', 'summarySystemPrompt'], 'You are a helpful summarization assistant. Create concise, accurate summaries.');
      
      const result = await LLMAgentIntegration.sendRequest(providerId, {
        prompt,
        systemPrompt,
        maxTokens: maxLength * 2,
        temperature
      });
      
      return {
        flow: true,
        summary: result.text || '',
        success: result.success,
        error: result.error || ''
      };
    } catch (error) {
      return {
        flow: true,
        summary: '',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

// Export all LLM nodes
export const LLMNodes = [
  LLMTextGenerationNode,
  LLMClassificationNode,
  LLMSummarizationNode
];
