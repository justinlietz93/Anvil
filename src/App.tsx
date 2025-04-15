import React, { useEffect } from 'react';
import { initializeIcons } from '@fluentui/react';
import MainEditor from './components/MainEditor';
import { UIProvider } from './contexts/UIContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { EditorProvider } from './contexts/EditorContext';
import { registerBuiltInNodes } from './nodes/NodeRegistration';

// Initialize Fluent UI icons
initializeIcons();

/**
 * Root Application Component
 * 
 * @returns The Anvil application component
 */
const App: React.FC = () => {
  // Register all nodes during application initialization
  useEffect(() => {
    // Register both built-in nodes and API nodes
    registerBuiltInNodes();
  }, []);

  return (
    <UIProvider>
      <ProjectProvider>
        <EditorProvider>
          <MainEditor />
        </EditorProvider>
      </ProjectProvider>
    </UIProvider>
  );
};

export default App;
