import { ConfigManager } from './ConfigManager';
import { v4 as uuidv4 } from 'uuid';

// Mock isolated-vm for development purposes
// This creates a dummy implementation when the actual module is not available
let ivm: any;

try {
  // Try to import the real module
  ivm = require('isolated-vm');
} catch (e) {
  // Create mock implementation if module is not available
  console.warn('isolated-vm module not available, using mock implementation');
  ivm = {
    Isolate: class MockIsolate {
      constructor() {}
      createContext() { return Promise.resolve(new MockContext()); }
      compileScript(code: string) { 
        return Promise.resolve({
          run: () => Promise.resolve(null)
        });
      }
      dispose() {}
    },
    Reference: class MockReference {
      constructor(value: any) { this.value = value; }
      apply() { return Promise.resolve(null); }
      get() { return Promise.resolve(new MockReference({})); }
      copy() { return Promise.resolve({}); }
    },
    ExternalCopy: class MockExternalCopy {
      constructor(value: any) {}
      copyInto() { return null; }
    }
  };
}

// Mock Context class for the mock implementation
class MockContext {
  global = {
    set: () => Promise.resolve(),
    get: () => Promise.resolve(new ivm.Reference({}))
  };
}

/**
 * Interface for plugin metadata
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license?: string;
  permissions?: string[];
}

/**
 * Interface for plugin
 */
export interface Plugin {
  metadata: PluginMetadata;
  exports: any;
  isEnabled: boolean;
  isolate?: ivm.Isolate;
  context?: ivm.Context;
}

/**
 * Interface for plugin permission
 */
export interface PluginPermission {
  name: string;
  description: string;
  dangerous: boolean;
}

/**
 * Plugin Manager service for managing plugins
 * 
 * @author Justin Lietz
 */
class PluginManagerClass {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, Function[]> = new Map();
  private availablePermissions: Map<string, PluginPermission> = new Map();
  private memoryLimitMB: number = 128;
  private timeoutMs: number = 1000;
  
  /**
   * Initialize the plugin manager
   */
  initialize(): void {
    // Load default configurations
    ConfigManager.initialize();
    
    // Register default permissions
    this.registerDefaultPermissions();
    
    // Load memory limit and timeout from config
    this.memoryLimitMB = ConfigManager.getSync('plugins', 'memoryLimitMB', 128);
    this.timeoutMs = ConfigManager.getSync('plugins', 'timeoutMs', 1000);
  }
  
  /**
   * Register default permissions
   */
  private registerDefaultPermissions(): void {
    this.registerPermission({
      name: 'ui.read',
      description: 'Read UI components and their properties',
      dangerous: false
    });
    
    this.registerPermission({
      name: 'ui.write',
      description: 'Modify UI components and their properties',
      dangerous: false
    });
    
    this.registerPermission({
      name: 'data.read',
      description: 'Read data from the application',
      dangerous: false
    });
    
    this.registerPermission({
      name: 'data.write',
      description: 'Write data to the application',
      dangerous: true
    });
    
    this.registerPermission({
      name: 'fs.read',
      description: 'Read files from the filesystem',
      dangerous: true
    });
    
    this.registerPermission({
      name: 'fs.write',
      description: 'Write files to the filesystem',
      dangerous: true
    });
    
    this.registerPermission({
      name: 'net.connect',
      description: 'Connect to network resources',
      dangerous: true
    });
  }
  
  /**
   * Register a permission
   * 
   * @param permission - The permission to register
   */
  registerPermission(permission: PluginPermission): void {
    this.availablePermissions.set(permission.name, permission);
  }
  
  /**
   * Get all available permissions
   * 
   * @returns Array of all available permissions
   */
  getAvailablePermissions(): PluginPermission[] {
    return Array.from(this.availablePermissions.values());
  }
  
  /**
   * Check if a plugin has a permission
   * 
   * @param plugin - The plugin to check
   * @param permissionName - The name of the permission to check
   * @returns True if the plugin has the permission, false otherwise
   */
  hasPermission(plugin: Plugin, permissionName: string): boolean {
    return plugin.metadata.permissions?.includes(permissionName) || false;
  }
  
