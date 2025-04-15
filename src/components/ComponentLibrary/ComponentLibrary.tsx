import React from 'react';
import { 
  Stack, 
  IStackStyles, 
  IStackTokens,
  Text,
  SearchBox
} from '@fluentui/react';
import { ComponentDefinition, ComponentRegistry } from '../../services/ComponentRegistry';
import { ComponentCard } from './ComponentCard';

// Styles
const stackStyles: IStackStyles = {
  root: {
    padding: 10,
    height: '100%',
    overflowY: 'auto'
  },
};

const headerStyles: IStackStyles = {
  root: {
    padding: '10px 0',
  },
};

const componentsContainerStyles: IStackStyles = {
  root: {
    marginTop: 10,
  },
};

// Tokens
const stackTokens: IStackTokens = {
  childrenGap: 10,
};

/**
 * Component Library component for displaying available UI components
 * 
 * @author Justin Lietz
 */
export const ComponentLibrary: React.FC = () => {
  // State
  const [searchText, setSearchText] = React.useState('');
  const [components, setComponents] = React.useState<ComponentDefinition[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  // Load components on mount
  React.useEffect(() => {
    const allComponents = ComponentRegistry.getAllComponents();
    setComponents(allComponents);
    setCategories(ComponentRegistry.getAllCategories());
  }, []);

  // Filter components by search text
  const filteredComponents = React.useMemo(() => {
    if (!searchText) return components;
    return components.filter(comp => 
      comp.name.toLowerCase().includes(searchText.toLowerCase()) || 
      comp.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [components, searchText]);

  // Group components by category
  const componentsByCategory = React.useMemo(() => {
    const grouped: Record<string, ComponentDefinition[]> = {};
    
    categories.forEach(category => {
      const compsInCategory = filteredComponents.filter(comp => comp.category === category);
      if (compsInCategory.length > 0) {
        grouped[category] = compsInCategory;
      }
    });
    
    return grouped;
  }, [filteredComponents, categories]);

  // Handle search change
  const handleSearchChange = (event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
    setSearchText(newValue || '');
  };

  // Handle component drag start
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, component: ComponentDefinition) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'component',
      componentId: component.id
    }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Stack styles={stackStyles} tokens={stackTokens} className="anvil-component-library">
      <Stack styles={headerStyles}>
        <Text variant="large">Components</Text>
        <SearchBox 
          placeholder="Search components" 
          onChange={handleSearchChange}
          value={searchText}
        />
      </Stack>
      
      <Stack styles={componentsContainerStyles} tokens={stackTokens}>
        {Object.entries(componentsByCategory).map(([category, comps]) => (
          <Stack key={category} tokens={stackTokens}>
            <Text variant="mediumPlus" style={{ fontWeight: 600 }}>{category}</Text>
            <Stack horizontal wrap tokens={stackTokens}>
              {comps.map(comp => (
                <ComponentCard 
                  key={comp.id} 
                  component={comp} 
                  onDragStart={(e) => handleDragStart(e, comp)} 
                />
              ))}
            </Stack>
          </Stack>
        ))}
        
        {filteredComponents.length === 0 && (
          <Text>No components found</Text>
        )}
      </Stack>
    </Stack>
  );
};
