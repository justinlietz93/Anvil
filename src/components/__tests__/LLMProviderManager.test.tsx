import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LLMProviderManager from '../LLMIntegration/LLMProviderManager';
import { LLMAgentIntegration } from '../../services/LLMAgentIntegration';

// Mock the LLMAgentIntegration
jest.mock('../../services/LLMAgentIntegration', () => ({
  LLMAgentIntegration: {
    getAllProviders: jest.fn().mockReturnValue([
      {
        id: 'provider-1',
        name: 'OpenAI GPT-4',
        type: 'openai',
        model: 'gpt-4',
        apiEndpoint: undefined
      },
      {
        id: 'provider-2',
        name: 'Claude',
        type: 'anthropic',
        model: 'claude-3-opus',
        apiEndpoint: 'https://api.anthropic.com'
      }
    ]),
    getProvider: jest.fn().mockImplementation((id) => {
      if (id === 'provider-1') {
        return {
          id: 'provider-1',
          name: 'OpenAI GPT-4',
          type: 'openai',
          model: 'gpt-4'
        };
      }
      return null;
    }),
    createOpenAIProvider: jest.fn().mockReturnValue('new-openai-provider'),
    createAnthropicProvider: jest.fn().mockReturnValue('new-anthropic-provider'),
    createGoogleProvider: jest.fn().mockReturnValue('new-google-provider'),
    registerProvider: jest.fn().mockReturnValue('new-provider'),
    removeProvider: jest.fn().mockReturnValue(true),
    sendRequest: jest.fn().mockResolvedValue({ 
      success: true, 
      text: 'Hello! This is a test response from the LLM provider.' 
    })
  }
}));

