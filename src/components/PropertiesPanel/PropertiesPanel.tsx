import React, { useContext } from 'react';
import { 
  Stack, 
  IStackStyles, 
  IStackTokens,
  Text,
  TextField,
  Toggle,
  Dropdown,
  IDropdownOption,
  SpinButton,
  Pivot,
  PivotItem,
  Label,
  IconButton,
  ColorPicker,
  IColor,
  Position,
  Slider
} from '@fluentui/react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { UIContext } from '../../contexts/UIContext';
import { ComponentRegistry } from '../../services/ComponentRegistry';

// Styles
const stackStyles: IStackStyles = {
  root: {
    padding: 10,
    height: '100%',
    overflowY: 'auto',
    background: '#1e1e1e',
    color: '#ffffff'
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
  const { selectedComponent, selectedComponentIds, setSelectedComponent } = useContext(UIContext);
  
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
    setSelectedComponent(updatedComponent);
  };
  
  // Handle style change
  const handleStyleChange = (styleProp: string, value: any) => {
    if (!selectedComponent || !project) return;
    
    // Create updated component with new style value
    const updatedComponent = {
      ...selectedComponent,
      styles: {
        ...selectedComponent.styles,
        [styleProp]: value
      }
    };
    
    // Update project with modified component
    const updatedComponents = project.components.map(comp => 
      comp.id === selectedComponent.id ? updatedComponent : comp
    );
    
    updateProject({ components: updatedComponents });
    setSelectedComponent(updatedComponent);
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

  // Render style editors
  const renderStyleEditors = () => {
    if (!selectedComponent) return null;
    
    const styles = selectedComponent.styles || {};
    
    return (
      <Stack tokens={stackTokens}>
        {/* Position */}
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <TextField
            label="Position X"
            type="number"
            value={(parseInt(styles.left as string) || 0).toString()}
            onChange={(_, newValue) => {
              handleStyleChange('left', `${newValue}px`);
            }}
            styles={{ fieldGroup: { width: 80 } }}
          />
          <TextField
            label="Position Y"
            type="number"
            value={(parseInt(styles.top as string) || 0).toString()}
            onChange={(_, newValue) => {
              handleStyleChange('top', `${newValue}px`);
            }}
            styles={{ fieldGroup: { width: 80 } }}
          />
        </Stack>
        
        {/* Size */}
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <TextField
            label="Width"
            type="number"
            value={(parseInt(styles.width as string) || 100).toString()}
            onChange={(_, newValue) => {
              handleStyleChange('width', `${newValue}px`);
            }}
            styles={{ fieldGroup: { width: 80 } }}
          />
          <TextField
            label="Height"
            type="number"
            value={(parseInt(styles.height as string) || 40).toString()}
            onChange={(_, newValue) => {
              handleStyleChange('height', `${newValue}px`);
            }}
            styles={{ fieldGroup: { width: 80 } }}
          />
        </Stack>
        
        {/* Padding */}
        <Label>Padding</Label>
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <TextField
            label="Top"
            type="number"
            value={(parseInt((styles.paddingTop || styles.padding) as string) || 0).toString()}
            onChange={(_, newValue) => {
              handleStyleChange('paddingTop', `${newValue}px`);
            }}
            styles={{ fieldGroup: { width: 60 } }}
          />
          <TextField
            label="Right"
            type="number"
            value={(parseInt((styles.paddingRight || styles.padding) as string) || 0).toString()}
            onChange={(_, newValue) => {
              handleStyleChange('paddingRight', `${newValue}px`);
            }}
            styles={{ fieldGroup: { width: 60 } }}
          />
          <TextField
            label="Bottom"
            type="number"
            value={(parseInt((styles.paddingBottom || styles.padding) as string) || 0).toString()}
            onChange={(_, newValue) => {
              handleStyleChange('paddingBottom', `${newValue}px`);
            }}
            styles={{ fieldGroup: { width: 60 } }}
          />
          <TextField
            label="Left"
            type="number"
            value={(parseInt((styles.paddingLeft || styles.padding) as string) || 0).toString()}
            onChange={(_, newValue) => {
              handleStyleChange('paddingLeft', `${newValue}px`);
            }}
            styles={{ fieldGroup: { width: 60 } }}
          />
        </Stack>
        
        {/* Background Color */}
        <Stack>
          <Label>Background Color</Label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 24,
                height: 24,
                backgroundColor: styles.backgroundColor as string || 'transparent',
                border: '1px solid #cccccc',
                marginRight: 8
              }}
            />
            <TextField
              value={styles.backgroundColor as string || 'transparent'}
              onChange={(_, newValue) => {
                handleStyleChange('backgroundColor', newValue);
              }}
            />
          </div>
        </Stack>
        
        {/* Border */}
        <Stack tokens={{ childrenGap: 8 }}>
          <Label>Border</Label>
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <TextField
              label="Width"
              type="number"
              value={(parseInt(styles.borderWidth as string) || 0).toString()}
              onChange={(_, newValue) => {
                handleStyleChange('borderWidth', `${newValue}px`);
              }}
              styles={{ fieldGroup: { width: 60 } }}
            />
            <Dropdown
              label="Style"
              selectedKey={styles.borderStyle || 'solid'}
              options={[
                { key: 'none', text: 'None' },
                { key: 'solid', text: 'Solid' },
                { key: 'dashed', text: 'Dashed' },
                { key: 'dotted', text: 'Dotted' }
              ]}
              onChange={(_, option) => {
                if (option) handleStyleChange('borderStyle', option.key);
              }}
              styles={{ dropdown: { width: 100 } }}
            />
            <div>
              <Label>Color</Label>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: styles.borderColor as string || '#cccccc',
                    border: '1px solid #cccccc',
                    marginRight: 8
                  }}
                />
                <TextField
                  value={styles.borderColor as string || '#cccccc'}
                  onChange={(_, newValue) => {
                    handleStyleChange('borderColor', newValue);
                  }}
                  styles={{ fieldGroup: { width: 80 } }}
                />
              </div>
            </div>
          </Stack>
        </Stack>
        
        {/* Text styles */}
        <Stack tokens={{ childrenGap: 8 }}>
          <Label>Text</Label>
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <Dropdown
              label="Align"
              selectedKey={styles.textAlign || 'left'}
              options={[
                { key: 'left', text: 'Left' },
                { key: 'center', text: 'Center' },
                { key: 'right', text: 'Right' }
              ]}
              onChange={(_, option) => {
                if (option) handleStyleChange('textAlign', option.key);
              }}
              styles={{ dropdown: { width: 100 } }}
            />
            <TextField
              label="Font Size"
              type="number"
              value={(parseInt(styles.fontSize as string) || 14).toString()}
              onChange={(_, newValue) => {
                handleStyleChange('fontSize', `${newValue}px`);
              }}
              styles={{ fieldGroup: { width: 60 } }}
            />
            <div>
              <Label>Color</Label>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: styles.color as string || '#000000',
                    border: '1px solid #cccccc',
                    marginRight: 8
                  }}
                />
                <TextField
                  value={styles.color as string || '#000000'}
                  onChange={(_, newValue) => {
                    handleStyleChange('color', newValue);
                  }}
                  styles={{ fieldGroup: { width: 80 } }}
                />
              </div>
            </div>
          </Stack>
        </Stack>
      </Stack>
    );
  };

  // If no component is selected
  if (!selectedComponent) {
    return (
      <Stack styles={stackStyles} tokens={stackTokens} className="anvil-properties-panel">
        <Text variant="large">Properties</Text>
        <Text>No component selected</Text>
      </Stack>
    );
  }
  
  // Get component definition
  const componentDef = ComponentRegistry.getComponent(selectedComponent.type);
  
  // If component definition is not found
  if (!componentDef) {
    return (
      <Stack styles={stackStyles} tokens={stackTokens} className="anvil-properties-panel">
        <Text variant="large">Properties</Text>
        <Text>Unknown component type: {selectedComponent.type}</Text>
      </Stack>
    );
  }
  
  return (
    <Stack styles={stackStyles} tokens={stackTokens} className="anvil-properties-panel">
      <Stack styles={headerStyles}>
        <Text variant="large">Properties</Text>
        <Text variant="medium">{componentDef.name}</Text>
      </Stack>
      
      <Pivot>
        <PivotItem headerText="Properties">
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
              value={selectedComponent.name || ''}
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
                setSelectedComponent(updatedComponent);
              }}
            />
            
            {/* Component Properties */}
            {componentDef.propTypes && Object.entries(componentDef.propTypes).map(([propName, propType]) => (
              <div key={propName}>
                {renderPropertyEditor(propName, propType)}
              </div>
            ))}
          </Stack>
        </PivotItem>
        <PivotItem headerText="Styles">
          <Stack styles={propertiesContainerStyles} tokens={stackTokens}>
            {renderStyleEditors()}
          </Stack>
        </PivotItem>
        <PivotItem headerText="Events">
          <Stack styles={propertiesContainerStyles} tokens={stackTokens}>
            <Text>Event handlers will be implemented in a future update.</Text>
          </Stack>
        </PivotItem>
      </Pivot>
    </Stack>
  );
};
