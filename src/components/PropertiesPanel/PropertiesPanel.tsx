import React, { useContext, useMemo } from 'react';
import { 
  Stack, 
  IStackStyles, 
  IStackTokens,
  Text,
  TextField,
  Toggle,
  Dropdown,
  IDropdownOption,
  SpinButton
} from '@fluentui/react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { UIContext } from '../../contexts/UIContext';
import { ComponentRegistry } from '../../services/ComponentRegistry';

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

const propertiesContainerStyles: IStackStyles = {
  root: {
    marginTop: 10,
  },
};

// Tokens
const stackTokens: IStackTokens = {
  childrenGap: 10,
};

/**
 * Properties Panel component for editing component properties
 * 
 * @author Justin Lietz
 */
export const PropertiesPanel: React.FC = () => {
  // Contexts
  const { project, updateProject } = useContext(ProjectContext);
  const { selectedComponentIds } = useContext(UIContext);
  
  // Get selected component
  const selectedComponent = useMemo(() => {
    if (!project || selectedComponentIds.length !== 1) return null;
    
    return project.components.find(comp => comp.id === selectedComponentIds[0]) || null;
  }, [project, selectedComponentIds]);
  
  // Get component definition
  const componentDef = useMemo(() => {
    if (!selectedComponent) return null;
    
    return ComponentRegistry.getComponent(selectedComponent.type) || null;
  }, [selectedComponent]);
  
  // Handle property change
  const handlePropertyChange = (propName: string, value: any) => {
    if (!selectedComponent || !project) return;
    
    // Create updated component with new property value
    const updatedComponent = {
      ...selectedComponent,
      props: {
        ...selectedComponent.props,
        [propName]: value
      }
    };
    
    // Update project with modified component
    const updatedComponents = project.components.map(comp => 
      comp.id === selectedComponent.id ? updatedComponent : comp
    );
    
    updateProject({ components: updatedComponents });
  };
  
  // Render property editor based on property type
  const renderPropertyEditor = (propName: string, propType: any) => {
    if (!selectedComponent) return null;
    
    const value = selectedComponent.props[propName];
    
    switch (propType.type) {
      case 'string':
        return (
          <TextField
            label={propName}
            value={value || ''}
            onChange={(_, newValue) => handlePropertyChange(propName, newValue)}
            description={propType.description}
          />
        );
        
      case 'number':
        return (
          <SpinButton
            label={propName}
            value={value?.toString() || '0'}
            min={0}
            step={1}
            onChange={(_, newValue) => handlePropertyChange(propName, Number(newValue))}
            description={propType.description}
          />
        );
        
      case 'boolean':
        return (
          <Toggle
            label={propName}
            checked={value || false}
            onChange={(_, checked) => handlePropertyChange(propName, checked)}
            onText="Yes"
            offText="No"
            description={propType.description}
          />
        );
        
      case 'enum':
        const options: IDropdownOption[] = (propType.options || []).map((opt: any) => ({
          key: opt,
          text: opt.toString()
        }));
        
        return (
          <Dropdown
            label={propName}
            selectedKey={value}
            options={options}
            onChange={(_, option) => option && handlePropertyChange(propName, option.key)}
            description={propType.description}
          />
        );
        
      default:
        return (
          <TextField
            label={propName}
            value={JSON.stringify(value) || ''}
            multiline
            rows={3}
            onChange={(_, newValue) => {
              try {
                const parsedValue = JSON.parse(newValue || '');
                handlePropertyChange(propName, parsedValue);
              } catch (e) {
                // Invalid JSON, don't update
              }
            }}
            description={propType.description}
          />
        );
    }
  };
  
  // If no component is selected
  if (!selectedComponent || !componentDef) {
    return (
      <Stack styles={stackStyles} tokens={stackTokens} className="anvil-properties-panel">
        <Text variant="large">Properties</Text>
        <Text>No component selected</Text>
      </Stack>
    );
  }
  
  return (
    <Stack styles={stackStyles} tokens={stackTokens} className="anvil-properties-panel">
      <Stack styles={headerStyles}>
        <Text variant="large">Properties</Text>
        <Text variant="medium">{componentDef.name}</Text>
      </Stack>
      
      <Stack styles={propertiesContainerStyles} tokens={stackTokens}>
        {/* Component ID (read-only) */}
        <TextField
          label="ID"
          value={selectedComponent.id}
          readOnly
          disabled
        />
        
        {/* Component Name */}
        <TextField
          label="Name"
          value={selectedComponent.name}
          onChange={(_, newValue) => {
            if (!project) return;
            
            const updatedComponent = {
              ...selectedComponent,
              name: newValue || ''
            };
            
            const updatedComponents = project.components.map(comp => 
              comp.id === selectedComponent.id ? updatedComponent : comp
            );
            
            updateProject({ components: updatedComponents });
          }}
        />
        
        {/* Component Properties */}
        {Object.entries(componentDef.propTypes).map(([propName, propType]) => (
          <div key={propName}>
            {renderPropertyEditor(propName, propType)}
          </div>
        ))}
      </Stack>
    </Stack>
  );
};
