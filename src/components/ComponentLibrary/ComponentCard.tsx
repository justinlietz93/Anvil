import React from 'react';
import { 
  DocumentCard,
  DocumentCardTitle,
  DocumentCardDetails,
  IDocumentCardStyles,
  Icon
} from '@fluentui/react';
import { ComponentDefinition } from '../../services/ComponentRegistry';

// Props interface
interface ComponentCardProps {
  component: ComponentDefinition;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
}

// Styles
const cardStyles: IDocumentCardStyles = {
  root: {
    width: 130,
    minHeight: 90,
    margin: '5px',
    cursor: 'grab',
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s ease',
    position: 'relative',
    ':hover': {
      border: '1px solid #0078d4',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    },
    ':active': {
      cursor: 'grabbing',
    }
  }
};

/**
 * Component Card for displaying a component in the Component Library
 * 
 * @author Justin Lietz
 */
export const ComponentCard: React.FC<ComponentCardProps> = ({ component, onDragStart }) => {
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
          <Icon iconName={component.icon || 'WebComponents'} style={{ fontSize: '24px' }} />
        </div>
        <DocumentCardTitle 
          title={component.name} 
          shouldTruncate 
          showAsSecondaryTitle
          styles={{
            root: { textAlign: 'center', color: '#fff' },
          }}
        />
      </DocumentCardDetails>
      <div 
        style={{ 
          position: 'absolute',
          top: '2px',
          right: '2px',
          fontSize: '10px',
          padding: '0px 4px',
          backgroundColor: 'rgba(0,120,212,0.2)',
          borderRadius: '2px',
          color: '#0078d4'
        }}
      >
        Drag
      </div>
    </DocumentCard>
  );
};
