import React, { useContext, useState, useRef, useEffect } from 'react';
import { Stack, IStackStyles, IconButton, DefaultButton } from '@fluentui/react';
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
    backgroundColor: '#252525',
  },
};

// Resizer handle positions
const resizerPositions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

/**
 * Workspace component for the visual GUI builder
 * 
 * @author Justin Lietz
 */
export const Workspace: React.FC = () => {
  // Contexts
  const { project, updateProject } = useContext(ProjectContext);
  const { 
    selectedComponentIds, 
    setSelectedComponentIds,
    setPropertiesPanelOpen,
    setSelectedComponent
  } = useContext(UIContext);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    componentId: string | null;
    initialPos: { x: number, y: number };
    initialMousePos: { x: number, y: number };
    type: 'move' | 'resize';
    resizeHandle: string | null;
  }>({
    isDragging: false,
    componentId: null,
    initialPos: { x: 0, y: 0 },
    initialMousePos: { x: 0, y: 0 },
    type: 'move',
    resizeHandle: null
  });
  
  // State
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  
  // Effects
  useEffect(() => {
    // Add global mouse event listeners for drag operations
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging || !dragRef.current.componentId) return;
      
      const { componentId, initialPos, initialMousePos, type, resizeHandle } = dragRef.current;
      const component = project?.components.find(c => c.id === componentId);
      if (!component) return;
      
      const deltaX = e.clientX - initialMousePos.x;
      const deltaY = e.clientY - initialMousePos.y;
      
      const updatedComponents = project?.components.map(comp => {
        if (comp.id !== componentId) return comp;
        
        const styles = { ...comp.styles };
        
        if (type === 'move') {
          // Update position for move
          return {
            ...comp,
            styles: {
              ...styles,
              left: `${parseInt(initialPos.x + deltaX)}px`,
              top: `${parseInt(initialPos.y + deltaY)}px`
            }
          };
        } else if (type === 'resize' && resizeHandle) {
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
          if (resizeHandle.includes('n')) {
            newTop = initialPos.y + deltaY;
            newHeight = currentHeight - deltaY;
          }
          if (resizeHandle.includes('s')) {
            newHeight = currentHeight + deltaY;
          }
          if (resizeHandle.includes('w')) {
            newLeft = initialPos.x + deltaX;
            newWidth = currentWidth - deltaX;
          }
          if (resizeHandle.includes('e')) {
            newWidth = currentWidth + deltaX;
          }
          
          // Ensure minimum size
          newWidth = Math.max(20, newWidth);
          newHeight = Math.max(20, newHeight);
          
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
      }) || [];
      
      updateProject({ components: updatedComponents });
    };
    
    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      dragRef.current.componentId = null;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [project, updateProject]);
  
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
            width: '150px',
            height: '40px',
            background: '#ffffff',
            border: '1px solid #cccccc',
            padding: '8px',
            boxSizing: 'border-box'
          };
          
          // Add to project
          const updatedComponents = [...project.components, newComponent];
          updateProject({ components: updatedComponents });
          
          // Select the new component
          setSelectedComponentIds([newComponent.id]);
          setSelectedComponent(newComponent);
          setPropertiesPanelOpen(true);
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
      setSelectedComponent(null);
    }
  };
  
  // Handle component click
  const handleComponentClick = (event: React.MouseEvent<HTMLDivElement>, component: any) => {
    event.stopPropagation();
    
    // Select component
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd key
      if (selectedComponentIds.includes(component.id)) {
        setSelectedComponentIds(selectedComponentIds.filter(id => id !== component.id));
        setSelectedComponent(null);
      } else {
        setSelectedComponentIds([...selectedComponentIds, component.id]);
        setSelectedComponent(component);
      }
    } else {
      // Single select
      setSelectedComponentIds([component.id]);
      setSelectedComponent(component);
      setPropertiesPanelOpen(true);
    }
  };
  
  // Handle component mouse down
  const handleComponentMouseDown = (event: React.MouseEvent<HTMLDivElement>, component: any) => {
    event.stopPropagation();
    
    // Check if the event target is a resize handle
    const targetClassList = (event.target as HTMLElement).classList;
    if (targetClassList.contains('component-resize-handle')) {
      // Get which handle was clicked
      const resizeHandlePos = Array.from(targetClassList)
        .find(cls => cls.startsWith('resize-'))?.replace('resize-', '');
      
      if (resizeHandlePos) {
        dragRef.current = {
          isDragging: true,
          componentId: component.id,
          initialPos: {
            x: parseInt(component.styles.left as string) || 0,
            y: parseInt(component.styles.top as string) || 0
          },
          initialMousePos: { x: event.clientX, y: event.clientY },
          type: 'resize',
          resizeHandle: resizeHandlePos
        };
      }
    } else {
      // Start moving the component
      dragRef.current = {
        isDragging: true,
        componentId: component.id,
        initialPos: {
          x: parseInt(component.styles.left as string) || 0,
          y: parseInt(component.styles.top as string) || 0
        },
        initialMousePos: { x: event.clientX, y: event.clientY },
        type: 'move',
        resizeHandle: null
      };
    }
  };

  // Handle context menu for components
  const handleContextMenu = (event: React.MouseEvent, component: any) => {
    event.preventDefault();
    // TODO: Show context menu for additional actions
  };
  
  // Handle component double click
  const handleDoubleClick = (event: React.MouseEvent, component: any) => {
    event.preventDefault();
    
    // Open properties panel if not already open
    setSelectedComponentIds([component.id]);
    setSelectedComponent(component);
    setPropertiesPanelOpen(true);
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
        style={{
          ...component.styles,
          position: component.styles.position || 'absolute',
          cursor: isSelected ? 'move' : 'pointer',
          border: isSelected ? '1px solid #0078d4' : component.styles.border || '1px solid transparent',
          boxShadow: isSelected ? '0 0 0 2px rgba(0, 120, 212, 0.4)' : 'none'
        }}
        onClick={(e) => handleComponentClick(e, component)}
        onMouseDown={(e) => handleComponentMouseDown(e, component)}
        onContextMenu={(e) => handleContextMenu(e, component)}
        onDoubleClick={(e) => handleDoubleClick(e, component)}
      >
        <div className="component-content">
          {componentDef.renderComponent(component.props)}
          {component.children.map((child: any) => renderComponent(child))}
        </div>
        
        {/* Render resize handles when selected */}
        {isSelected && resizerPositions.map(pos => (
          <div 
            key={`resize-${pos}`}
            className={`component-resize-handle resize-${pos}`}
            style={{
              position: 'absolute',
              width: pos.includes('n') || pos.includes('s') ? '10px' : '6px',
              height: pos.includes('e') || pos.includes('w') ? '10px' : '6px',
              background: '#0078d4',
              borderRadius: '50%',
              ...(pos.includes('n') ? { top: '-4px' } : {}),
              ...(pos.includes('s') ? { bottom: '-4px' } : {}),
              ...(pos.includes('e') ? { right: '-4px' } : {}),
              ...(pos.includes('w') ? { left: '-4px' } : {}),
              ...(pos === 'n' ? { left: 'calc(50% - 3px)' } : {}),
              ...(pos === 's' ? { left: 'calc(50% - 3px)' } : {}),
              ...(pos === 'e' ? { top: 'calc(50% - 3px)' } : {}),
              ...(pos === 'w' ? { top: 'calc(50% - 3px)' } : {}),
              ...(pos === 'nw' ? { cursor: 'nw-resize' } : {}),
              ...(pos === 'n' ? { cursor: 'n-resize' } : {}),
              ...(pos === 'ne' ? { cursor: 'ne-resize' } : {}),
              ...(pos === 'e' ? { cursor: 'e-resize' } : {}),
              ...(pos === 'se' ? { cursor: 'se-resize' } : {}),
              ...(pos === 's' ? { cursor: 's-resize' } : {}),
              ...(pos === 'sw' ? { cursor: 'sw-resize' } : {}),
              ...(pos === 'w' ? { cursor: 'w-resize' } : {}),
              zIndex: 100
            }}
          />
        ))}
        
        {/* Component label when selected */}
        {isSelected && (
          <div
            className="component-label"
            style={{
              position: 'absolute',
              top: '-24px',
              left: '0',
              background: '#0078d4',
              color: 'white',
              padding: '2px 6px',
              fontSize: '11px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              zIndex: 101
            }}
          >
            {component.type}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Stack styles={workspaceStyles} className="anvil-workspace">
      <div
        ref={canvasRef}
        className="anvil-canvas"
        style={canvasStyles.root}
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
              width: '150px',
              height: '40px',
              border: '2px dashed #0078d4',
              backgroundColor: 'rgba(0, 120, 212, 0.1)',
              borderRadius: '2px',
              pointerEvents: 'none',
              zIndex: 999
            }}
          />
        )}
      </div>
    </Stack>
  );
};
