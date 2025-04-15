import React, { useContext, useState, useRef, useEffect } from 'react';
import { Stack, IStackStyles } from '@fluentui/react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { UIContext } from '../../contexts/UIContext';
import { ComponentRegistry } from '../../services/ComponentRegistry';

// Styles
const workspaceStyles: IStackStyles = {
  root: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
};

const canvasStyles: IStackStyles = {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
};

/**
 * Workspace component for the visual GUI builder
 * 
 * @author Justin Lietz
 */
export const Workspace: React.FC = () => {
  // Contexts
  const { project, updateProject } = useContext(ProjectContext);
  const { selectedComponentIds, setSelectedComponentIds } = useContext(UIContext);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  // Handle drag over
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
    
    // Calculate position relative to canvas
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setDragPosition({ x, y });
    }
    
    // Set drop effect
    event.dataTransfer.dropEffect = 'copy';
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };
  
  // Handle drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    
    try {
      // Get drop data
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      
      if (data.type === 'component') {
        // Create new component instance
        const newComponent = ComponentRegistry.createComponentInstance(data.componentId);
        
        if (newComponent && project) {
          // Set position
          newComponent.styles = {
            ...newComponent.styles,
            position: 'absolute',
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
          };
          
          // Add to project
          const updatedComponents = [...project.components, newComponent];
          updateProject({ components: updatedComponents });
          
          // Select the new component
          setSelectedComponentIds([newComponent.id]);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };
  
  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Deselect all components if clicking on the canvas background
    if (event.target === canvasRef.current) {
      setSelectedComponentIds([]);
    }
  };
  
  // Handle component click
  const handleComponentClick = (event: React.MouseEvent<HTMLDivElement>, componentId: string) => {
    event.stopPropagation();
    
    // Select component
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd key
      if (selectedComponentIds.includes(componentId)) {
        setSelectedComponentIds(selectedComponentIds.filter(id => id !== componentId));
      } else {
        setSelectedComponentIds([...selectedComponentIds, componentId]);
      }
    } else {
      // Single select
      setSelectedComponentIds([componentId]);
    }
  };
  
  // Render component
  const renderComponent = (component: any) => {
    const componentDef = ComponentRegistry.getComponent(component.type);
    
    if (!componentDef) return null;
    
    const isSelected = selectedComponentIds.includes(component.id);
    
    return (
      <div
        key={component.id}
        className={`anvil-component ${isSelected ? 'selected' : ''}`}
        style={component.styles}
        onClick={(e) => handleComponentClick(e, component.id)}
      >
        {componentDef.renderComponent(component.props)}
        {component.children.map((child: any) => renderComponent(child))}
      </div>
    );
  };
  
  return (
    <Stack styles={workspaceStyles} className="anvil-workspace">
      <div
        ref={canvasRef}
        className="anvil-canvas"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        {/* Render components */}
        {project?.components.map(component => renderComponent(component))}
        
        {/* Drag placeholder */}
        {isDraggingOver && (
          <div
            className="anvil-component-placeholder"
            style={{
              position: 'absolute',
              left: `${dragPosition.x}px`,
              top: `${dragPosition.y}px`,
              width: '100px',
              height: '50px',
            }}
          />
        )}
      </div>
    </Stack>
  );
};
