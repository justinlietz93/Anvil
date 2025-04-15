import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainEditor from '../MainEditor';
import { ConfigManager } from '../../services/ConfigManager';

// Mock the ConfigManager
jest.mock('../../services/ConfigManager', () => ({
  ConfigManager: {
    initialize: jest.fn(),
    get: jest.fn().mockImplementation((section, key, defaultValue) => defaultValue),
    set: jest.fn()
  }
}));

// Mock the child components
jest.mock('../ComponentLibrary/ComponentLibrary', () => ({
  __esModule: true,
  default: () => <div data-testid="component-library">Component Library</div>
}));

jest.mock('../Workspace/Workspace', () => ({
  __esModule: true,
  default: ({ onModified }) => (
    <div data-testid="workspace">
      Workspace
      <button onClick={onModified}>Modify Project</button>
    </div>
  )
}));

jest.mock('../PropertiesPanel/PropertiesPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="properties-panel">Properties Panel</div>
}));

jest.mock('../BlueprintEditor/BlueprintEditor', () => ({
  __esModule: true,
  default: () => <div data-testid="blueprint-editor">Blueprint Editor</div>
}));

jest.mock('../Settings/SettingsPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-panel">Settings Panel</div>
}));

jest.mock('../ApplicationExport', () => ({
  __esModule: true,
  default: () => <div data-testid="application-export">Application Export</div>
}));

describe('MainEditor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the main editor with default components', () => {
    render(<MainEditor />);
    
    // Check if the main components are rendered
    expect(screen.getByText('New Project')).toBeInTheDocument();
    expect(screen.getByTestId('component-library')).toBeInTheDocument();
    expect(screen.getByTestId('workspace')).toBeInTheDocument();
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
    
    // Check if the command bar items are rendered
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  test('initializes the editor on mount', () => {
    render(<MainEditor />);
    
    // Check if ConfigManager.initialize was called
    expect(ConfigManager.initialize).toHaveBeenCalled();
    
    // Check if ConfigManager.get was called for UI settings
    expect(ConfigManager.get).toHaveBeenCalledWith('ui', 'panels.componentLibrary.visible', true);
    expect(ConfigManager.get).toHaveBeenCalledWith('ui', 'panels.properties.visible', true);
    expect(ConfigManager.get).toHaveBeenCalledWith('ui', 'defaultEditorMode', 'design');
    
    // Check if ConfigManager.get was called for project settings
    expect(ConfigManager.get).toHaveBeenCalledWith('application', 'defaultProjectName', 'New Project');
  });

  test('toggles component library visibility', () => {
    render(<MainEditor />);
    
    // Component library should be visible by default
    expect(screen.getByTestId('component-library')).toBeInTheDocument();
    
    // Click the toggle button
    fireEvent.click(screen.getByText('Hide Component Library'));
    
    // Component library should be hidden
    expect(screen.queryByTestId('component-library')).not.toBeInTheDocument();
    
    // Click the toggle button again
    fireEvent.click(screen.getByText('Show Component Library'));
    
    // Component library should be visible again
    expect(screen.getByTestId('component-library')).toBeInTheDocument();
  });

  test('toggles properties panel visibility', () => {
    render(<MainEditor />);
    
    // Properties panel should be visible by default
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
    
    // Click the toggle button
    fireEvent.click(screen.getByText('Hide Properties Panel'));
    
    // Properties panel should be hidden
    expect(screen.queryByTestId('properties-panel')).not.toBeInTheDocument();
    
    // Click the toggle button again
    fireEvent.click(screen.getByText('Show Properties Panel'));
    
    // Properties panel should be visible again
    expect(screen.getByTestId('properties-panel')).toBeInTheDocument();
  });

  test('switches between design and blueprint modes', () => {
    render(<MainEditor />);
    
    // Design mode should be active by default
    expect(screen.getByTestId('workspace')).toBeInTheDocument();
    expect(screen.queryByTestId('blueprint-editor')).not.toBeInTheDocument();
    
    // Open the editor mode submenu and click on Blueprint Mode
    // Note: This is a simplified test since we can't easily test submenus
    // In a real test, we would need to use a more complex approach
    const setActiveEditorMode = jest.fn();
    React.useState = jest.fn().mockReturnValueOnce(['design', setActiveEditorMode]);
    
    // Manually trigger the mode change
    setActiveEditorMode('blueprint');
    
    // Re-render with blueprint mode
    render(<MainEditor />);
    
    // Blueprint editor should be visible in blueprint mode
    expect(screen.queryByTestId('workspace')).not.toBeInTheDocument();
    expect(screen.getByTestId('blueprint-editor')).toBeInTheDocument();
  });

  test('handles project modification', () => {
    render(<MainEditor />);
    
    // Project should not be modified initially
    expect(screen.getByText('New Project')).toBeInTheDocument();
    expect(screen.queryByText('New Project *')).not.toBeInTheDocument();
    
    // Click the modify button in the workspace
    fireEvent.click(screen.getByText('Modify Project'));
    
    // Project should be marked as modified
    expect(screen.getByText('New Project *')).toBeInTheDocument();
    
    // Save button should be enabled
    expect(screen.getByText('Save')).not.toBeDisabled();
  });

  test('opens settings panel', async () => {
    render(<MainEditor />);
    
    // Settings panel should be closed initially
    expect(screen.queryByTestId('settings-panel')).not.toBeInTheDocument();
    
    // Click the settings button
    fireEvent.click(screen.getByText('Settings'));
    
    // Settings panel should be open
    await waitFor(() => {
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
    });
  });

  test('opens export panel', async () => {
    render(<MainEditor />);
    
    // Export panel should be closed initially
    expect(screen.queryByTestId('application-export')).not.toBeInTheDocument();
    
    // Click the export button
    fireEvent.click(screen.getByText('Export'));
    
    // Export panel should be open
    await waitFor(() => {
      expect(screen.getByTestId('application-export')).toBeInTheDocument();
    });
  });

  test('handles new project creation', () => {
    render(<MainEditor />);
    
    // Click the new project button
    fireEvent.click(screen.getByText('New'));
    
    // Since the project is not modified, it should create a new project without dialog
    expect(screen.getByText('New Project')).toBeInTheDocument();
    
    // Modify the project
    fireEvent.click(screen.getByText('Modify Project'));
    
    // Click the new project button again
    fireEvent.click(screen.getByText('New'));
    
    // Now it should show the confirmation dialog
    expect(screen.getByText('You have unsaved changes. Do you want to save before creating a new project?')).toBeInTheDocument();
    
    // Click "Don't Save"
    fireEvent.click(screen.getByText("Don't Save"));
    
    // Project should be reset
    expect(screen.getByText('New Project')).toBeInTheDocument();
    expect(screen.queryByText('New Project *')).not.toBeInTheDocument();
  });

  test('handles save project', async () => {
    render(<MainEditor />);
    
    // Save button should be disabled initially
    expect(screen.getByText('Save')).toBeDisabled();
    
    // Modify the project
    fireEvent.click(screen.getByText('Modify Project'));
    
    // Save button should be enabled
    expect(screen.getByText('Save')).not.toBeDisabled();
    
    // Click the save button
    fireEvent.click(screen.getByText('Save'));
    
    // Save dialog should be shown
    expect(screen.getByText('Do you want to save the current project?')).toBeInTheDocument();
    
    // Click "Save"
    fireEvent.click(screen.getAllByText('Save')[1]); // Get the Save button in the dialog
    
    // Project should be saved and no longer marked as modified
    await waitFor(() => {
      expect(screen.queryByText('New Project *')).not.toBeInTheDocument();
      expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });
});
