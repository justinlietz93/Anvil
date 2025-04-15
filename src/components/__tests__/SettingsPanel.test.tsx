import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConfigManager } from '../../services/ConfigManager';
import SettingsPanel from '../Settings/SettingsPanel';

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

describe('SettingsPanel Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    ConfigManager.get.mockImplementation((section, key, defaultValue) => {
      // Return default values for testing
      return Promise.resolve(defaultValue);
    });
  });
  
  test('renders settings panel with default values', async () => {
    render(<SettingsPanel />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Check if title is rendered
    expect(screen.getByText('Settings')).toBeInTheDocument();
    
    // Check if sections are rendered
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Blueprint Settings')).toBeInTheDocument();
    expect(screen.getByText('Plugin Settings')).toBeInTheDocument();
    
    // Check if form elements are rendered with default values
    expect(screen.getByLabelText('Application Name')).toHaveValue('My Anvil App');
    expect(screen.getByLabelText('Auto Save')).not.toBeChecked();
    expect(screen.getByLabelText('Debug Mode')).not.toBeChecked();
  });
  
  test('loads settings from ConfigManager', async () => {
    // Setup specific mock values for this test
    ConfigManager.get.mockImplementation((section, key, defaultValue) => {
      if (section === 'application' && key === 'name') {
        return Promise.resolve('Test App');
      }
      if (section === 'application' && key === 'autoSave') {
        return Promise.resolve(true);
      }
      if (section === 'blueprint' && key === 'debugMode') {
        return Promise.resolve(true);
      }
      return Promise.resolve(defaultValue);
    });
    
    render(<SettingsPanel />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Check if form elements are rendered with loaded values
    expect(screen.getByLabelText('Application Name')).toHaveValue('Test App');
    expect(screen.getByLabelText('Auto Save')).toBeChecked();
    expect(screen.getByLabelText('Debug Mode')).toBeChecked();
  });
  
  test('saves settings to ConfigManager when save button is clicked', async () => {
    render(<SettingsPanel />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Change some settings
    fireEvent.change(screen.getByLabelText('Application Name'), { target: { value: 'New App Name' } });
    fireEvent.click(screen.getByLabelText('Auto Save'));
    fireEvent.click(screen.getByLabelText('Debug Mode'));
    
    // Click save button
    fireEvent.click(screen.getByText('Save'));
    
    // Wait for settings to be saved
    await waitFor(() => {
      expect(ConfigManager.set).toHaveBeenCalledWith('application', 'name', 'New App Name');
      expect(ConfigManager.set).toHaveBeenCalledWith('application', 'autoSave', true);
      expect(ConfigManager.set).toHaveBeenCalledWith('blueprint', 'debugMode', true);
    });
    
    // Check if success message is displayed
    expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
  });
  
  test('resets settings to defaults when reset button is clicked', async () => {
    render(<SettingsPanel />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Change some settings
    fireEvent.change(screen.getByLabelText('Application Name'), { target: { value: 'New App Name' } });
    
    // Click reset button
    fireEvent.click(screen.getByText('Reset to Defaults'));
    
    // Wait for settings to be reset
    await waitFor(() => {
      expect(ConfigManager.set).toHaveBeenCalledWith('application', 'name', 'My Anvil App');
      expect(ConfigManager.set).toHaveBeenCalledWith('application', 'autoSave', true);
      expect(ConfigManager.set).toHaveBeenCalledWith('blueprint', 'debugMode', false);
    });
    
    // Check if success message is displayed
    expect(screen.getByText('Settings reset to defaults')).toBeInTheDocument();
    
    // Check if form elements are reset to default values
    expect(screen.getByLabelText('Application Name')).toHaveValue('My Anvil App');
  });
  
  test('shows error message when settings fail to load', async () => {
    // Setup error for loading settings
    ConfigManager.get.mockRejectedValue(new Error('Failed to load settings'));
    
    render(<SettingsPanel />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load settings: Failed to load settings')).toBeInTheDocument();
    });
  });
  
  test('shows error message when settings fail to save', async () => {
    // Setup error for saving settings
    ConfigManager.set.mockRejectedValue(new Error('Failed to save settings'));
    
    render(<SettingsPanel />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Click save button
    fireEvent.click(screen.getByText('Save'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to save settings: Failed to save settings')).toBeInTheDocument();
    });
  });
  
  test('conditionally renders auto save interval field', async () => {
    render(<SettingsPanel />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Auto save is off by default, so interval field should not be visible
    expect(screen.queryByLabelText('Auto Save Interval (minutes)')).not.toBeInTheDocument();
    
    // Turn on auto save
    fireEvent.click(screen.getByLabelText('Auto Save'));
    
    // Interval field should now be visible
    expect(screen.getByLabelText('Auto Save Interval (minutes)')).toBeInTheDocument();
    
    // Turn off auto save
    fireEvent.click(screen.getByLabelText('Auto Save'));
    
    // Interval field should be hidden again
    expect(screen.queryByLabelText('Auto Save Interval (minutes)')).not.toBeInTheDocument();
  });
  
  test('shows warning when dangerous permissions are enabled', async () => {
    render(<SettingsPanel />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Warning should not be visible initially
    expect(screen.queryByText(/Enabling dangerous permissions can pose security risks/)).not.toBeInTheDocument();
    
    // Enable dangerous permissions
    fireEvent.click(screen.getByLabelText('Allow Dangerous Permissions'));
    
    // Warning should now be visible
    expect(screen.getByText(/Enabling dangerous permissions can pose security risks/)).toBeInTheDocument();
    
    // Disable dangerous permissions
    fireEvent.click(screen.getByLabelText('Allow Dangerous Permissions'));
    
    // Warning should be hidden again
    expect(screen.queryByText(/Enabling dangerous permissions can pose security risks/)).not.toBeInTheDocument();
  });
});
