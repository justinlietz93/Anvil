import { ConfigManager } from '../../services/ConfigManager';
import * as keytar from 'keytar';
import ElectronStore from 'electron-store';

// Mock electron-store
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => {
    const store = {};
    return {
      get: jest.fn((key, defaultValue) => store[key] || defaultValue),
      set: jest.fn((key, value) => { store[key] = value; }),
      has: jest.fn(key => !!store[key]),
      delete: jest.fn(key => { delete store[key]; }),
      clear: jest.fn(() => { Object.keys(store).forEach(key => delete store[key]); })
    };
  });
});

// Mock keytar
jest.mock('keytar', () => ({
  getPassword: jest.fn(),
  setPassword: jest.fn(),
  deletePassword: jest.fn()
}));

describe('ConfigManager', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset ConfigManager's internal state
    ConfigManager.initialize();
  });
  
  describe('initialize', () => {
    test('creates a new ElectronStore instance', () => {
      ConfigManager.initialize();
      expect(ElectronStore).toHaveBeenCalled();
    });
    
    test('can be called multiple times without error', () => {
      expect(() => {
        ConfigManager.initialize();
        ConfigManager.initialize();
      }).not.toThrow();
    });
  });
  
  describe('get', () => {
    test('retrieves a value from the store', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({ key1: 'value1' });
      
      // Call get
      const result = await ConfigManager.get('section1', 'key1', 'default');
      
      // Check if store.get was called with the correct arguments
      expect(mockStore.get).toHaveBeenCalledWith('section1', {});
      expect(result).toBe('value1');
    });
    
    test('returns default value if section does not exist', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce(undefined);
      
      // Call get
      const result = await ConfigManager.get('nonexistent', 'key1', 'default');
      
      // Check if store.get was called with the correct arguments
      expect(mockStore.get).toHaveBeenCalledWith('nonexistent', {});
      expect(result).toBe('default');
    });
    
    test('returns default value if key does not exist', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({ otherKey: 'otherValue' });
      
      // Call get
      const result = await ConfigManager.get('section1', 'nonexistent', 'default');
      
      // Check if store.get was called with the correct arguments
      expect(mockStore.get).toHaveBeenCalledWith('section1', {});
      expect(result).toBe('default');
    });
    
    test('supports nested keys with dot notation', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({ 
        parent: { 
          child: 'nestedValue' 
        } 
      });
      
      // Call get
      const result = await ConfigManager.get('section1', 'parent.child', 'default');
      
      // Check if store.get was called with the correct arguments
      expect(mockStore.get).toHaveBeenCalledWith('section1', {});
      expect(result).toBe('nestedValue');
    });
    
    test('returns default value if nested key does not exist', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({ 
        parent: {} 
      });
      
      // Call get
      const result = await ConfigManager.get('section1', 'parent.nonexistent', 'default');
      
      // Check if store.get was called with the correct arguments
      expect(mockStore.get).toHaveBeenCalledWith('section1', {});
      expect(result).toBe('default');
    });
  });
  
  describe('getSync', () => {
    test('retrieves a value from the store synchronously', () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({ key1: 'value1' });
      
      // Call getSync
      const result = ConfigManager.getSync('section1', 'key1', 'default');
      
      // Check if store.get was called with the correct arguments
      expect(mockStore.get).toHaveBeenCalledWith('section1', {});
      expect(result).toBe('value1');
    });
    
    test('returns default value if section does not exist', () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce(undefined);
      
      // Call getSync
      const result = ConfigManager.getSync('nonexistent', 'key1', 'default');
      
      // Check if store.get was called with the correct arguments
      expect(mockStore.get).toHaveBeenCalledWith('nonexistent', {});
      expect(result).toBe('default');
    });
  });
  
  describe('set', () => {
    test('sets a value in the store', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({});
      
      // Call set
      await ConfigManager.set('section1', 'key1', 'newValue');
      
      // Check if store.set was called with the correct arguments
      expect(mockStore.set).toHaveBeenCalledWith('section1', { key1: 'newValue' });
    });
    
    test('preserves existing values in the section', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({ existingKey: 'existingValue' });
      
      // Call set
      await ConfigManager.set('section1', 'key1', 'newValue');
      
      // Check if store.set was called with the correct arguments
      expect(mockStore.set).toHaveBeenCalledWith('section1', { 
        existingKey: 'existingValue',
        key1: 'newValue'
      });
    });
    
    test('supports nested keys with dot notation', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({});
      
      // Call set
      await ConfigManager.set('section1', 'parent.child', 'nestedValue');
      
      // Check if store.set was called with the correct arguments
      expect(mockStore.set).toHaveBeenCalledWith('section1', { 
        parent: { 
          child: 'nestedValue' 
        } 
      });
    });
    
    test('preserves existing nested values', async () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({ 
        parent: { 
          existingChild: 'existingValue' 
        } 
      });
      
      // Call set
      await ConfigManager.set('section1', 'parent.newChild', 'newValue');
      
      // Check if store.set was called with the correct arguments
      expect(mockStore.set).toHaveBeenCalledWith('section1', { 
        parent: { 
          existingChild: 'existingValue',
          newChild: 'newValue'
        } 
      });
    });
  });
  
  describe('setSync', () => {
    test('sets a value in the store synchronously', () => {
      // Setup mock implementation
      const mockStore = new ElectronStore();
      mockStore.get.mockReturnValueOnce({});
      
      // Call setSync
      ConfigManager.setSync('section1', 'key1', 'newValue');
      
      // Check if store.set was called with the correct arguments
      expect(mockStore.set).toHaveBeenCalledWith('section1', { key1: 'newValue' });
    });
  });
  
  describe('getSecure', () => {
    test('retrieves a value from keytar', async () => {
      // Setup mock implementation
      (keytar.getPassword as jest.Mock).mockResolvedValueOnce('secureValue');
      
      // Call getSecure
      const result = await ConfigManager.getSecure('section1', 'key1');
      
      // Check if keytar.getPassword was called with the correct arguments
      expect(keytar.getPassword).toHaveBeenCalledWith('anvil-app', 'section1.key1');
      expect(result).toBe('secureValue');
    });
    
    test('returns null if value does not exist', async () => {
      // Setup mock implementation
      (keytar.getPassword as jest.Mock).mockResolvedValueOnce(null);
      
      // Call getSecure
      const result = await ConfigManager.getSecure('section1', 'nonexistent');
      
      // Check if keytar.getPassword was called with the correct arguments
      expect(keytar.getPassword).toHaveBeenCalledWith('anvil-app', 'section1.nonexistent');
      expect(result).toBeNull();
    });
  });
  
  describe('setSecure', () => {
    test('sets a value in keytar', async () => {
      // Call setSecure
      await ConfigManager.setSecure('section1', 'key1', 'secureValue');
      
      // Check if keytar.setPassword was called with the correct arguments
      expect(keytar.setPassword).toHaveBeenCalledWith('anvil-app', 'section1.key1', 'secureValue');
    });
  });
  
  describe('deleteSecure', () => {
    test('deletes a value from keytar', async () => {
      // Setup mock implementation
      (keytar.deletePassword as jest.Mock).mockResolvedValueOnce(true);
      
      // Call deleteSecure
      const result = await ConfigManager.deleteSecure('section1', 'key1');
      
      // Check if keytar.deletePassword was called with the correct arguments
      expect(keytar.deletePassword).toHaveBeenCalledWith('anvil-app', 'section1.key1');
      expect(result).toBe(true);
    });
    
    test('returns false if value does not exist', async () => {
      // Setup mock implementation
      (keytar.deletePassword as jest.Mock).mockResolvedValueOnce(false);
      
      // Call deleteSecure
      const result = await ConfigManager.deleteSecure('section1', 'nonexistent');
      
      // Check if keytar.deletePassword was called with the correct arguments
      expect(keytar.deletePassword).toHaveBeenCalledWith('anvil-app', 'section1.nonexistent');
      expect(result).toBe(false);
    });
  });
});
