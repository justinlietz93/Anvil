import React from 'react';
import { 
  DocumentCard,
  DocumentCardTitle,
  DocumentCardDetails,
  IDocumentCardStyles
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
    width: 136,
    height: 100,
    margin: '0 4px 4px 0',
    cursor: 'grab',
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
          {/* This would be replaced with an actual icon from Fluent UI */}
          <i className={`ms-Icon ms-Icon--${component.icon}`} aria-hidden="true"></i>
        </div>
        <DocumentCardTitle 
          title={component.name} 
          shouldTruncate 
          showAsSecondaryTitle
        />
      </DocumentCardDetails>
    </DocumentCard>
  );
};
