import { v4 as uuidv4 } from 'uuid';
import { ComponentInstance } from '../contexts/ProjectContext';
import React from 'react';
import {
  DefaultButton,
  PrimaryButton,
  TextField,
  Label,
  Checkbox,
  Dropdown,
  IDropdownOption,
  Image
} from '@fluentui/react';

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
  private initialized: boolean = false;
  
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
    this.ensureInitialized();
    return this.components.get(id);
  }
  
  /**
   * Get all registered components
   * 
   * @returns Array of all component definitions
   */
  getAllComponents(): ComponentDefinition[] {
    this.ensureInitialized();
    return Array.from(this.components.values());
  }
  
  /**
   * Get components by category
   * 
   * @param category - The category to filter by
   * @returns Array of component definitions in the specified category
   */
  getComponentsByCategory(category: string): ComponentDefinition[] {
    this.ensureInitialized();
    return this.getAllComponents().filter(comp => comp.category === category);
  }
  
  /**
   * Get all component categories
   * 
   * @returns Array of unique category names
   */
  getAllCategories(): string[] {
    this.ensureInitialized();
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
    this.ensureInitialized();
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

  /**
   * Ensure that default components are initialized
   * @private
   */
  private ensureInitialized(): void {
    if (this.initialized) return;
    
    this.initializeDefaultComponents();
    this.initialized = true;
  }

  /**
   * Initialize default components
   * @private
   */
  private initializeDefaultComponents(): void {
    // Button component
    this.registerComponent({
      id: 'button',
      name: 'Button',
      category: 'Basic',
      icon: 'ButtonControl',
      description: 'A standard button component',
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
      renderComponent: (props: any) => {
        const { text, primary, disabled } = props;
        if (primary) {
          return <PrimaryButton text={text} disabled={disabled} />;
        }
        return <DefaultButton text={text} disabled={disabled} />;
      }
    });

    // Text Input component
    this.registerComponent({
      id: 'textinput',
      name: 'Text Input',
      category: 'Basic',
      icon: 'TextField',
      description: 'A text input field',
      defaultProps: {
        label: 'Label',
        placeholder: 'Enter text here',
        multiline: false,
        disabled: false
      },
      propTypes: {
        label: {
          type: 'string',
          required: false,
          defaultValue: 'Label',
          description: 'The label for the text field'
        },
        placeholder: {
          type: 'string',
          required: false,
          defaultValue: 'Enter text here',
          description: 'Placeholder text'
        },
        multiline: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the text field allows multiple lines'
        },
        disabled: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the text field is disabled'
        }
      },
      renderComponent: (props: any) => {
        const { label, placeholder, multiline, disabled } = props;
        return <TextField 
          label={label} 
          placeholder={placeholder} 
          multiline={multiline} 
          disabled={disabled} 
        />;
      }
    });

    // Label component
    this.registerComponent({
      id: 'label',
      name: 'Label',
      category: 'Basic',
      icon: 'Font',
      description: 'A simple text label',
      defaultProps: {
        text: 'Label Text',
        required: false
      },
      propTypes: {
        text: {
          type: 'string',
          required: true,
          defaultValue: 'Label Text',
          description: 'The text to display in the label'
        },
        required: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the label indicates a required field'
        }
      },
      renderComponent: (props: any) => {
        const { text, required } = props;
        return <Label required={required}>{text}</Label>;
      }
    });

    // Checkbox component
    this.registerComponent({
      id: 'checkbox',
      name: 'Checkbox',
      category: 'Basic',
      icon: 'CheckboxComposite',
      description: 'A checkbox control',
      defaultProps: {
        label: 'Checkbox',
        checked: false,
        disabled: false
      },
      propTypes: {
        label: {
          type: 'string',
          required: true,
          defaultValue: 'Checkbox',
          description: 'The label for the checkbox'
        },
        checked: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the checkbox is checked'
        },
        disabled: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the checkbox is disabled'
        }
      },
      renderComponent: (props: any) => {
        const { label, checked, disabled } = props;
        return <Checkbox 
          label={label} 
          checked={checked} 
          disabled={disabled} 
        />;
      }
    });

    // Dropdown component
    this.registerComponent({
      id: 'dropdown',
      name: 'Dropdown',
      category: 'Basic',
      icon: 'DropdownList',
      description: 'A dropdown selection control',
      defaultProps: {
        label: 'Dropdown',
        placeholder: 'Select an option',
        options: '[{"key": "option1", "text": "Option 1"}, {"key": "option2", "text": "Option 2"}]',
        disabled: false
      },
      propTypes: {
        label: {
          type: 'string',
          required: false,
          defaultValue: 'Dropdown',
          description: 'The label for the dropdown'
        },
        placeholder: {
          type: 'string',
          required: false,
          defaultValue: 'Select an option',
          description: 'Placeholder text'
        },
        options: {
          type: 'string',
          required: true,
          defaultValue: '[{"key": "option1", "text": "Option 1"}, {"key": "option2", "text": "Option 2"}]',
          description: 'JSON string of dropdown options with key and text properties'
        },
        disabled: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: 'Whether the dropdown is disabled'
        }
      },
      renderComponent: (props: any) => {
        const { label, placeholder, options, disabled } = props;
        let optionsArray: IDropdownOption[] = [];
        
        try {
          if (typeof options === 'string') {
            optionsArray = JSON.parse(options);
          } else if (Array.isArray(options)) {
            optionsArray = options;
          }
        } catch (e) {
          optionsArray = [
            { key: 'option1', text: 'Option 1' },
            { key: 'option2', text: 'Option 2' }
          ];
        }
        
        return <Dropdown 
          label={label} 
          placeholder={placeholder} 
          options={optionsArray} 
          disabled={disabled} 
        />;
      }
    });

    // Image component
    this.registerComponent({
      id: 'image',
      name: 'Image',
      category: 'Media',
      icon: 'PictureCenter',
      description: 'An image component',
      defaultProps: {
        src: 'https://via.placeholder.com/150',
        alt: 'Image',
        width: 150,
        height: 150
      },
      propTypes: {
        src: {
          type: 'string',
          required: true,
          defaultValue: 'https://via.placeholder.com/150',
          description: 'The source URL of the image'
        },
        alt: {
          type: 'string',
          required: true,
          defaultValue: 'Image',
          description: 'Alt text for the image'
        },
        width: {
          type: 'number',
          required: false,
          defaultValue: 150,
          description: 'Width of the image in pixels'
        },
        height: {
          type: 'number',
          required: false,
          defaultValue: 150,
          description: 'Height of the image in pixels'
        }
      },
      renderComponent: (props: any) => {
        const { src, alt, width, height } = props;
        return <Image 
          src={src} 
          alt={alt} 
          width={width} 
          height={height} 
        />;
      }
    });

    // Container component
    this.registerComponent({
      id: 'container',
      name: 'Container',
      category: 'Layout',
      icon: 'GroupObject',
      description: 'A container for other components',
      defaultProps: {
        title: 'Container',
        showTitle: true
      },
      propTypes: {
        title: {
          type: 'string',
          required: false,
          defaultValue: 'Container',
          description: 'Title of the container'
        },
        showTitle: {
          type: 'boolean',
          required: false,
          defaultValue: true,
          description: 'Whether to show the title'
        }
      },
      renderComponent: (props: any) => {
        const { title, showTitle } = props;
        return (
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            {showTitle && <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>{title}</div>}
            <div>Container Content</div>
          </div>
        );
      }
    });
  }
}

// Export singleton instance
export const ComponentRegistry = new ComponentRegistryClass();
