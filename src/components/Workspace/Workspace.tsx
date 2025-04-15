import React, { useState, useRef, useContext, useEffect } from 'react';
import { Stack } from '@fluentui/react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { UIContext } from '../../contexts/UIContext';
import { ComponentRegistry } from '../../services/ComponentRegistry';
import './Workspace.css';

export const Workspace: React.FC = () => {
  const { project, updateProject } = useContext(ProjectContext);
  const { selectedComponentIds, setSelectedComponentIds, setSelectedComponent } = useContext(UIContext);
  
  // State for drag and drop
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  // Ref for the canvas element
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State for tracking dragging/resizing
  const [dragInfo, setDragInfo] = useState<{
    isDragging: boolean;
    componentId: string | null;
    startPos: { x: number, y: number };
    startMouse: { x: number, y: number };
    type: 'move' | 'resize';
    handle: string | null;
  }>({
    isDragging: false,
    componentId: null,
    startPos: { x: 0, y: 0 },
    startMouse: { x: 0, y: 0 },
    type: 'move',
    handle: null
  });

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setDragPosition({ x, y });
    }
    
    e.dataTransfer.dropEffect = 'copy';
  };
  
  // Handle drag leave
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.type === 'component' && project) {
        // Create component instance
        const newComponent = ComponentRegistry.createComponentInstance(data.componentId);
        
        if (newComponent) {
          // Set position and default styles
          newComponent.styles = {
            position: 'absolute',
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            width: '150px',
            height: '50px',
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '4px',
            padding: '8px',
            boxSizing: 'border-box'
          };
          
          // Update project
          const updatedComponents = [...(project.components || []), newComponent];
          updateProject({ components: updatedComponents });
          
          // Select the new component
          setSelectedComponentIds([newComponent.id]);
          setSelectedComponent(newComponent);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };
  
  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedComponentIds([]);
      setSelectedComponent(null);
    }
  };
  
  // Handle component click (select)
  const handleComponentClick = (e: React.MouseEvent, component: any) => {
    e.stopPropagation();
    
    // Select the component
    setSelectedComponentIds([component.id]);
    setSelectedComponent(component);
  };
  
  // Handle mouse down on component
  const handleMouseDown = (e: React.MouseEvent, component: any) => {
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    // Check if clicked on resize handle
    if (target.classList.contains('component-resize-handle')) {
      // Get which handle (n, ne, e, se, etc.)
      const handle = Array.from(target.classList)
        .find(cls => cls.startsWith('resize-'))?.replace('resize-', '');
      
      if (handle) {
        setDragInfo({
          isDragging: true,
          componentId: component.id,
          startPos: {
            x: parseInt(component.styles.left as string) || 0,
            y: parseInt(component.styles.top as string) || 0
          },
          startMouse: { x: e.clientX, y: e.clientY },
          type: 'resize',
          handle
        });
      }
    } else {
      // Start moving the component
      setDragInfo({
        isDragging: true,
        componentId: component.id,
        startPos: {
          x: parseInt(component.styles.left as string) || 0,
          y: parseInt(component.styles.top as string) || 0
        },
        startMouse: { x: e.clientX, y: e.clientY },
        type: 'move',
        handle: null
      });
    }
  };
  
  // Handle mouse move (for dragging and resizing)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragInfo.isDragging || !dragInfo.componentId || !project) return;
      
      const component = project.components.find(c => c.id === dragInfo.componentId);
      if (!component) return;
      
      const deltaX = e.clientX - dragInfo.startMouse.x;
      const deltaY = e.clientY - dragInfo.startMouse.y;
      
      const updatedComponents = project.components.map(comp => {
        if (comp.id !== dragInfo.componentId) return comp;
        
        const styles = { ...comp.styles };
        
        if (dragInfo.type === 'move') {
          // Move the component
          return {
            ...comp,
            styles: {
              ...styles,
              left: `${dragInfo.startPos.x + deltaX}px`,
              top: `${dragInfo.startPos.y + deltaY}px`
            }
          };
        } else if (dragInfo.type === 'resize' && dragInfo.handle) {
          // Get current dimensions
          const currentLeft = parseInt(styles.left as string) || 0;
          const currentTop = parseInt(styles.top as string) || 0;
          const currentWidth = parseInt(styles.width as string) || 100;
          const currentHeight = parseInt(styles.height as string) || 50;
          
          let newLeft = currentLeft;
          let newTop = currentTop;
          let newWidth = currentWidth;
          let newHeight = currentHeight;
          
          // Handle resize based on which handle was grabbed
          if (dragInfo.handle.includes('n')) {
            newTop = dragInfo.startPos.y + deltaY;
            newHeight = Math.max(20, currentHeight - deltaY);
          }
          if (dragInfo.handle.includes('s')) {
            newHeight = Math.max(20, currentHeight + deltaY);
          }
          if (dragInfo.handle.includes('w')) {
            newLeft = dragInfo.startPos.x + deltaX;
            newWidth = Math.max(20, currentWidth - deltaX);
          }
          if (dragInfo.handle.includes('e')) {
            newWidth = Math.max(20, currentWidth + deltaX);
          }
          
          return {
            ...comp,
            styles: {
              ...styles,
              left: `${newLeft}px`,
              top: `${newTop}px`,
              width: `${newWidth}px`,
              height: `${newHeight}px`
            }
          };
        }
        
        return comp;
      });
      
      updateProject({ components: updatedComponents });
    };
    
    const handleMouseUp = () => {
      setDragInfo({
        ...dragInfo,
        isDragging: false,
        componentId: null
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragInfo, project, updateProject]);
  
  // Render component
  const renderComponent = (component: any) => {
    const componentDef = ComponentRegistry.getComponent(component.type);
    if (!componentDef) return null;
    
    const isSelected = selectedComponentIds.includes(component.id);
    
    return (
      <div
        key={component.id}
        className={`anvil-component ${isSelected ? 'selected' : ''}`}
        style={{
          ...component.styles,
          position: 'absolute'
        }}
        onClick={(e) => handleComponentClick(e, component)}
        onMouseDown={(e) => handleMouseDown(e, component)}
      >
        <div className="component-content">
          {componentDef.renderComponent(component.props)}
        </div>
        
        {isSelected && (
          <>
            {/* Component label */}
            <div className="component-label">
              {component.name || componentDef.name}
            </div>
            
            {/* Resize handles */}
            <div className="component-resize-handle resize-nw"></div>
            <div className="component-resize-handle resize-n"></div>
            <div className="component-resize-handle resize-ne"></div>
            <div className="component-resize-handle resize-e"></div>
            <div className="component-resize-handle resize-se"></div>
            <div className="component-resize-handle resize-s"></div>
            <div className="component-resize-handle resize-sw"></div>
            <div className="component-resize-handle resize-w"></div>
          </>
        )}
      </div>
    );
  };
  
  return (
    <Stack styles={{ root: { height: '100%' } }}>
      <div
        ref={canvasRef}
        className="anvil-canvas"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
        style={{ height: '100%' }}
      >
        {/* Render components */}
        {project?.components && project.components.map(component => 
          renderComponent(component)
        )}
        
        {/* Drag placeholder */}
        {isDraggingOver && (
          <div
            className="anvil-component-placeholder"
            style={{
              left: `${dragPosition.x}px`,
              top: `${dragPosition.y}px`,
              width: '150px',
              height: '50px'
            }}
          />
        )}
        
        {/* Empty state message */}
        {(!project?.components || project.components.length === 0) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#888'
          }}>
            <p>Drag components from the left sidebar to begin</p>
          </div>
        )}
      </div>
    </Stack>
  );
};
