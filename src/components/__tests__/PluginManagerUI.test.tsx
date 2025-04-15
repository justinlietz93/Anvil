import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigManager } from '../../services/ConfigManager';
import { PluginManager } from '../../services/PluginManager';
import PluginManagerUI from '../Extensibility/PluginManagerUI';

// Mock ConfigManager
jest.mock('../../services/ConfigManager', () => ({
  ConfigManager: {
    initialize: jest.fn(),
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(undefined),
    getSync: jest.fn(),
    setSync: jest.fn(),
    getSecure: jest.fn(),
    setSecure: jest.fn(),
    deleteSecure: jest.fn()
  }
}));

// Mock PluginManager
jest.mock('../../services/PluginManager', () => ({
  PluginManager: {
    initialize: jest.fn(),
    registerPlugin: jest.fn(),
    unregisterPlugin: jest.fn(),
    enablePlugin: jest.fn(),
    disablePlugin: jest.fn(),
    getPlugin: jest.fn(),
    getAllPlugins: jest.fn(),
    getAvailablePermissions: jest.fn(),
    hasPermission: jest.fn(),
    addHook: jest.fn(),
    removeHook: jest.fn(),
    applyHook: jest.fn(),
    applyFilter: jest.fn()
  }
}));

describe('PluginManagerUI Component', () => {
  const mockPlugins = [
    {
      metadata: {
        id: 'plugin-1',
        name: 'Test Plugin 1',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        permissions: ['ui.read', 'data.read']
      },
      exports: {},
      isEnabled: true
    },
    {
      metadata: {
        id: 'plugin-2',
        name: 'Test Plugin 2',
        version: '2.0.0',
        description: 'Another test plugin',
        author: 'Another Author',
        permissions: ['ui.write', 'data.write']
      },
      exports: {},
      isEnabled: false
    }
  ];
  
  const mockPermissions = [
    {
      name: 'ui.read',
      description: 'Read UI components',
      dangerous: false
    },
    {
      name: 'ui.write',
      description: 'Write UI components',
      dangerous: false
    },
    {
      name: 'data.read',
      description: 'Read data',
      dangerous: false
    },
    {
      name: 'data.write',
      description: 'Write data',
      dangerous: true
    }
  ];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    PluginManager.getAllPlugins.mockReturnValue(mockPlugins);
    PluginManager.getAvailablePermissions.mockReturnValue(mockPermissions);
    PluginManager.registerPlugin.mockResolvedValue('new-plugin-id');
    PluginManager.unregisterPlugin.mockResolvedValue(true);
    PluginManager.enablePlugin.mockResolvedValue(true);
    PluginManager.disablePlugin.mockResolvedValue(true);
    PluginManager.getPlugin.mockImplementation((id) => {
      return mockPlugins.find(plugin => plugin.metadata.id === id);
    });
  });
  
  test('renders plugin manager with plugin list', async () => {
    render(<PluginManagerUI />);
    
    // Check if title is rendered
    expect(screen.getByText('Plugin Manager')).toBeInTheDocument();
    
    // Check if add plugin button is rendered
    expect(screen.getByText('Add Plugin')).toBeInTheDocument();
    
    // Check if plugins are rendered
    expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
    expect(screen.getByText('Test Plugin 2')).toBeInTheDocument();
    expect(screen.getByText('A test plugin')).toBeInTheDocument();
    expect(screen.getByText('Another test plugin')).toBeInTheDocument();
    
    // Check if plugin status is rendered
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    
    // Check if action buttons are rendered
    expect(screen.getAllByText('Details').length).toBe(2);
    expect(screen.getAllByText('Remove').length).toBe(2);
  });
  
  test('opens add plugin dialog when add plugin button is clicked', async () => {
    render(<PluginManagerUI />);
    
    // Click add plugin button
    fireEvent.click(screen.getByText('Add Plugin'));
    
    // Check if dialog is displayed
    expect(screen.getByText('Add Plugin')).toBeInTheDocument();
    expect(screen.getByText('Enter the details for the plugin')).toBeInTheDocument();
    
    // Check if form fields are rendered
    expect(screen.getByLabelText('Plugin Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Version')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Author')).toBeInTheDocument();
    expect(screen.getByLabelText('Plugin Code')).toBeInTheDocument();
    
    // Check if permission toggles are rendered
    expect(screen.getByText('Permissions:')).toBeInTheDocument();
    mockPermissions.forEach(permission => {
      expect(screen.getByText(permission.name)).toBeInTheDocument();
    });
    
    // Check if dangerous permission warning is displayed
    expect(screen.getByText('This permission can be dangerous')).toBeInTheDocument();
  });
  
  test('adds a plugin when form is submitted', async () => {
    render(<PluginManagerUI />);
    
    // Click add plugin button
    fireEvent.click(screen.getByText('Add Plugin'));
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText('Plugin Name'), { target: { value: 'New Plugin' } });
    fireEvent.change(screen.getByLabelText('Version'), { target: { value: '1.0.0' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'A new plugin' } });
    fireEvent.change(screen.getByLabelText('Author'), { target: { value: 'New Author' } });
    fireEvent.change(screen.getByLabelText('Plugin Code'), { target: { value: 'console.log("Hello World");' } });
    
    // Toggle some permissions
    const uiReadToggle = screen.getAllByRole('checkbox')[0];
    fireEvent.click(uiReadToggle);
    
    // Click add button
    fireEvent.click(screen.getByText('Add'));
    
    // Wait for plugin to be registered
    await waitFor(() => {
      expect(PluginManager.registerPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Plugin',
          version: '1.0.0',
          description: 'A new plugin',
          author: 'New Author',
          permissions: ['ui.read']
        }),
        'console.log("Hello World");'
      );
    });
    
    // Check if success message is displayed
    expect(screen.getByText('Plugin added successfully')).toBeInTheDocument();
  });
  
  test('opens remove plugin dialog when remove button is clicked', async () => {
    render(<PluginManagerUI />);
    
    // Click remove button for first plugin
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    // Check if dialog is displayed
    expect(screen.getByText('Remove Plugin')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to remove this plugin?')).toBeInTheDocument();
    
    // Check if confirm and cancel buttons are rendered
    expect(screen.getByText('Remove')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('removes a plugin when confirmed', async () => {
    render(<PluginManagerUI />);
    
    // Click remove button for first plugin
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    // Click confirm button
    fireEvent.click(screen.getByText('Remove'));
    
    // Wait for plugin to be unregistered
    await waitFor(() => {
      expect(PluginManager.unregisterPlugin).toHaveBeenCalledWith('plugin-1');
    });
    
    // Check if success message is displayed
    expect(screen.getByText('Plugin removed successfully')).toBeInTheDocument();
  });
  
  test('opens details dialog when details button is clicked', async () => {
    render(<PluginManagerUI />);
    
    // Click details button for first plugin
    const detailsButtons = screen.getAllByText('Details');
    fireEvent.click(detailsButtons[0]);
    
    // Check if dialog is displayed
    expect(screen.getByText('Plugin Details')).toBeInTheDocument();
    
    // Check if plugin details are rendered
    expect(screen.getByText('Test Plugin 1 v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Author: Test Author')).toBeInTheDocument();
    expect(screen.getByText('Description: A test plugin')).toBeInTheDocument();
    
    // Check if permissions are listed
    expect(screen.getByText('Permissions:')).toBeInTheDocument();
    expect(screen.getByText('ui.read')).toBeInTheDocument();
    expect(screen.getByText('data.read')).toBeInTheDocument();
    
    // Check if enabled toggle is rendered and checked
    const enabledToggle = screen.getByLabelText('Enabled');
    expect(enabledToggle).toBeChecked();
  });
  
  test('toggles plugin enabled state', async () => {
    render(<PluginManagerUI />);
    
    // Click details button for first plugin
    const detailsButtons = screen.getAllByText('Details');
    fireEvent.click(detailsButtons[0]);
    
    // Toggle enabled state
    const enabledToggle = screen.getByLabelText('Enabled');
    fireEvent.click(enabledToggle);
    
    // Wait for plugin to be disabled
    await waitFor(() => {
      expect(PluginManager.disablePlugin).toHaveBeenCalledWith('plugin-1');
    });
    
    // Check if success message is displayed
    expect(screen.getByText('Plugin disabled successfully')).toBeInTheDocument();
    
    // Toggle enabled state again
    fireEvent.click(enabledToggle);
    
    // Wait for plugin to be enabled
    await waitFor(() => {
      expect(PluginManager.enablePlugin).toHaveBeenCalledWith('plugin-1');
    });
    
    // Check if success message is displayed
    expect(screen.getByText('Plugin enabled successfully')).toBeInTheDocument();
  });
  
  test('handles error when adding plugin fails', async () => {
    // Setup error for adding plugin
    PluginManager.registerPlugin.mockRejectedValue(new Error('Failed to add plugin'));
    
    render(<PluginManagerUI />);
    
    // Click add plugin button
    fireEvent.click(screen.getByText('Add Plugin'));
    
    // Fill in form fields
    fireEvent.change(screen.getByLabelText('Plugin Name'), { target: { value: 'New Plugin' } });
    fireEvent.change(screen.getByLabelText('Version'), { target: { value: '1.0.0' } });
    fireEvent.change(screen.getByLabelText('Author'), { target: { value: 'New Author' } });
    fireEvent.change(screen.getByLabelText('Plugin Code'), { target: { value: 'console.log("Hello World");' } });
    
    // Click add button
    fireEvent.click(screen.getByText('Add'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error adding plugin: Failed to add plugin')).toBeInTheDocument();
    });
  });
  
  test('handles error when removing plugin fails', async () => {
    // Setup error for removing plugin
    PluginManager.unregisterPlugin.mockRejectedValue(new Error('Failed to remove plugin'));
    
    render(<PluginManagerUI />);
    
    // Click remove button for first plugin
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    // Click confirm button
    fireEvent.click(screen.getByText('Remove'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error removing plugin: Failed to remove plugin')).toBeInTheDocument();
    });
  });
  
  test('handles error when toggling plugin fails', async () => {
    // Setup error for disabling plugin
    PluginManager.disablePlugin.mockRejectedValue(new Error('Failed to disable plugin'));
    
    render(<PluginManagerUI />);
    
    // Click details button for first plugin
    const detailsButtons = screen.getAllByText('Details');
    fireEvent.click(detailsButtons[0]);
    
    // Toggle enabled state
    const enabledToggle = screen.getByLabelText('Enabled');
    fireEvent.click(enabledToggle);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error disabling plugin: Failed to disable plugin')).toBeInTheDocument();
    });
  });
  
  test('disables add button when required fields are empty', async () => {
    render(<PluginManagerUI />);
    
    // Click add plugin button
    fireEvent.click(screen.getByText('Add Plugin'));
    
    // Check if add button is disabled
    const addButton = screen.getByText('Add');
    expect(addButton).toBeDisabled();
    
    // Fill in some but not all required fields
    fireEvent.change(screen.getByLabelText('Plugin Name'), { target: { value: 'New Plugin' } });
    expect(addButton).toBeDisabled();
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Version'), { target: { value: '1.0.0' } });
    fireEvent.change(screen.getByLabelText('Author'), { target: { value: 'New Author' } });
    fireEvent.change(screen.getByLabelText('Plugin Code'), { target: { value: 'console.log("Hello World");' } });
    
    // Check if add button is enabled
    expect(addButton).not.toBeDisabled();
  });
});
