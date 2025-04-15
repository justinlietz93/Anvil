import React from 'react';
import { 
  DocumentCard,
  DocumentCardTitle,
  DocumentCardDetails,
  IDocumentCardStyles
} from '@fluentui/react';
import { NodeDefinition } from '../../services/BlueprintRegistry';

// Props interface
interface NodeCardProps {
  node: NodeDefinition;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
}

// Styles
const cardStyles: IDocumentCardStyles = {
  root: {
    width: 136,
    height: 100,
    margin: '0 4px 4px 0',
    cursor: 'grab',
    backgroundColor: '#252526',
    borderColor: '#0078d4'
  }
};

/**
 * Node Card for displaying a node in the Node Library
 * 
 * @author Justin Lietz
 */
export const NodeCard: React.FC<NodeCardProps> = ({ node, onDragStart }) => {
  return (
    <DocumentCard
      styles={cardStyles}
      draggable
      onDragStart={onDragStart}
    >
      <DocumentCardDetails>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50px',
          fontSize: '24px',
          color: '#0078d4'
        }}>
          {/* This would be replaced with an actual icon from Fluent UI */}
          <i className={`ms-Icon ms-Icon--Code`} aria-hidden="true"></i>
        </div>
        <DocumentCardTitle 
          title={node.name} 
          shouldTruncate 
          showAsSecondaryTitle
          styles={{ root: { color: 'white' } }}
        />
      </DocumentCardDetails>
    </DocumentCard>
  );
};
