import { PluginManager, PluginMetadata, Plugin } from '../PluginManager';
import { ConfigManager } from '../ConfigManager';

// Mock the ConfigManager
jest.mock('../ConfigManager', () => ({
  ConfigManager: {
    initialize: jest.fn()
  }
}));

describe('PluginManager', () => {
  beforeEach(() => {
    // Reset the PluginManager before each test
    jest.clearAllMocks();
    // Clear all plugins and hooks
    (PluginManager as any).plugins = new Map();
    (PluginManager as any).hooks = new Map();
  });

  test('should initialize and load configurations', () => {
    PluginManager.initialize();
    expect(ConfigManager.initialize).toHaveBeenCalled();
  });

  test('should register a plugin', () => {
    const mockExports = {
      onRegister: jest.fn()
    };

    const pluginId = PluginManager.registerPlugin({
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test Author'
    }, mockExports);

    expect(pluginId).toBeDefined();
    expect(typeof pluginId).toBe('string');
    
    const plugin = PluginManager.getPlugin(pluginId);
    expect(plugin).toBeDefined();
    expect(plugin?.metadata.name).toBe('Test Plugin');
    expect(plugin?.metadata.version).toBe('1.0.0');
    expect(plugin?.metadata.description).toBe('A test plugin');
    expect(plugin?.metadata.author).toBe('Test Author');
    expect(plugin?.exports).toBe(mockExports);
    expect(plugin?.isEnabled).toBe(true);
    
    // Should call onRegister
    expect(mockExports.onRegister).toHaveBeenCalled();
  });

  test('should handle plugin registration with error in onRegister', () => {
    const mockExports = {
      onRegister: jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      })
    };
    
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();

    const pluginId = PluginManager.registerPlugin({
      name: 'Error Plugin',
      version: '1.0.0',
      description: 'A plugin that throws an error',
      author: 'Test Author'
    }, mockExports);

    // Should still register the plugin despite the error
    expect(pluginId).toBeDefined();
    expect(PluginManager.getPlugin(pluginId)).toBeDefined();
    
    // Should call onRegister and handle the error
    expect(mockExports.onRegister).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('should get all plugins', () => {
    const id1 = PluginManager.registerPlugin({
      name: 'Plugin 1',
      version: '1.0.0',
      description: 'First plugin',
      author: 'Author 1'
    }, {});

    const id2 = PluginManager.registerPlugin({
      name: 'Plugin 2',
      version: '2.0.0',
      description: 'Second plugin',
      author: 'Author 2'
    }, {});

    const plugins = PluginManager.getAllPlugins();
    expect(plugins.length).toBe(2);
    expect(plugins[0].metadata.name).toBe('Plugin 1');
    expect(plugins[1].metadata.name).toBe('Plugin 2');
  });

  test('should enable a plugin', () => {
    const mockExports = {
      onEnable: jest.fn()
    };

    const pluginId = PluginManager.registerPlugin({
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test Author'
    }, mockExports);

    // Disable the plugin first
    (PluginManager as any).plugins.get(pluginId).isEnabled = false;
    
    const enabled = PluginManager.enablePlugin(pluginId);
    expect(enabled).toBe(true);
    
    const plugin = PluginManager.getPlugin(pluginId);
    expect(plugin?.isEnabled).toBe(true);
    
    // Should call onEnable
    expect(mockExports.onEnable).toHaveBeenCalled();
  });

  test('should disable a plugin', () => {
    const mockExports = {
      onDisable: jest.fn()
    };

    const pluginId = PluginManager.registerPlugin({
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test Author'
    }, mockExports);
    
    const disabled = PluginManager.disablePlugin(pluginId);
    expect(disabled).toBe(true);
    
    const plugin = PluginManager.getPlugin(pluginId);
    expect(plugin?.isEnabled).toBe(false);
    
    // Should call onDisable
    expect(mockExports.onDisable).toHaveBeenCalled();
  });

  test('should unregister a plugin', () => {
    const mockExports = {
      onUnregister: jest.fn()
    };

    const pluginId = PluginManager.registerPlugin({
      name: 'Test Plugin',
      version: '1.0.0',
      description: 'A test plugin',
      author: 'Test Author'
    }, mockExports);

    expect(PluginManager.getPlugin(pluginId)).toBeDefined();
    
    const unregistered = PluginManager.unregisterPlugin(pluginId);
    expect(unregistered).toBe(true);
    expect(PluginManager.getPlugin(pluginId)).toBeUndefined();
    
    // Should call onUnregister
    expect(mockExports.onUnregister).toHaveBeenCalled();
  });

  test('should add and apply hooks', () => {
    const callback1 = jest.fn().mockReturnValue('result1');
    const callback2 = jest.fn().mockReturnValue('result2');
    
    PluginManager.addHook('test-hook', callback1);
    PluginManager.addHook('test-hook', callback2);
    
    const results = PluginManager.applyHook('test-hook', 'arg1', 'arg2');
    
    expect(results.length).toBe(2);
    expect(results[0]).toBe('result1');
    expect(results[1]).toBe('result2');
    
    expect(callback1).toHaveBeenCalledWith('arg1', 'arg2');
    expect(callback2).toHaveBeenCalledWith('arg1', 'arg2');
  });

  test('should handle errors in hook callbacks', () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    const callback1 = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    const callback2 = jest.fn().mockReturnValue('result2');
    
    PluginManager.addHook('test-hook', callback1);
    PluginManager.addHook('test-hook', callback2);
    
    const results = PluginManager.applyHook('test-hook');
    
    // Should still return results from successful callbacks
    expect(results.length).toBe(1);
    expect(results[0]).toBe('result2');
    
    // Should call both callbacks and handle the error
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });

  test('should apply filters', () => {
    const filter1 = jest.fn().mockImplementation((value) => value + '1');
    const filter2 = jest.fn().mockImplementation((value) => value + '2');
    
    PluginManager.addHook('test-filter', filter1);
    PluginManager.addHook('test-filter', filter2);
    
    const result = PluginManager.applyFilter('test-filter', 'value', 'arg1');
    
    expect(result).toBe('value12');
    
    expect(filter1).toHaveBeenCalledWith('value', 'arg1');
    expect(filter2).toHaveBeenCalledWith('value1', 'arg1');
  });

  test('should remove hooks', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    
    PluginManager.addHook('test-hook', callback1);
    PluginManager.addHook('test-hook', callback2);
    
    const removed = PluginManager.removeHook('test-hook', callback1);
    expect(removed).toBe(true);
    
    PluginManager.applyHook('test-hook');
    
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  test('should create a plugin sandbox', () => {
    const mockPlugin: Plugin = {
      metadata: {
        id: 'test-id',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author'
      },
      exports: {
        testFunction: jest.fn()
      },
      isEnabled: true
    };
    
    const sandbox = PluginManager.createPluginSandbox(mockPlugin);
    
    // In the current implementation, this just returns the exports
    expect(sandbox).toBe(mockPlugin.exports);
    expect(sandbox.testFunction).toBe(mockPlugin.exports.testFunction);
  });
});
