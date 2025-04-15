import { v4 as uuidv4 } from 'uuid';
import { ComponentInstance } from '../contexts/ProjectContext';

/**
 * Interface for component definition
 */
export interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  propTypes: Record<string, PropTypeDefinition>;
  renderComponent: (props: any) => React.ReactNode;
}

/**
 * Interface for property type definition
 */
export interface PropTypeDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum';
  required: boolean;
  defaultValue?: any;
  options?: any[]; // For enum type
  description: string;
}

/**
 * Component Registry class for managing available UI components
 */
class ComponentRegistryClass {
  private components: Map<string, ComponentDefinition> = new Map();
  
  /**
   * Register a component in the registry
   * 
   * @param component - The component definition to register
   */
  registerComponent(component: ComponentDefinition): void {
    this.components.set(component.id, component);
  }
  
  /**
   * Get a component by ID
   * 
   * @param id - The ID of the component to get
   * @returns The component definition or undefined if not found
   */
  getComponent(id: string): ComponentDefinition | undefined {
    return this.components.get(id);
  }
  
  /**
   * Get all registered components
   * 
   * @returns Array of all component definitions
   */
  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }
  
  /**
   * Get components by category
   * 
   * @param category - The category to filter by
   * @returns Array of component definitions in the specified category
   */
  getComponentsByCategory(category: string): ComponentDefinition[] {
    return this.getAllComponents().filter(comp => comp.category === category);
  }
  
  /**
   * Get all component categories
   * 
   * @returns Array of unique category names
   */
  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.getAllComponents().forEach(comp => categories.add(comp.category));
    return Array.from(categories);
  }
  
  /**
   * Create a component instance from a component definition
   * 
   * @param componentId - The ID of the component definition
   * @param name - Optional name for the component instance
   * @returns A new ComponentInstance object
   */
  createComponentInstance(componentId: string, name?: string): ComponentInstance | null {
    const componentDef = this.getComponent(componentId);
    if (!componentDef) return null;
    
    return {
      id: uuidv4(),
      type: componentId,
      name: name || componentDef.name,
      props: { ...componentDef.defaultProps },
      children: [],
      styles: {},
      events: {}
    };
  }
}

// Export singleton instance
export const ComponentRegistry = new ComponentRegistryClass();
