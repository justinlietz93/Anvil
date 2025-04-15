import { NodeDefinition } from '../services/BlueprintRegistry';
import { ConfigManager } from '../services/ConfigManager';

/**
 * Interface for plugin node definitions
 */
export interface PluginNodeDefinition {
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
 * Plugin Load Node - Load a plugin
 */
export const PluginLoadNode: PluginNodeDefinition = {
  id: 'plugin-load',
  type: 'plugin',
  category: 'Plugins',
  name: 'Load Plugin',
  description: 'Load a plugin from a file or URL',
  
  inputs: [
    {
      id: 'path',
      name: 'Path',
      type: 'string',
      description: 'The path or URL to the plugin',
      required: true,
      defaultValue: ''
    },
    {
      id: 'autoEnable',
      name: 'Auto Enable',
      type: 'boolean',
      description: 'Whether to automatically enable the plugin after loading',
      required: false,
      defaultValue: true
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
      id: 'pluginId',
      name: 'Plugin ID',
      type: 'string',
      description: 'The ID of the loaded plugin',
      required: false,
      defaultValue: ''
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the plugin was loaded successfully',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the plugin failed to load',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { PluginManager } = await import('../services/PluginManager');
      
      const path = inputs.path;
      const autoEnable = inputs.autoEnable !== false;
      
      if (!path) {
        return {
          flow: true,
          pluginId: '',
          success: false,
          error: 'No plugin path provided'
        };
      }
      
      // This would be implemented to load the plugin from the path
      // For now, we'll just return a mock result
      const mockPluginId = 'plugin-' + Math.random().toString(36).substring(2, 9);
      
      // Mock plugin registration
      PluginManager.registerPlugin({
        name: 'Mock Plugin',
        version: '1.0.0',
        description: 'A mock plugin loaded from ' + path,
        author: 'Anvil System'
      }, {
        // Mock plugin exports
        someFunction: () => {}
      });
      
      return {
        flow: true,
        pluginId: mockPluginId,
        success: true,
        error: ''
      };
    } catch (error) {
      return {
        flow: true,
        pluginId: '',
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * Plugin Enable Node - Enable a plugin
 */
export const PluginEnableNode: PluginNodeDefinition = {
  id: 'plugin-enable',
  type: 'plugin',
  category: 'Plugins',
  name: 'Enable Plugin',
  description: 'Enable a loaded plugin',
  
  inputs: [
    {
      id: 'pluginId',
      name: 'Plugin ID',
      type: 'string',
      description: 'The ID of the plugin to enable',
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
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the plugin was enabled successfully',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the plugin failed to enable',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { PluginManager } = await import('../services/PluginManager');
      
      const pluginId = inputs.pluginId;
      
      if (!pluginId) {
        return {
          flow: true,
          success: false,
          error: 'No plugin ID provided'
        };
      }
      
      const success = PluginManager.enablePlugin(pluginId);
      
      return {
        flow: true,
        success,
        error: success ? '' : 'Failed to enable plugin'
      };
    } catch (error) {
      return {
        flow: true,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * Plugin Disable Node - Disable a plugin
 */
export const PluginDisableNode: PluginNodeDefinition = {
  id: 'plugin-disable',
  type: 'plugin',
  category: 'Plugins',
  name: 'Disable Plugin',
  description: 'Disable a loaded plugin',
  
  inputs: [
    {
      id: 'pluginId',
      name: 'Plugin ID',
      type: 'string',
      description: 'The ID of the plugin to disable',
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
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the plugin was disabled successfully',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the plugin failed to disable',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { PluginManager } = await import('../services/PluginManager');
      
      const pluginId = inputs.pluginId;
      
      if (!pluginId) {
        return {
          flow: true,
          success: false,
          error: 'No plugin ID provided'
        };
      }
      
      const success = PluginManager.disablePlugin(pluginId);
      
      return {
        flow: true,
        success,
        error: success ? '' : 'Failed to disable plugin'
      };
    } catch (error) {
      return {
        flow: true,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

// Export all plugin nodes
export const PluginNodes = [
  PluginLoadNode,
  PluginEnableNode,
  PluginDisableNode
];