describe('LLMProviderManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the LLM provider manager with providers list', () => {
    render(<LLMProviderManager />);
    
    // Check if the title is rendered
    expect(screen.getByText('LLM Provider Manager')).toBeInTheDocument();
    
    // Check if the providers are rendered
    expect(screen.getByText('OpenAI GPT-4')).toBeInTheDocument();
    expect(screen.getByText('Claude')).toBeInTheDocument();
    
    // Check if the add provider button is rendered
    expect(screen.getByText('Add Provider')).toBeInTheDocument();
  });

  test('loads providers from LLMAgentIntegration on mount', () => {
    render(<LLMProviderManager />);
    
    // Check if LLMAgentIntegration.getAllProviders was called
    expect(LLMAgentIntegration.getAllProviders).toHaveBeenCalled();
  });

  test('opens add provider dialog', async () => {
    render(<LLMProviderManager />);
    
    // Click the add provider button
    fireEvent.click(screen.getByText('Add Provider'));
    
    // Check if the dialog is open
    expect(screen.getByText('Add LLM Provider')).toBeInTheDocument();
    expect(screen.getByLabelText('Provider Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Provider Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Model')).toBeInTheDocument();
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
    
    // OpenAI should be the default provider type
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
  });

  test('changes provider type in add dialog', async () => {
    render(<LLMProviderManager />);
    
    // Open the add provider dialog
    fireEvent.click(screen.getByText('Add Provider'));
    
    // Change the provider type to Anthropic
    const typeDropdown = screen.getByLabelText('Provider Type');
    fireEvent.click(typeDropdown);
    fireEvent.click(screen.getByText('Anthropic'));
    
    // Check if the Anthropic models are available
    expect(screen.getByText('Claude 3 Opus')).toBeInTheDocument();
    
    // Change the provider type to Google AI
    fireEvent.click(typeDropdown);
    fireEvent.click(screen.getByText('Google AI'));
    
    // Check if the Google models are available
    expect(screen.getByText('Gemini Pro')).toBeInTheDocument();
  });

  test('toggles custom API endpoint', async () => {
    render(<LLMProviderManager />);
    
    // Open the add provider dialog
    fireEvent.click(screen.getByText('Add Provider'));
    
    // Custom API endpoint should be hidden by default
    expect(screen.queryByLabelText('API Endpoint')).not.toBeInTheDocument();
    
    // Enable custom API endpoint
    fireEvent.click(screen.getByLabelText('Use Custom API Endpoint'));
    
    // API endpoint field should be visible
    expect(screen.getByLabelText('API Endpoint')).toBeInTheDocument();
    
    // Disable custom API endpoint
    fireEvent.click(screen.getByLabelText('Use Custom API Endpoint'));
    
    // API endpoint field should be hidden again
    expect(screen.queryByLabelText('API Endpoint')).not.toBeInTheDocument();
  });

  test('adds an OpenAI provider', async () => {
    render(<LLMProviderManager />);
    
    // Open the add provider dialog
    fireEvent.click(screen.getByText('Add Provider'));
    
    // Fill in the provider details
    fireEvent.change(screen.getByLabelText('Provider Name'), { target: { value: 'My OpenAI Provider' } });
    
    // Select a model
    const modelDropdown = screen.getByLabelText('Model');
    fireEvent.click(modelDropdown);
    fireEvent.click(screen.getByText('GPT-4'));
    
    // Enter API key
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'sk-test123456789' } });
    
    // Click the Add button
    fireEvent.click(screen.getByText('Add'));
    
    // Check if LLMAgentIntegration.createOpenAIProvider was called with the correct parameters
    expect(LLMAgentIntegration.createOpenAIProvider).toHaveBeenCalledWith(
      'My OpenAI Provider',
      'sk-test123456789',
      'gpt-4'
    );
    
    // Check if the providers are reloaded
    expect(LLMAgentIntegration.getAllProviders).toHaveBeenCalledTimes(2);
    
    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText('Provider added successfully')).toBeInTheDocument();
    });
  });

  test('adds an Anthropic provider', async () => {
    render(<LLMProviderManager />);
    
    // Open the add provider dialog
    fireEvent.click(screen.getByText('Add Provider'));
    
    // Change the provider type to Anthropic
    const typeDropdown = screen.getByLabelText('Provider Type');
    fireEvent.click(typeDropdown);
    fireEvent.click(screen.getByText('Anthropic'));
    
    // Fill in the provider details
    fireEvent.change(screen.getByLabelText('Provider Name'), { target: { value: 'My Claude Provider' } });
    
    // Select a model
    const modelDropdown = screen.getByLabelText('Model');
    fireEvent.click(modelDropdown);
    fireEvent.click(screen.getByText('Claude 3 Opus'));
    
    // Enter API key
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'sk-ant-test123456789' } });
    
    // Click the Add button
    fireEvent.click(screen.getByText('Add'));
    
    // Check if LLMAgentIntegration.createAnthropicProvider was called with the correct parameters
    expect(LLMAgentIntegration.createAnthropicProvider).toHaveBeenCalledWith(
      'My Claude Provider',
      'sk-ant-test123456789',
      'claude-3-opus'
    );
    
    // Check if the providers are reloaded
    expect(LLMAgentIntegration.getAllProviders).toHaveBeenCalledTimes(2);
    
    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText('Provider added successfully')).toBeInTheDocument();
    });
  });

  test('adds a custom provider with custom endpoint', async () => {
    render(<LLMProviderManager />);
    
    // Open the add provider dialog
    fireEvent.click(screen.getByText('Add Provider'));
    
    // Change the provider type to Custom Provider
    const typeDropdown = screen.getByLabelText('Provider Type');
    fireEvent.click(typeDropdown);
    fireEvent.click(screen.getByText('Custom Provider'));
    
    // Fill in the provider details
    fireEvent.change(screen.getByLabelText('Provider Name'), { target: { value: 'My Custom Provider' } });
    
    // Enter API key
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'custom-api-key' } });
    
    // Enable custom API endpoint
    fireEvent.click(screen.getByLabelText('Use Custom API Endpoint'));
    
    // Enter API endpoint
    fireEvent.change(screen.getByLabelText('API Endpoint'), { target: { value: 'https://custom-llm-api.example.com' } });
    
    // Click the Add button
    fireEvent.click(screen.getByText('Add'));
    
    // Check if LLMAgentIntegration.registerProvider was called with the correct parameters
    expect(LLMAgentIntegration.registerProvider).toHaveBeenCalledWith({
      name: 'My Custom Provider',
      type: 'custom',
      apiKey: 'custom-api-key',
      model: '',
      apiEndpoint: 'https://custom-llm-api.example.com'
    });
    
    // Check if the providers are reloaded
    expect(LLMAgentIntegration.getAllProviders).toHaveBeenCalledTimes(2);
    
    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText('Provider added successfully')).toBeInTheDocument();
    });
  });

  test('removes a provider', async () => {
    render(<LLMProviderManager />);
    
    // Find the remove button for the first provider
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    // Check if the confirmation dialog is shown
    expect(screen.getByText('Are you sure you want to remove this provider?')).toBeInTheDocument();
    
    // Click the Remove button in the dialog
    fireEvent.click(screen.getAllByText('Remove')[1]);
    
    // Check if LLMAgentIntegration.removeProvider was called
    expect(LLMAgentIntegration.removeProvider).toHaveBeenCalled();
    
    // Check if the providers are reloaded
    expect(LLMAgentIntegration.getAllProviders).toHaveBeenCalledTimes(2);
    
    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText('Provider removed successfully')).toBeInTheDocument();
    });
  });

  test('tests a provider', async () => {
    render(<LLMProviderManager />);
    
    // Find the test button for the first provider
    const testButtons = screen.getAllByText('Test');
    fireEvent.click(testButtons[0]);
    
    // Check if LLMAgentIntegration.getProvider and sendRequest were called
    expect(LLMAgentIntegration.getProvider).toHaveBeenCalledWith('provider-1');
    expect(LLMAgentIntegration.sendRequest).toHaveBeenCalledWith('provider-1', {
      prompt: 'Hello, this is a test message. Please respond with a short greeting.'
    });
    
    // Check if the test result dialog is shown
    await waitFor(() => {
      expect(screen.getByText(/Connection successful! Response:/)).toBeInTheDocument();
    });
    
    // Close the dialog
    fireEvent.click(screen.getByText('Close'));
    
    // Dialog should be closed
    expect(screen.queryByText(/Connection successful! Response:/)).not.toBeInTheDocument();
  });
});
