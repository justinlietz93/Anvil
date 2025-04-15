import React, { useState } from 'react';
import { 
  Stack, 
  IStackStyles, 
  IStackTokens,
  Pivot,
  PivotItem,
  CommandBar,
  ICommandBarItemProps
} from '@fluentui/react';
import { Workspace } from './components/Workspace/Workspace';
import { ComponentLibrary } from './components/ComponentLibrary/ComponentLibrary';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import { BlueprintEditor } from './components/BlueprintEditor/BlueprintEditor';
import { ProjectContext } from './contexts/ProjectContext';
import { UIContext } from './contexts/UIContext';
import { EditorContext } from './contexts/EditorContext';
import { createNewProject } from './services/ProjectService';

// Styles
const stackStyles: IStackStyles = {
  root: {
    height: '100%',
    width: '100%',
  },
};

const contentStackStyles: IStackStyles = {
  root: {
    height: 'calc(100% - 44px)', // Subtract CommandBar height
  },
};

const sidebarStyles: IStackStyles = {
  root: {
    width: 300,
    borderRight: '1px solid #edebe9',
  },
};

// Tokens
const stackTokens: IStackTokens = {
  childrenGap: 0,
};

/**
 * Main App component for the Anvil platform
 * 
 * @author Justin Lietz
 */
const App: React.FC = () => {
  // State
  const [project, setProject] = useState(createNewProject('New Project', 'A new Anvil project'));
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [activePanel, setActivePanel] = useState<string>('design');
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [clipboard, setClipboard] = useState<any>(null);

  // Command bar items
  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'newProject',
      text: 'New Project',
      iconProps: { iconName: 'Add' },
      onClick: () => {
        setProject(createNewProject('New Project', 'A new Anvil project'));
      },
    },
    {
      key: 'openProject',
      text: 'Open Project',
      iconProps: { iconName: 'OpenFile' },
      onClick: () => {
        // This will be implemented with file dialog integration
        console.log('Open project');
      },
    },
    {
      key: 'saveProject',
      text: 'Save Project',
      iconProps: { iconName: 'Save' },
      onClick: () => {
        // This will be implemented with file dialog integration
        console.log('Save project');
      },
    },
    {
      key: 'exportApplication',
      text: 'Export Application',
      iconProps: { iconName: 'Package' },
      onClick: () => {
        // This will be implemented in the Application Generation phase
        console.log('Export application');
      },
    },
  ];

  // Command bar far items
  const commandBarFarItems: ICommandBarItemProps[] = [
    {
      key: 'undo',
      text: 'Undo',
      iconProps: { iconName: 'Undo' },
      disabled: undoStack.length === 0,
      onClick: () => {
        // Undo implementation
        console.log('Undo');
      },
    },
    {
      key: 'redo',
      text: 'Redo',
      iconProps: { iconName: 'Redo' },
      disabled: redoStack.length === 0,
      onClick: () => {
        // Redo implementation
        console.log('Redo');
      },
    },
  ];

  // Project context value
  const projectContextValue = {
    project,
    setProject,
    updateProject: (updates: Partial<typeof project>) => {
      setProject(prev => ({ ...prev, ...updates }));
    },
  };

  // UI context value
  const uiContextValue = {
    selectedComponentIds,
    activePanel,
    setSelectedComponentIds,
    setActivePanel,
  };

  // Editor context value
  const editorContextValue = {
    undoStack,
    redoStack,
    clipboard,
    undo: () => {
      // Undo implementation
      console.log('Undo');
    },
    redo: () => {
      // Redo implementation
      console.log('Redo');
    },
    copy: () => {
      // Copy implementation
      console.log('Copy');
    },
    paste: () => {
      // Paste implementation
      console.log('Paste');
    },
    cut: () => {
      // Cut implementation
      console.log('Cut');
    },
  };

  return (
    <ProjectContext.Provider value={projectContextValue}>
      <UIContext.Provider value={uiContextValue}>
        <EditorContext.Provider value={editorContextValue}>
          <Stack styles={stackStyles} tokens={stackTokens}>
            <CommandBar
              items={commandBarItems}
              farItems={commandBarFarItems}
            />
            <Stack horizontal styles={contentStackStyles} tokens={stackTokens}>
              <Stack styles={sidebarStyles}>
                <Pivot>
                  <PivotItem headerText="Components">
                    <ComponentLibrary />
                  </PivotItem>
                  <PivotItem headerText="Properties">
                    <PropertiesPanel />
                  </PivotItem>
                </Pivot>
              </Stack>
              <Stack.Item grow>
                <Pivot
                  selectedKey={activePanel}
                  onLinkClick={(item) => {
                    if (item?.props.itemKey) {
                      setActivePanel(item.props.itemKey);
                    }
                  }}
                >
                  <PivotItem headerText="Design" itemKey="design">
                    <Workspace />
                  </PivotItem>
                  <PivotItem headerText="Blueprint" itemKey="blueprint">
                    <BlueprintEditor />
                  </PivotItem>
                </Pivot>
              </Stack.Item>
            </Stack>
          </Stack>
        </EditorContext.Provider>
      </UIContext.Provider>
    </ProjectContext.Provider>
  );
};

export default App;
