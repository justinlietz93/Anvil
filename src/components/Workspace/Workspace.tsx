import React, { useContext, useState, useRef, useEffect } from 'react';
import { Stack, IconButton } from '@fluentui/react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { UIContext } from '../../contexts/UIContext';
import { ComponentRegistry } from '../../services/ComponentRegistry';
import './Workspace.css';

/**
 * Workspace component for the visual GUI builder
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
  const [contextMenu, setContextMenu] = useState<{ 
    visible: boolean; 
    x: number; 
    y: number;
    componentId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    componentId: null
  });
  
  // Effects
  useEffect(() => {
    // Add global mouse event listeners for drag operations
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.isDragging || !dragRef.current.componentId || !project) return;
      
      const { componentId, initialPos, initialMousePos, type, resizeHandle } = dragRef.current;
      const component = project.components.find(c => c.id === componentId);
      if (!component) return;
      
      const deltaX = e.clientX - initialMousePos.x;
      const deltaY = e.clientY - initialMousePos.y;
      
      const updatedComponents = project.components.map(comp => {
        if (comp.id !== componentId) return comp;
        
        const styles = { ...comp.styles };
        
        if (type === 'move') {
          // Update position for move
          return {
            ...comp,
            styles: {
              ...styles,
              left: `${parseInt((initialPos.x + deltaX).toString())}px`,
              top: `${parseInt((initialPos.y + deltaY).toString())}px`
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
      });
      
      updateProject({ components: updatedComponents });
    };
    
    const handleMouseUp = () => {
      dragRef.current.isDragging = false;
      dragRef.current.componentId = null;
    };
    
    // Close context menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible) {
        const menuElement = document.getElementById('component-context-menu');
        if (menuElement && !menuElement.contains(e.target as Node)) {
          setContextMenu({ ...contextMenu, visible: false });
        }
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [project, updateProject, contextMenu]);
  
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
      
      if (data.type === 'component' && project) {
        // Create new component instance
        const newComponent = ComponentRegistry.createComponentInstance(data.componentId);
        
        if (newComponent) {
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
          const updatedComponents = [...(project.components || []), newComponent];
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
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      componentId: component.id
    });
  };
  
  // Handle component double click
  const handleDoubleClick = (event: React.MouseEvent, component: any) => {
    event.preventDefault();
    
    // Open properties panel if not already open
    setSelectedComponentIds([component.id]);
    setSelectedComponent(component);
    setPropertiesPanelOpen(true);
  };

  // Handle context menu actions
  const handleContextMenuAction = (action: string) => {
    if (!contextMenu.componentId || !project) return;
    
    switch (action) {
      case 'edit':
        // Select component and open properties
        const component = project.components.find(c => c.id === contextMenu.componentId);
        if (component) {
          setSelectedComponentIds([component.id]);
          setSelectedComponent(component);
          setPropertiesPanelOpen(true);
        }
        break;
        
      case 'delete':
        // Remove component from project
        const updatedComponents = project.components.filter(c => c.id !== contextMenu.componentId);
        updateProject({ components: updatedComponents });
        setSelectedComponentIds([]);
        setSelectedComponent(null);
        break;
        
      case 'duplicate':
        // Duplicate the component
        const origComponent = project.components.find(c => c.id === contextMenu.componentId);
        if (origComponent) {
          const newComponent = {
            ...JSON.parse(JSON.stringify(origComponent)), // Deep clone
            id: `comp-${Date.now()}`
          };
          
          // Offset position slightly
          const left = parseInt(newComponent.styles.left as string) || 0;
          const top = parseInt(newComponent.styles.top as string) || 0;
          newComponent.styles.left = `${left + 20}px`;
          newComponent.styles.top = `${top + 20}px`;
          
          const updatedComponents = [...project.components, newComponent];
          updateProject({ components: updatedComponents });
          
          // Select the new component
          setSelectedComponentIds([newComponent.id]);
          setSelectedComponent(newComponent);
        }
        break;
    }
    
    // Close the context menu
    setContextMenu({ ...contextMenu, visible: false });
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
        }}
        onClick={(e) => handleComponentClick(e, component)}
        onMouseDown={(e) => handleComponentMouseDown(e, component)}
        onContextMenu={(e) => handleContextMenu(e, component)}
        onDoubleClick={(e) => handleDoubleClick(e, component)}
      >
        <div className="component-content">
          {componentDef.renderComponent(component.props)}
          {component.children && component.children.map((child: any) => renderComponent(child))}
        </div>
        
        {/* Render resize handles when selected */}
        {isSelected && ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'].map(pos => (
          <div 
            key={`resize-${pos}`}
            className={`component-resize-handle resize-${pos}`}
          />
        ))}
        
        {/* Component label when selected */}
        {isSelected && (
          <div className="component-label">
            {component.name || componentDef.name}
          </div>
        )}
      </div>
    );
  };

  // Render context menu
  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;
    
    return (
      <div 
        id="component-context-menu"
        className="component-context-menu"
        style={{ 
          top: `${contextMenu.y}px`,
          left: `${contextMenu.x}px`
        }}
      >
        <div className="context-menu-item" onClick={() => handleContextMenuAction('edit')}>
          <i className="ms-Icon ms-Icon--Edit"></i>
          Edit Properties
        </div>
        <div className="context-menu-item" onClick={() => handleContextMenuAction('duplicate')}>
          <i className="ms-Icon ms-Icon--Copy"></i>
          Duplicate
        </div>
        <div className="context-menu-separator"></div>
        <div className="context-menu-item" onClick={() => handleContextMenuAction('delete')}>
          <i className="ms-Icon ms-Icon--Delete"></i>
          Delete
        </div>
      </div>
    );
  };
  
  return (
    <Stack className="anvil-workspace" style={{ height: '100%' }}>
      <div
        ref={canvasRef}
        className="anvil-canvas"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        {/* Render components */}
        {project?.components && project.components.map(component => renderComponent(component))}
        
        {/* Drag placeholder */}
        {isDraggingOver && (
          <div
            className="anvil-component-placeholder"
            style={{
              left: `${dragPosition.x}px`,
              top: `${dragPosition.y}px`,
              width: '150px',
              height: '40px',
            }}
          />
        )}
        
        {/* Context menu */}
        {renderContextMenu()}
        
        {/* Empty state message */}
        {(!project?.components || project.components.length === 0) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#888',
            textAlign: 'center'
          }}>
            <p>Drag components from the sidebar to start building your application.</p>
          </div>
        )}
      </div>
    </Stack>
  );
};