  /**
   * Register a plugin
   * 
   * @param metadata - The plugin metadata
   * @param code - The plugin code as a string
   * @returns The ID of the registered plugin
   */
  async registerPlugin(metadata: Omit<PluginMetadata, 'id'>, code: string): Promise<string> {
    const id = uuidv4();
    
    try {
      // Create sandbox for the plugin
      const { isolate, context, exports } = await this.createPluginSandbox(code, {
        id,
        ...metadata
      });
      
      const plugin: Plugin = {
        metadata: {
          id,
          ...metadata
        },
        exports,
        isEnabled: true,
        isolate,
        context
      };
      
      this.plugins.set(id, plugin);
      
      // Call onRegister if it exists
      if (exports.onRegister) {
        try {
          await this.callPluginMethod(plugin, 'onRegister', []);
        } catch (error) {
          console.error(`Error calling onRegister for plugin ${metadata.name}:`, error);
        }
      }
      
      return id;
    } catch (error) {
      console.error(`Error registering plugin ${metadata.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a plugin by ID
   * 
   * @param pluginId - The ID of the plugin to get
   * @returns The plugin or undefined if not found
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }
  
  /**
   * Get all plugins
   * 
   * @returns Array of all plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Enable a plugin
   * 
   * @param pluginId - The ID of the plugin to enable
   * @returns True if the plugin was enabled, false otherwise
   */
  async enablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      return false;
    }
    
    plugin.isEnabled = true;
    
    // Call onEnable if it exists
    if (plugin.exports.onEnable) {
      try {
        await this.callPluginMethod(plugin, 'onEnable', []);
      } catch (error) {
        console.error(`Error calling onEnable for plugin ${plugin.metadata.name}:`, error);
      }
    }
    
    return true;
  }
  
  /**
   * Disable a plugin
   * 
   * @param pluginId - The ID of the plugin to disable
   * @returns True if the plugin was disabled, false otherwise
   */
  async disablePlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      return false;
    }
    
    plugin.isEnabled = false;
    
    // Call onDisable if it exists
    if (plugin.exports.onDisable) {
      try {
        await this.callPluginMethod(plugin, 'onDisable', []);
      } catch (error) {
        console.error(`Error calling onDisable for plugin ${plugin.metadata.name}:`, error);
      }
    }
    
    return true;
  }
  
  /**
   * Unregister a plugin
   * 
   * @param pluginId - The ID of the plugin to unregister
   * @returns True if the plugin was unregistered, false otherwise
   */
  async unregisterPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    
    if (!plugin) {
      return false;
    }
    
    // Call onUnregister if it exists
    if (plugin.exports.onUnregister) {
      try {
        await this.callPluginMethod(plugin, 'onUnregister', []);
      } catch (error) {
        console.error(`Error calling onUnregister for plugin ${plugin.metadata.name}:`, error);
      }
    }
    
    // Dispose of the isolate
    if (plugin.isolate) {
      plugin.isolate.dispose();
    }
    
    return this.plugins.delete(pluginId);
  }
  
  /**
   * Add a hook callback
   * 
   * @param hookName - The name of the hook
   * @param callback - The callback function
   */
  addHook(hookName: string, callback: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }
    
    this.hooks.get(hookName)!.push(callback);
  }
  
  /**
   * Remove a hook callback
   * 
   * @param hookName - The name of the hook
   * @param callback - The callback function to remove
   * @returns True if the callback was removed, false otherwise
   */
  removeHook(hookName: string, callback: Function): boolean {
    if (!this.hooks.has(hookName)) {
      return false;
    }
    
    const callbacks = this.hooks.get(hookName)!;
    const index = callbacks.indexOf(callback);
    
    if (index === -1) {
      return false;
    }
    
    callbacks.splice(index, 1);
    
    if (callbacks.length === 0) {
      this.hooks.delete(hookName);
    }
    
    return true;
  }
  
  /**
   * Apply a hook
   * 
   * @param hookName - The name of the hook
   * @param args - The arguments to pass to the hook callbacks
   * @returns Array of results from the hook callbacks
   */
  async applyHook(hookName: string, ...args: any[]): Promise<any[]> {
    if (!this.hooks.has(hookName)) {
      return [];
    }
    
    const results: any[] = [];
    
    for (const callback of this.hooks.get(hookName)!) {
      try {
        results.push(await callback(...args));
      } catch (error) {
        console.error(`Error applying hook ${hookName}:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Apply a filter hook
   * 
   * @param hookName - The name of the filter hook
   * @param value - The value to filter
   * @param args - Additional arguments to pass to the filter callbacks
   * @returns The filtered value
   */
  async applyFilter(hookName: string, value: any, ...args: any[]): Promise<any> {
    if (!this.hooks.has(hookName)) {
      return value;
    }
    
    let filteredValue = value;
    
    for (const callback of this.hooks.get(hookName)!) {
      try {
        filteredValue = await callback(filteredValue, ...args);
      } catch (error) {
        console.error(`Error applying filter ${hookName}:`, error);
      }
    }
    
    return filteredValue;
  }
  
  /**
   * Create a sandbox for a plugin
   * 
   * @param code - The plugin code as a string
   * @param metadata - The plugin metadata
   * @returns The sandboxed plugin exports
   */
  private async createPluginSandbox(code: string, metadata: PluginMetadata): Promise<{
    isolate: ivm.Isolate,
    context: ivm.Context,
    exports: any
  }> {
    // Create a new isolate with memory limits
    const isolate = new ivm.Isolate({ memoryLimit: this.memoryLimitMB });
    
    // Create a new context within the isolate
    const context = await isolate.createContext();
    
    // Create a global object in the context
    const jail = context.global;
    
    // Add console methods to the context
    await jail.set('console', {
      log: new ivm.Reference((...args: any[]) => {
        console.log(`[Plugin ${metadata.name}]`, ...args);
      }),
      error: new ivm.Reference((...args: any[]) => {
        console.error(`[Plugin ${metadata.name}]`, ...args);
      }),
      warn: new ivm.Reference((...args: any[]) => {
        console.warn(`[Plugin ${metadata.name}]`, ...args);
      }),
      info: new ivm.Reference((...args: any[]) => {
        console.info(`[Plugin ${metadata.name}]`, ...args);
      })
    }, { reference: true });
    
    // Add setTimeout and clearTimeout to the context
    const timeouts = new Map<number, NodeJS.Timeout>();
    let nextTimeoutId = 1;
    
    await jail.set('setTimeout', new ivm.Reference((callback: ivm.Reference<Function>, delay: number) => {
      const timeoutId = nextTimeoutId++;
      
      const timeout = setTimeout(() => {
        try {
          callback.apply(undefined, []).catch((err: any) => {
            console.error(`[Plugin ${metadata.name}] Error in setTimeout callback:`, err);
          });
        } catch (err) {
          console.error(`[Plugin ${metadata.name}] Error executing setTimeout:`, err);
        } finally {
          timeouts.delete(timeoutId);
        }
      }, delay);
      
      timeouts.set(timeoutId, timeout);
      return timeoutId;
    }), { reference: true });
    
    await jail.set('clearTimeout', new ivm.Reference((timeoutId: number) => {
      const timeout = timeouts.get(timeoutId);
      if (timeout) {
        clearTimeout(timeout);
        timeouts.delete(timeoutId);
      }
    }), { reference: true });
    
    // Add plugin metadata to the context
    await jail.set('metadata', metadata, { copy: true });
    
    // Add permission checking to the context
    await jail.set('hasPermission', new ivm.Reference((permissionName: string) => {
      return this.hasPermission({
        metadata,
        exports: {},
        isEnabled: true
      }, permissionName);
    }), { reference: true });
    
    // Create a safe require function that only allows certain modules
    const safeRequire = new ivm.Reference((moduleName: string) => {
      // Only allow certain modules to be required
      const allowedModules: Record<string, any> = {
        'lodash': require('lodash')
      };
      
      if (moduleName in allowedModules) {
        return allowedModules[moduleName];
      }
      
      throw new Error(`Module "${moduleName}" is not allowed to be required`);
    });
    
    await jail.set('require', safeRequire, { reference: true });
    
    // Compile and run the plugin code
    const script = await isolate.compileScript(code);
    await script.run(context, { timeout: this.timeoutMs });
    
    // Get the exports from the context
    const exportsRef = await context.global.get('exports', { reference: true });
    const exports = await exportsRef.copy();
    
    return { isolate, context, exports };
  }
  
  /**
   * Call a method on a plugin
   * 
   * @param plugin - The plugin to call the method on
   * @param methodName - The name of the method to call
   * @param args - The arguments to pass to the method
   * @returns The result of the method call
   */
  private async callPluginMethod(plugin: Plugin, methodName: string, args: any[]): Promise<any> {
    if (!plugin.context || !plugin.isolate) {
      throw new Error(`Plugin ${plugin.metadata.name} does not have a context or isolate`);
    }
    
    // Get the method from the context
    const exportsRef = await plugin.context.global.get('exports', { reference: true });
    const methodRef = await exportsRef.get(methodName, { reference: true });
    
    // Convert arguments to transferable values
    const transferableArgs = args.map(arg => new ivm.ExternalCopy(arg).copyInto());
    
    // Call the method with a timeout
    return methodRef.apply(undefined, transferableArgs, { timeout: this.timeoutMs });
  }
  
  /**
   * Load a plugin from a file
   * 
   * @param filePath - The path to the plugin file
   * @returns The ID of the registered plugin
   */
  async loadPluginFromFile(filePath: string): Promise<string> {
    try {
      // This would be implemented to load a plugin from a file
      // For now, we'll just throw an error
      throw new Error('Not implemented');
    } catch (error) {
      console.error(`Error loading plugin from file ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Save plugin configuration
   * 
   * @param pluginId - The ID of the plugin
   * @param config - The configuration to save
   */
  async savePluginConfig(pluginId: string, config: any): Promise<void> {
    try {
      await ConfigManager.set('plugins', `configs.${pluginId}`, config);
    } catch (error) {
      console.error(`Error saving plugin config for ${pluginId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get plugin configuration
   * 
   * @param pluginId - The ID of the plugin
   * @returns The plugin configuration
   */
  async getPluginConfig(pluginId: string): Promise<any> {
    try {
      return await ConfigManager.get('plugins', `configs.${pluginId}`, {});
    } catch (error) {
      console.error(`Error getting plugin config for ${pluginId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const PluginManager = new PluginManagerClass();
