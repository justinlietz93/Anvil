import React, { useContext, useState, useRef, useEffect } from 'react';
import { Stack, IStackStyles, IStackTokens } from '@fluentui/react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { UIContext } from '../../contexts/UIContext';
import { BlueprintRegistry } from '../../services/BlueprintRegistry';
import { NodeLibrary } from './NodeLibrary';

// Styles
const stackStyles: IStackStyles = {
  root: {
    height: '100%',
    overflow: 'hidden',
  },
};

const contentStyles: IStackStyles = {
  root: {
    height: '100%',
    display: 'flex',
  },
};

const sidebarStyles: IStackStyles = {
  root: {
    width: 300,
    borderRight: '1px solid #555555',
  },
};

const canvasContainerStyles: IStackStyles = {
  root: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
};

// Tokens
const stackTokens: IStackTokens = {
  childrenGap: 0,
};

/**
 * Blueprint Editor component for the visual logic programming
 * 
 * @author Justin Lietz
 */
export const BlueprintEditor: React.FC = () => {
  // Contexts
  const { project, updateProject } = useContext(ProjectContext);
  const { selectedComponentIds } = useContext(UIContext);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [activeBlueprint, setActiveBlueprint] = useState<string | null>(null);
  
  // Get current blueprint
  const currentBlueprint = React.useMemo(() => {
    if (!project || !activeBlueprint) return null;
    return project.blueprints.find(bp => bp.id === activeBlueprint) || null;
  }, [project, activeBlueprint]);
  
  // Set first blueprint as active on mount or when blueprints change
  useEffect(() => {
    if (project && project.blueprints.length > 0 && !activeBlueprint) {
      setActiveBlueprint(project.blueprints[0].id);
    } else if (project && project.blueprints.length === 0) {
      // Create a default blueprint if none exists
      const newBlueprint = BlueprintRegistry.createBlueprint('Main Blueprint', 'Main application logic');
      updateProject({ blueprints: [newBlueprint] });
      setActiveBlueprint(newBlueprint.id);
    }
  }, [project, activeBlueprint, updateProject]);
  
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
    
    if (!project || !currentBlueprint) return;
    
    try {
      // Get drop data
      const data = JSON.parse(event.dataTransfer.getData('application/json'));
      
      if (data.type === 'node') {
        // Create new node instance
        const newNode = BlueprintRegistry.createNodeInstance(data.nodeId, dragPosition);
        
        if (newNode) {
          // Add to current blueprint
          const updatedBlueprint = {
            ...currentBlueprint,
            nodes: [...currentBlueprint.nodes, newNode]
          };
          
          // Update project with modified blueprint
          const updatedBlueprints = project.blueprints.map(bp => 
            bp.id === currentBlueprint.id ? updatedBlueprint : bp
          );
          
          updateProject({ blueprints: updatedBlueprints });
          
          // Select the new node
          setSelectedNodeIds([newNode.id]);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };
  
  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Deselect all nodes if clicking on the canvas background
    if (event.target === canvasRef.current) {
      setSelectedNodeIds([]);
    }
  };
  
  // Handle node click
  const handleNodeClick = (event: React.MouseEvent<HTMLDivElement>, nodeId: string) => {
    event.stopPropagation();
    
    // Select node
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd key
      if (selectedNodeIds.includes(nodeId)) {
        setSelectedNodeIds(selectedNodeIds.filter(id => id !== nodeId));
      } else {
        setSelectedNodeIds([...selectedNodeIds, nodeId]);
      }
    } else {
      // Single select
      setSelectedNodeIds([nodeId]);
    }
  };
  
  // Render node
  const renderNode = (node: any) => {
    const isSelected = selectedNodeIds.includes(node.id);
    
    return (
      <div
        key={node.id}
        className={`anvil-node ${isSelected ? 'selected' : ''}`}
        style={{
          left: `${node.position.x}px`,
          top: `${node.position.y}px`,
        }}
        onClick={(e) => handleNodeClick(e, node.id)}
      >
        <div className="anvil-node-header">
          {node.type.split('-').pop()}
        </div>
        <div className="anvil-node-content">
          {/* Input ports */}
          {Object.entries(node.inputs).map(([portId, value]: [string, any]) => (
            <div key={`input-${portId}`} className="anvil-node-port">
              <div className="anvil-node-port-dot"></div>
              <span style={{ color: 'white' }}>{portId}</span>
            </div>
          ))}
          
          {/* Output ports */}
          {Object.entries(node.outputs).map(([portId, value]: [string, any]) => (
            <div key={`output-${portId}`} className="anvil-node-port">
              <span style={{ color: 'white' }}>{portId}</span>
              <div className="anvil-node-port-dot"></div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render connection
  const renderConnection = (connection: any) => {
    // This would be implemented with SVG path drawing
    return (
      <div key={connection.id} className="anvil-connection">
        {/* Connection visualization would go here */}
      </div>
    );
  };
  
  return (
    <Stack styles={stackStyles} tokens={stackTokens}>
      <Stack horizontal styles={contentStyles} tokens={stackTokens}>
        <Stack styles={sidebarStyles}>
          <NodeLibrary />
        </Stack>
        <Stack.Item grow styles={canvasContainerStyles}>
          <div
            ref={canvasRef}
            className="anvil-blueprint-editor"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleCanvasClick}
          >
            {/* Render nodes */}
            {currentBlueprint?.nodes.map(node => renderNode(node))}
            
            {/* Render connections */}
            {currentBlueprint?.connections.map(connection => renderConnection(connection))}
            
            {/* Drag placeholder */}
            {isDraggingOver && (
              <div
                className="anvil-node"
                style={{
                  position: 'absolute',
                  left: `${dragPosition.x}px`,
                  top: `${dragPosition.y}px`,
                  opacity: 0.5,
                  width: '150px',
                  height: '100px',
                }}
              >
                <div className="anvil-node-header">
                  New Node
                </div>
              </div>
            )}
          </div>
        </Stack.Item>
      </Stack>
    </Stack>
  );
};
