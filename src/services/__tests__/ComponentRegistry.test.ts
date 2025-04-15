import { ComponentRegistry, ComponentDefinition, PropTypeDefinition } from '../ComponentRegistry';
import { v4 as uuidv4 } from 'uuid';

// Mock uuid to return predictable values
jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('ComponentRegistry', () => {
  let mockComponent: ComponentDefinition;
  
  beforeEach(() => {
    // Reset the mock and set a fixed return value for testing
    (uuidv4 as jest.Mock).mockReset();
    (uuidv4 as jest.Mock).mockReturnValue('test-uuid');
    
    // Clear the registry before each test
    // This is a bit of a hack since we're testing a singleton
    // In a real-world scenario, we might want to refactor to make this more testable
    ComponentRegistry['components'] = new Map();
    
    // Create a mock component for testing
    mockComponent = {
      id: 'test-button',
      name: 'Test Button',
      category: 'Basic Controls',
      icon: 'ButtonControl',
      description: 'A test button component',
      defaultProps: {
        text: 'Button',
        primary: false,
        disabled: false
      },
      propTypes: {
        text: {
          type: 'string',
          required: true,
          defaultValue: 'Button',
          description: 'The text to display on the button'
        },
        primary: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the button is a primary button'
        },
        disabled: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the button is disabled'
        }
      },
      renderComponent: jest.fn()
    };
  });
  
  describe('registerComponent', () => {
    it('should register a component in the registry', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const retrievedComponent = ComponentRegistry.getComponent('test-button');
      expect(retrievedComponent).toEqual(mockComponent);
    });
    
    it('should override an existing component with the same ID', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const updatedComponent = {
        ...mockComponent,
        name: 'Updated Button'
      };
      
      ComponentRegistry.registerComponent(updatedComponent);
      
      const retrievedComponent = ComponentRegistry.getComponent('test-button');
      expect(retrievedComponent).toEqual(updatedComponent);
    });
  });
  
  describe('getComponent', () => {
    it('should return the component with the specified ID', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const retrievedComponent = ComponentRegistry.getComponent('test-button');
      expect(retrievedComponent).toEqual(mockComponent);
    });
    
    it('should return undefined if the component does not exist', () => {
      const retrievedComponent = ComponentRegistry.getComponent('non-existent');
      expect(retrievedComponent).toBeUndefined();
    });
  });
  
  describe('getAllComponents', () => {
    it('should return all registered components', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const anotherComponent = {
        ...mockComponent,
        id: 'test-textfield',
        name: 'Test TextField'
      };
      
      ComponentRegistry.registerComponent(anotherComponent);
      
      const allComponents = ComponentRegistry.getAllComponents();
      expect(allComponents).toHaveLength(2);
      expect(allComponents).toContainEqual(mockComponent);
      expect(allComponents).toContainEqual(anotherComponent);
    });
    
    it('should return an empty array if no components are registered', () => {
      const allComponents = ComponentRegistry.getAllComponents();
      expect(allComponents).toHaveLength(0);
    });
  });
  
  describe('getComponentsByCategory', () => {
    it('should return components in the specified category', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const anotherCategory = {
        ...mockComponent,
        id: 'test-label',
        name: 'Test Label',
        category: 'Text Controls'
      };
      
      ComponentRegistry.registerComponent(anotherCategory);
      
      const basicControls = ComponentRegistry.getComponentsByCategory('Basic Controls');
      expect(basicControls).toHaveLength(1);
      expect(basicControls[0]).toEqual(mockComponent);
      
      const textControls = ComponentRegistry.getComponentsByCategory('Text Controls');
      expect(textControls).toHaveLength(1);
      expect(textControls[0]).toEqual(anotherCategory);
    });
    
    it('should return an empty array if no components are in the category', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const nonExistentCategory = ComponentRegistry.getComponentsByCategory('Non-Existent');
      expect(nonExistentCategory).toHaveLength(0);
    });
  });
  
  describe('getAllCategories', () => {
    it('should return all unique categories', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const anotherCategory = {
        ...mockComponent,
        id: 'test-label',
        name: 'Test Label',
        category: 'Text Controls'
      };
      
      const sameCategory = {
        ...mockComponent,
        id: 'test-checkbox',
        name: 'Test Checkbox'
      };
      
      ComponentRegistry.registerComponent(anotherCategory);
      ComponentRegistry.registerComponent(sameCategory);
      
      const categories = ComponentRegistry.getAllCategories();
      expect(categories).toHaveLength(2);
      expect(categories).toContain('Basic Controls');
      expect(categories).toContain('Text Controls');
    });
    
    it('should return an empty array if no components are registered', () => {
      const categories = ComponentRegistry.getAllCategories();
      expect(categories).toHaveLength(0);
    });
  });
  
  describe('createComponentInstance', () => {
    it('should create a component instance from a registered component', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const instance = ComponentRegistry.createComponentInstance('test-button');
      
      expect(instance).toEqual({
        id: 'test-uuid',
        type: 'test-button',
        name: 'Test Button',
        props: mockComponent.defaultProps,
        children: [],
        styles: {},
        events: {}
      });
    });
    
    it('should use the provided name if specified', () => {
      ComponentRegistry.registerComponent(mockComponent);
      
      const instance = ComponentRegistry.createComponentInstance('test-button', 'Custom Name');
      
      expect(instance?.name).toBe('Custom Name');
    });
    
    it('should return null if the component does not exist', () => {
      const instance = ComponentRegistry.createComponentInstance('non-existent');
      expect(instance).toBeNull();
    });
  });
});
