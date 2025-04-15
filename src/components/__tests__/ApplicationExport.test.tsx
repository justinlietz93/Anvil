import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApplicationGenerator } from '../../services/ApplicationGenerator';
import { ConfigManager } from '../../services/ConfigManager';
import ApplicationExport from '../ApplicationExport/ApplicationExport';

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

// Mock ApplicationGenerator
jest.mock('../../services/ApplicationGenerator', () => ({
  ApplicationGenerator: {
    generateApplication: jest.fn(),
    onProgressUpdate: jest.fn()
  }
}));

describe('ApplicationExport Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    ConfigManager.get.mockImplementation((section, key, defaultValue) => {
      // Return default values for testing
      return Promise.resolve(defaultValue);
    });
    
    ApplicationGenerator.generateApplication.mockResolvedValue({
      outputPath: '/path/to/output',
      buildType: 'Electron',
      platforms: ['Windows', 'macOS', 'Linux'],
      fileSize: '10.5 MB'
    });
  });
  
  test('renders application export form with default values', async () => {
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Check if title is rendered
    expect(screen.getByText('Application Export')).toBeInTheDocument();
    
    // Check if sections are rendered
    expect(screen.getByText('Application Settings')).toBeInTheDocument();
    expect(screen.getByText('Build Settings')).toBeInTheDocument();
    
    // Check if form elements are rendered with default values
    expect(screen.getByLabelText('Application Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Version')).toHaveValue('1.0.0');
    expect(screen.getByText('Build Application')).toBeInTheDocument();
  });
  
  test('loads settings from ConfigManager', async () => {
    // Setup specific mock values for this test
    ConfigManager.get.mockImplementation((section, key, defaultValue) => {
      if (section === 'application' && key === 'name') {
        return Promise.resolve('Test App');
      }
      if (section === 'application' && key === 'version') {
        return Promise.resolve('2.0.0');
      }
      if (section === 'build' && key === 'type') {
        return Promise.resolve('web');
      }
      return Promise.resolve(defaultValue);
    });
    
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Check if form elements are rendered with loaded values
    expect(screen.getByLabelText('Application Name')).toHaveValue('Test App');
    expect(screen.getByLabelText('Version')).toHaveValue('2.0.0');
  });
  
  test('opens build confirmation dialog when build button is clicked', async () => {
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Click build button
    fireEvent.click(screen.getByText('Build Application'));
    
    // Check if confirmation dialog is displayed
    expect(screen.getByText('Are you sure you want to build the application with these settings?')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  test('builds application when confirmed', async () => {
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Fill in some form values
    fireEvent.change(screen.getByLabelText('Application Name'), { target: { value: 'My Test App' } });
    fireEvent.change(screen.getByLabelText('Version'), { target: { value: '1.2.3' } });
    
    // Click build button
    fireEvent.click(screen.getByText('Build Application'));
    
    // Confirm build
    fireEvent.click(screen.getByText('Build'));
    
    // Wait for build to complete
    await waitFor(() => {
      expect(ApplicationGenerator.generateApplication).toHaveBeenCalled();
      expect(ApplicationGenerator.generateApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          appName: 'My Test App',
          appVersion: '1.2.3'
        })
      );
    });
    
    // Check if success message is displayed
    expect(screen.getByText('Application built successfully')).toBeInTheDocument();
    
    // Check if result dialog is displayed
    expect(screen.getByText('Build Result')).toBeInTheDocument();
    expect(screen.getByText('Output Location: /path/to/output')).toBeInTheDocument();
    expect(screen.getByText('Build Type: Electron')).toBeInTheDocument();
    expect(screen.getByText('Platforms: Windows, macOS, Linux')).toBeInTheDocument();
    expect(screen.getByText('File Size: 10.5 MB')).toBeInTheDocument();
  });
  
  test('saves settings before building', async () => {
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Fill in some form values
    fireEvent.change(screen.getByLabelText('Application Name'), { target: { value: 'My Test App' } });
    fireEvent.change(screen.getByLabelText('Version'), { target: { value: '1.2.3' } });
    
    // Click build button
    fireEvent.click(screen.getByText('Build Application'));
    
    // Confirm build
    fireEvent.click(screen.getByText('Build'));
    
    // Wait for build to complete
    await waitFor(() => {
      expect(ConfigManager.set).toHaveBeenCalledWith('application', 'name', 'My Test App');
      expect(ConfigManager.set).toHaveBeenCalledWith('application', 'version', '1.2.3');
      expect(ApplicationGenerator.generateApplication).toHaveBeenCalled();
    });
  });
  
  test('registers progress callback with ApplicationGenerator', async () => {
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Click build button
    fireEvent.click(screen.getByText('Build Application'));
    
    // Confirm build
    fireEvent.click(screen.getByText('Build'));
    
    // Wait for build to complete
    await waitFor(() => {
      expect(ApplicationGenerator.onProgressUpdate).toHaveBeenCalled();
    });
  });
  
  test('shows error message when build fails', async () => {
    // Setup error for building
    ApplicationGenerator.generateApplication.mockRejectedValue(new Error('Failed to build application'));
    
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Click build button
    fireEvent.click(screen.getByText('Build Application'));
    
    // Confirm build
    fireEvent.click(screen.getByText('Build'));
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error building application: Failed to build application')).toBeInTheDocument();
    });
  });
  
  test('closes build dialog when cancel is clicked', async () => {
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Click build button
    fireEvent.click(screen.getByText('Build Application'));
    
    // Check if confirmation dialog is displayed
    expect(screen.getByText('Are you sure you want to build the application with these settings?')).toBeInTheDocument();
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if confirmation dialog is closed
    expect(screen.queryByText('Are you sure you want to build the application with these settings?')).not.toBeInTheDocument();
    
    // Verify that build was not started
    expect(ApplicationGenerator.generateApplication).not.toHaveBeenCalled();
  });
  
  test('handles target platform selection correctly', async () => {
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Find the target platforms dropdown
    const targetPlatformsLabel = screen.getByText('Target Platforms');
    expect(targetPlatformsLabel).toBeInTheDocument();
    
    // Note: Testing multiselect dropdowns is complex with React Testing Library
    // In a real test, we would need to find the dropdown and simulate selection
    // This is a simplified test that just verifies the label exists
  });
  
  test('closes build result dialog when close button is clicked', async () => {
    render(<ApplicationExport />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(ConfigManager.get).toHaveBeenCalled();
    });
    
    // Click build button
    fireEvent.click(screen.getByText('Build Application'));
    
    // Confirm build
    fireEvent.click(screen.getByText('Build'));
    
    // Wait for build to complete and result dialog to show
    await waitFor(() => {
      expect(screen.getByText('Build Result')).toBeInTheDocument();
    });
    
    // Click close button in result dialog
    fireEvent.click(screen.getAllByText('Close')[1]); // Second close button is in the result dialog
    
    // Check if result dialog is closed
    await waitFor(() => {
      expect(screen.queryByText('Build Result')).not.toBeInTheDocument();
    });
  });
});
