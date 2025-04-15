import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  Text, 
  PrimaryButton, 
  DefaultButton, 
  Dialog, 
  DialogType, 
  DialogFooter,
  TextField,
  Dropdown,
  IDropdownOption,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
  Toggle
} from '@fluentui/react';
import { LLMAgentIntegration, LLMProviderConfig } from '../../services/LLMAgentIntegration';

/**
 * LLM Provider Manager Component
 * 
 * Provides a user interface for managing LLM providers in the Anvil platform
 * 
 * @author Justin Lietz
 */
const LLMProviderManager: React.FC = () => {
  // State for provider list
  const [providers, setProviders] = useState<any[]>([]);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for error message
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // State for add provider dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string>('');
  const [providerType, setProviderType] = useState<string>('openai');
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [apiEndpoint, setApiEndpoint] = useState<string>('');
  const [customEndpoint, setCustomEndpoint] = useState<boolean>(false);
  
  // State for remove provider dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState<boolean>(false);
  const [providerToRemove, setProviderToRemove] = useState<string>('');
  
  // State for test provider dialog
  const [isTestDialogOpen, setIsTestDialogOpen] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');
  const [testSuccess, setTestSuccess] = useState<boolean>(false);
  
  // Provider type options
  const providerTypeOptions: IDropdownOption[] = [
    { key: 'openai', text: 'OpenAI' },
    { key: 'anthropic', text: 'Anthropic' },
    { key: 'google', text: 'Google AI' },
    { key: 'azure', text: 'Azure OpenAI' },
    { key: 'custom', text: 'Custom Provider' }
  ];
  
  // Model options based on provider type
  const getModelOptions = (): IDropdownOption[] => {
    switch (providerType) {
      case 'openai':
        return [
          { key: 'gpt-4', text: 'GPT-4' },
          { key: 'gpt-4-turbo', text: 'GPT-4 Turbo' },
          { key: 'gpt-3.5-turbo', text: 'GPT-3.5 Turbo' }
        ];
      case 'anthropic':
        return [
          { key: 'claude-3-opus', text: 'Claude 3 Opus' },
          { key: 'claude-3-sonnet', text: 'Claude 3 Sonnet' },
          { key: 'claude-3-haiku', text: 'Claude 3 Haiku' }
        ];
      case 'google':
        return [
          { key: 'gemini-pro', text: 'Gemini Pro' },
          { key: 'gemini-ultra', text: 'Gemini Ultra' }
        ];
      case 'azure':
        return [
          { key: 'gpt-4', text: 'GPT-4' },
          { key: 'gpt-35-turbo', text: 'GPT-3.5 Turbo' }
        ];
      default:
        return [];
    }
  };
  
  // Columns for the providers list
  const columns: IColumn[] = [
    {
      key: 'name',
      name: 'Name',
      fieldName: 'name',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true
    },
    {
      key: 'type',
      name: 'Type',
      fieldName: 'type',
      minWidth: 100,
      maxWidth: 100,
      isResizable: true
    },
    {
      key: 'model',
      name: 'Model',
      fieldName: 'model',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true
    },
    {
      key: 'endpoint',
      name: 'API Endpoint',
      fieldName: 'endpoint',
      minWidth: 200,
      isResizable: true
    },
    {
      key: 'actions',
      name: 'Actions',
      minWidth: 200,
      maxWidth: 200,
      isResizable: true,
      onRender: (item) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton 
            text="Test" 
            onClick={() => handleTestProvider(item.id)}
          />
          <DefaultButton 
            text="Remove" 
            onClick={() => openRemoveDialog(item.id, item.name)}
          />
        </Stack>
      )
    }
  ];
  
  // Load providers on component mount
  useEffect(() => {
    loadProviders();
  }, []);
  
  // Load providers from the LLMAgentIntegration
  const loadProviders = () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const allProviders = LLMAgentIntegration.getAllProviders();
      
      // Transform providers for the list
      const providersList = allProviders.map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type,
        model: provider.model,
        endpoint: provider.apiEndpoint || 'Default'
      }));
      
      setProviders(providersList);
    } catch (error) {
      setErrorMessage('Failed to load providers: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding a provider
  const handleAddProvider = () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      let providerId = '';
      
      switch (providerType) {
        case 'openai':
          providerId = LLMAgentIntegration.createOpenAIProvider(
            providerName,
            apiKey,
            model || 'gpt-4'
          );
          break;
        case 'anthropic':
          providerId = LLMAgentIntegration.createAnthropicProvider(
            providerName,
            apiKey,
            model || 'claude-3-opus'
          );
          break;
        case 'google':
          providerId = LLMAgentIntegration.createGoogleProvider(
            providerName,
            apiKey,
            model || 'gemini-pro'
          );
          break;
        case 'azure':
        case 'custom':
          providerId = LLMAgentIntegration.registerProvider({
            name: providerName,
            type: providerType,
            apiKey: apiKey,
            model: model,
            apiEndpoint: customEndpoint ? apiEndpoint : undefined
          });
          break;
      }
      
      if (providerId) {
        setSuccessMessage('Provider added successfully');
        loadProviders();
        closeAddDialog();
      } else {
        setErrorMessage('Failed to add provider');
      }
    } catch (error) {
      setErrorMessage('Error adding provider: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle removing a provider
  const handleRemoveProvider = () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const success = LLMAgentIntegration.removeProvider(providerToRemove);
      
      if (success) {
        setSuccessMessage('Provider removed successfully');
        loadProviders();
        closeRemoveDialog();
      } else {
        setErrorMessage('Failed to remove provider');
      }
    } catch (error) {
      setErrorMessage('Error removing provider: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle testing a provider
  const handleTestProvider = async (providerId: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // This would be implemented to test the provider
      // For now, we'll just simulate a test
      const provider = LLMAgentIntegration.getProvider(providerId);
      
      if (!provider) {
        throw new Error('Provider not found');
      }
      
      // Simulate a test request
      const result = await LLMAgentIntegration.sendRequest(providerId, {
        prompt: 'Hello, this is a test message. Please respond with a short greeting.'
      });
      
      setTestSuccess(result.success);
      setTestResult(result.success ? `Connection successful! Response: ${result.text}` : `Connection failed: ${result.error}`);
      setIsTestDialogOpen(true);
    } catch (error) {
      setErrorMessage('Error testing provider: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open the add provider dialog
  const openAddDialog = () => {
    setProviderName('');
    setProviderType('openai');
    setApiKey('');
    setModel('');
    setApiEndpoint('');
    setCustomEndpoint(false);
    setIsAddDialogOpen(true);
  };
  
  // Close the add provider dialog
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };
  
  // Open the remove provider dialog
  const openRemoveDialog = (providerId: string, providerName: string) => {
    setProviderToRemove(providerId);
    setIsRemoveDialogOpen(true);
  };
  
  // Close the remove provider dialog
  const closeRemoveDialog = () => {
    setProviderToRemove('');
    setIsRemoveDialogOpen(false);
  };
  
  // Close the test provider dialog
  const closeTestDialog = () => {
    setIsTestDialogOpen(false);
  };
  
  // Handle provider type change
  const handleProviderTypeChange = (option?: IDropdownOption) => {
    if (option) {
      setProviderType(option.key as string);
      setModel('');
      
      // Set default API endpoint based on provider type
      switch (option.key) {
        case 'openai':
          setApiEndpoint('https://api.openai.com/v1');
          break;
        case 'anthropic':
          setApiEndpoint('https://api.anthropic.com');
          break;
        case 'google':
          setApiEndpoint('https://generativelanguage.googleapis.com');
          break;
        case 'azure':
          setApiEndpoint('https://your-resource-name.openai.azure.com');
          break;
        default:
          setApiEndpoint('');
      }
    }
  };
  
  return (
    <Stack tokens={{ childrenGap: 16, padding: 16 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xLarge">LLM Provider Manager</Text>
        <PrimaryButton text="Add Provider" onClick={openAddDialog} />
      </Stack>
      
      {isLoading && (
        <Spinner size={SpinnerSize.large} label="Loading..." />
      )}
      
      {errorMessage && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setErrorMessage('')}>
          {errorMessage}
        </MessageBar>
      )}
      
      {successMessage && (
        <MessageBar messageBarType={MessageBarType.success} onDismiss={() => setSuccessMessage('')}>
          {successMessage}
        </MessageBar>
      )}
      
      <DetailsList
        items={providers}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible={true}
      />
      
      {/* Add Provider Dialog */}
      <Dialog
        hidden={!isAddDialogOpen}
        onDismiss={closeAddDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Add LLM Provider',
          subText: 'Enter the details for the LLM provider'
        }}
        modalProps={{
          isBlocking: true
        }}
      >
        <Stack tokens={{ childrenGap: 8 }}>
          <TextField
            label="Provider Name"
            value={providerName}
            onChange={(_, newValue) => setProviderName(newValue || '')}
            required
          />
          <Dropdown
            label="Provider Type"
            selectedKey={providerType}
            options={providerTypeOptions}
            onChange={(_, option) => option && handleProviderTypeChange(option)}
            required
          />
          <Dropdown
            label="Model"
            selectedKey={model}
            options={getModelOptions()}
            onChange={(_, option) => option && setModel(option.key as string)}
            required
          />
          <TextField
            label="API Key"
            value={apiKey}
            onChange={(_, newValue) => setApiKey(newValue || '')}
            type="password"
            required
          />
          <Toggle
            label="Use Custom API Endpoint"
            checked={customEndpoint}
            onChange={(_, checked) => setCustomEndpoint(checked || false)}
          />
          {customEndpoint && (
            <TextField
              label="API Endpoint"
              value={apiEndpoint}
              onChange={(_, newValue) => setApiEndpoint(newValue || '')}
              required={customEndpoint}
            />
          )}
        </Stack>
        <DialogFooter>
          <PrimaryButton 
            text="Add" 
            onClick={handleAddProvider} 
            disabled={!providerName || !apiKey || (customEndpoint && !apiEndpoint)}
          />
          <DefaultButton text="Cancel" onClick={closeAddDialog} />
        </DialogFooter>
      </Dialog>
      
      {/* Remove Provider Dialog */}
      <Dialog
        hidden={!isRemoveDialogOpen}
        onDismiss={closeRemoveDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Remove Provider',
          subText: 'Are you sure you want to remove this provider?'
        }}
        modalProps={{
          isBlocking: true
        }}
      >
        <DialogFooter>
          <PrimaryButton text="Remove" onClick={handleRemoveProvider} />
          <DefaultButton text="Cancel" onClick={closeRemoveDialog} />
        </DialogFooter>
      </Dialog>
      
      {/* Test Provider Dialog */}
      <Dialog
        hidden={!isTestDialogOpen}
        onDismiss={closeTestDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Provider Test Result'
        }}
        modalProps={{
          isBlocking: false
        }}
      >
        <MessageBar 
          messageBarType={testSuccess ? MessageBarType.success : MessageBarType.error}
        >
          {testResult}
        </MessageBar>
        <DialogFooter>
          <PrimaryButton text="Close" onClick={closeTestDialog} />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};

export default LLMProviderManager;
