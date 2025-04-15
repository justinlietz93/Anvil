import React from 'react';
import { 
  Stack, 
  IStackStyles, 
  IStackTokens,
  Text,
  SearchBox
} from '@fluentui/react';
import { NodeDefinition, BlueprintRegistry } from '../../services/BlueprintRegistry';
import { NodeCard } from './NodeCard';

// Styles
const stackStyles: IStackStyles = {
  root: {
    padding: 10,
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#333333',
    color: 'white'
  },
};

const headerStyles: IStackStyles = {
  root: {
    padding: '10px 0',
  },
};

const nodesContainerStyles: IStackStyles = {
  root: {
    marginTop: 10,
  },
};

// Tokens
const stackTokens: IStackTokens = {
  childrenGap: 10,
};

/**
 * Node Library component for displaying available node types
 * 
 * @author Justin Lietz
 */
export const NodeLibrary: React.FC = () => {
  // State
  const [searchText, setSearchText] = React.useState('');
  const [nodes, setNodes] = React.useState<NodeDefinition[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  // Load nodes on mount
  React.useEffect(() => {
    const allNodes = BlueprintRegistry.getAllNodes();
    setNodes(allNodes);
    setCategories(BlueprintRegistry.getAllCategories());
  }, []);

  // Filter nodes by search text
  const filteredNodes = React.useMemo(() => {
    if (!searchText) return nodes;
    return nodes.filter(node => 
      node.name.toLowerCase().includes(searchText.toLowerCase()) || 
      node.description.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [nodes, searchText]);

  // Group nodes by category
  const nodesByCategory = React.useMemo(() => {
    const grouped: Record<string, NodeDefinition[]> = {};
    
    categories.forEach(category => {
      const nodesInCategory = filteredNodes.filter(node => node.category === category);
      if (nodesInCategory.length > 0) {
        grouped[category] = nodesInCategory;
      }
    });
    
    return grouped;
  }, [filteredNodes, categories]);

  // Handle search change
  const handleSearchChange = (event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
    setSearchText(newValue || '');
  };

  // Handle node drag start
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, node: NodeDefinition) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'node',
      nodeId: node.id
    }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Stack styles={stackStyles} tokens={stackTokens}>
      <Stack styles={headerStyles}>
        <Text variant="large" styles={{ root: { color: 'white' } }}>Nodes</Text>
        <SearchBox 
          placeholder="Search nodes" 
          onChange={handleSearchChange}
          value={searchText}
          styles={{ root: { backgroundColor: '#252526', color: 'white' } }}
        />
      </Stack>
      
      <Stack styles={nodesContainerStyles} tokens={stackTokens}>
        {Object.entries(nodesByCategory).map(([category, categoryNodes]) => (
          <Stack key={category} tokens={stackTokens}>
            <Text variant="mediumPlus" styles={{ root: { fontWeight: 600, color: 'white' } }}>{category}</Text>
            <Stack horizontal wrap tokens={stackTokens}>
              {categoryNodes.map(node => (
                <NodeCard 
                  key={node.id} 
                  node={node} 
                  onDragStart={(e) => handleDragStart(e, node)} 
                />
              ))}
            </Stack>
          </Stack>
        ))}
        
        {filteredNodes.length === 0 && (
          <Text styles={{ root: { color: 'white' } }}>No nodes found</Text>
        )}
      </Stack>
    </Stack>
  );
};
