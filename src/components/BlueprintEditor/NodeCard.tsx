import React from 'react';
import { mergeStyles } from '@fluentui/react';

// Dark theme colors matching the BlueprintEditor
const colors = {
  background: '#121212',
  surface: '#1e1e1e',
  border: '#333333',
  accent: '#6200EE',
  accentLight: '#BB86FC',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  nodeBg: '#252525',
  nodeHeaderBg: '#333333',
  nodeSelected: '#4B4BFF',
  portDot: '#BB86FC',
  connection: '#BB86FC',
};

// CSS Classes
const nodeCardClass = mergeStyles({
  padding: '12px',
  backgroundColor: colors.nodeBg,
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  border: `1px solid ${colors.border}`,
  color: colors.text,
  margin: '8px 0',
  cursor: 'grab',
  transition: 'all 0.2s ease-out',
  userSelect: 'none',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    backgroundColor: `${colors.nodeBg}`,
    transform: 'translateY(-2px)'
  }
});

const nodeCardHeaderClass = mergeStyles({
  fontWeight: 600,
  fontSize: '14px',
  marginBottom: '4px',
  color: colors.accentLight,
});

const nodeCardDescriptionClass = mergeStyles({
  fontSize: '12px',
  color: colors.textSecondary,
});

const nodeCardTagsClass = mergeStyles({
  display: 'flex',
  flexWrap: 'wrap',
  marginTop: '8px',
  gap: '4px',
});

const nodeCardTagClass = mergeStyles({
  fontSize: '10px',
  padding: '2px 6px',
  backgroundColor: 'rgba(187, 134, 252, 0.1)',
  borderRadius: '4px',
  color: colors.accentLight,
});

interface NodeCardProps {
  nodeType: {
    id: string;
    name: string;
    description: string;
    category: string;
    tags?: string[];
    inputs?: Record<string, any>;
    outputs?: Record<string, any>;
  };
  onDragStart: (nodeId: string) => void;
}

/**
 * NodeCard component renders draggable node cards in the node library
 * 
 * @param props Component props
 * @returns React component
 */
export const NodeCard: React.FC<NodeCardProps> = ({ nodeType, onDragStart }) => {
  // Handle drag start event
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    // Set drag data
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'node',
      nodeId: nodeType.id
    }));
    
    // Set drag effect
    event.dataTransfer.effectAllowed = 'copy';
    
    // Notify parent
    onDragStart(nodeType.id);
  };
  
  // Calculate input and output count badges
  const inputCount = nodeType.inputs ? Object.keys(nodeType.inputs).length : 0;
  const outputCount = nodeType.outputs ? Object.keys(nodeType.outputs).length : 0;
  
  return (
    <div
      className={nodeCardClass}
      draggable
      onDragStart={handleDragStart}
      data-node-type={nodeType.id}
    >
      <div className={nodeCardHeaderClass}>
        {nodeType.name}
      </div>
      <div className={nodeCardDescriptionClass}>
        {nodeType.description}
      </div>
      <div className={nodeCardTagsClass}>
        <div className={nodeCardTagClass}>
          {nodeType.category}
        </div>
        {inputCount > 0 && (
          <div className={nodeCardTagClass}>
            Inputs: {inputCount}
          </div>
        )}
        {outputCount > 0 && (
          <div className={nodeCardTagClass}>
            Outputs: {outputCount}
          </div>
        )}
        {nodeType.tags?.map((tag) => (
          <div key={tag} className={nodeCardTagClass}>
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};
