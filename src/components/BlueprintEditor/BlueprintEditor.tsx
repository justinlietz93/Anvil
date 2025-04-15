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
  const connectionLayerRef = useRef<SVGSVGElement>(null);
  
  // State
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [activeBlueprint, setActiveBlueprint] = useState<string | null>(null);
  const [isDraggingConnection, setIsDraggingConnection] = useState(false);
  const [connectionStartPort, setConnectionStartPort] = useState<any>(null);
  const [connectionEndPosition, setConnectionEndPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [nodeDomElements, setNodeDomElements] = useState<Map<string, HTMLElement>>(new Map());
  
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

  // Track node DOM elements for connection calculation
  useEffect(() => {
    if (!canvasRef.current || !currentBlueprint) return;
    
    const newNodeElements = new Map<string, HTMLElement>();
    
    // Find all node elements in the DOM
    currentBlueprint.nodes.forEach(node => {
      const element = canvasRef.current?.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
      if (element) {
        newNodeElements.set(node.id, element);
      }
    });
    
    setNodeDomElements(newNodeElements);
  }, [currentBlueprint?.nodes]);
  
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

  // Handle port mouse down (start connection)
  const handlePortMouseDown = (event: React.MouseEvent<HTMLDivElement>, nodeId: string, portId: string, isInput: boolean) => {
    // Don't start connection from input ports
    if (isInput) return;
    
    event.stopPropagation();
    setIsDraggingConnection(true);
    
    const node = currentBlueprint?.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Get port position relative to canvas
    const portElement = event.currentTarget;
    const portRect = portElement.getBoundingClientRect();
    const canvasRect = canvasRef.current!.getBoundingClientRect();
    
    const portPosition = {
      x: (portRect.left + portRect.width / 2) - canvasRect.left,
      y: (portRect.top + portRect.height / 2) - canvasRect.top
    };
    
    setConnectionStartPort({
      nodeId,
      portId,
      position: portPosition
    });
    setConnectionEndPosition(portPosition);
    
    // Add event listeners
    document.addEventListener('mousemove', handleConnectionDrag);
    document.addEventListener('mouseup', handleConnectionDrop);
  };
  
  // Handle connection dragging
  const handleConnectionDrag = (event: MouseEvent) => {
    if (!isDraggingConnection || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    
    setConnectionEndPosition({ x, y });
  };
  
  // Handle connection drop
  const handleConnectionDrop = (event: MouseEvent) => {
    document.removeEventListener('mousemove', handleConnectionDrag);
    document.removeEventListener('mouseup', handleConnectionDrop);
    
    if (!isDraggingConnection || !connectionStartPort || !canvasRef.current || !currentBlueprint) {
      setIsDraggingConnection(false);
      return;
    }
    
    // Check if dropped on an input port
    const portElement = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;
    const isInputPort = portElement?.classList.contains('anvil-node-port-input');
    
    if (isInputPort) {
      const targetNodeId = portElement.getAttribute('data-node-id');
      const targetPortId = portElement.getAttribute('data-port-id');
      
      if (targetNodeId && targetPortId) {
        // Ensure we don't connect to same node
        if (targetNodeId !== connectionStartPort.nodeId) {
          // Create new connection
          const newConnection = {
            id: `conn-${Date.now()}`,
            sourceNodeId: connectionStartPort.nodeId,
            sourcePortId: connectionStartPort.portId,
            targetNodeId,
            targetPortId
          };
          
          // Update blueprint
          const updatedBlueprint = {
            ...currentBlueprint,
            connections: [...currentBlueprint.connections, newConnection]
          };
          
          // Update project
          if (project) {
            const updatedBlueprints = project.blueprints.map(bp => 
              bp.id === currentBlueprint.id ? updatedBlueprint : bp
            );
            
            updateProject({ blueprints: updatedBlueprints });
          }
        }
      }
    }
    
    setIsDraggingConnection(false);
  };
  
  // Calculate bezier path for connection
  const calculateConnectionPath = (connection: any) => {
    if (!currentBlueprint) return '';
    
    const sourceNode = currentBlueprint.nodes.find(n => n.id === connection.sourceNodeId);
    const targetNode = currentBlueprint.nodes.find(n => n.id === connection.targetNodeId);
    
    if (!sourceNode || !targetNode) return '';
    
    const sourceElement = nodeDomElements.get(sourceNode.id);
    const targetElement = nodeDomElements.get(targetNode.id);
    
    if (!sourceElement || !targetElement) return '';
    
    const sourcePortElement = sourceElement.querySelector(`[data-port-id="${connection.sourcePortId}"]`) as HTMLElement;
    const targetPortElement = targetElement.querySelector(`[data-port-id="${connection.targetPortId}"]`) as HTMLElement;
    
    if (!sourcePortElement || !targetPortElement) return '';
    
    const sourceRect = sourcePortElement.getBoundingClientRect();
    const targetRect = targetPortElement.getBoundingClientRect();
    const canvasRect = canvasRef.current!.getBoundingClientRect();
    
    const sourceX = (sourceRect.left + sourceRect.width / 2) - canvasRect.left;
    const sourceY = (sourceRect.top + sourceRect.height / 2) - canvasRect.top;
    const targetX = (targetRect.left + targetRect.width / 2) - canvasRect.left;
    const targetY = (targetRect.top + targetRect.height / 2) - canvasRect.top;
    
    // Create a bezier curve
    const controlPointOffset = Math.abs(targetX - sourceX) * 0.5;
    
    return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${targetX - controlPointOffset} ${targetY}, ${targetX} ${targetY}`;
  };
  
  // Handle canvas zoom
  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    const newScale = Math.min(Math.max(scale + delta, 0.1), 2); // Limit scale between 0.1 and 2
    
    // Calculate zoom around mouse position
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    const newPan = {
      x: pan.x - ((mouseX / scale) - (mouseX / newScale)) * newScale,
      y: pan.y - ((mouseY / scale) - (mouseY / newScale)) * newScale
    };
    
    setScale(newScale);
    setPan(newPan);
  };
  
  // Render node
  const renderNode = (node: any) => {
    const isSelected = selectedNodeIds.includes(node.id);
    
    return (
      <div
        key={node.id}
        data-node-id={node.id}
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
          <div className="anvil-node-input-ports">
            {Object.entries(node.inputs).map(([portId, value]: [string, any]) => (
              <div 
                key={`input-${portId}`} 
                className="anvil-node-port anvil-node-port-input"
                data-node-id={node.id}
                data-port-id={portId}
              >
                <div className="anvil-node-port-dot"></div>
                <span>{portId}</span>
              </div>
            ))}
          </div>
          
          {/* Output ports */}
          <div className="anvil-node-output-ports">
            {Object.entries(node.outputs).map(([portId, value]: [string, any]) => (
              <div 
                key={`output-${portId}`} 
                className="anvil-node-port anvil-node-port-output"
                data-node-id={node.id}
                data-port-id={portId}
                onMouseDown={(e) => handlePortMouseDown(e, node.id, portId, false)}
              >
                <span>{portId}</span>
                <div className="anvil-node-port-dot"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render connection
  const renderConnection = (connection: any) => {
    const path = calculateConnectionPath(connection);
    
    if (!path) return null;
    
    return (
      <path
        key={connection.id}
        d={path}
        stroke="#FFFFFF"
        strokeWidth="2"
        fill="none"
        className="anvil-connection"
      />
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
            onWheel={handleWheel}
            style={{
              transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: '0 0',
            }}
          >
            {/* Connection SVG Layer */}
            <svg 
              ref={connectionLayerRef} 
              className="anvil-connection-layer"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              {/* Render existing connections */}
              {currentBlueprint?.connections.map(connection => renderConnection(connection))}
              
              {/* Render connection being dragged */}
              {isDraggingConnection && connectionStartPort && (
                <path
                  d={`M ${connectionStartPort.position.x} ${connectionStartPort.position.y} C ${connectionStartPort.position.x + 100} ${connectionStartPort.position.y}, ${connectionEndPosition.x - 100} ${connectionEndPosition.y}, ${connectionEndPosition.x} ${connectionEndPosition.y}`}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  fill="none"
                  className="anvil-connection-preview"
                />
              )}
            </svg>
            
            {/* Node Layer */}
            <div className="anvil-node-layer" style={{ position: 'relative', zIndex: 2 }}>
              {currentBlueprint?.nodes.map(node => renderNode(node))}
            </div>
            
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
                  height: 'auto',
                  zIndex: 3
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
