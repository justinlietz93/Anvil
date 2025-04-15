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
  Label,
  Toggle
} from '@fluentui/react';
import { ConfigManager } from '../../services/ConfigManager';

/**
 * Settings Panel Component
 * 
 * Provides a user interface for configuring application settings
 * 
 * @author Justin Lietz
 */
const SettingsPanel: React.FC = () => {
  // State for general settings
  const [appName, setAppName] = useState<string>('My Anvil App');
  const [theme, setTheme] = useState<string>('light');
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(5);
  
  // State for blueprint settings
  const [maxNodeExecutionTime, setMaxNodeExecutionTime] = useState<number>(5000);
  const [enableNodeCaching, setEnableNodeCaching] = useState<boolean>(true);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  
  // State for plugin settings
  const [pluginMemoryLimit, setPluginMemoryLimit] = useState<number>(128);
  const [pluginTimeout, setPluginTimeout] = useState<number>(1000);
  const [allowDangerousPermissions, setAllowDangerousPermissions] = useState<boolean>(false);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for error message
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // Theme options
  const themeOptions: IDropdownOption[] = [
    { key: 'light', text: 'Light' },
    { key: 'dark', text: 'Dark' },
    { key: 'system', text: 'System Default' }
  ];
  
  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  // Load settings from ConfigManager
  const loadSettings = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // General settings
      const loadedAppName = await ConfigManager.get('application', 'name', 'My Anvil App');
      const loadedTheme = await ConfigManager.get('ui', 'theme', 'light');
      const loadedAutoSave = await ConfigManager.get('application', 'autoSave', true);
      const loadedAutoSaveInterval = await ConfigManager.get('application', 'autoSaveInterval', 5);
      
      // Blueprint settings
      const loadedMaxNodeExecutionTime = await ConfigManager.get('blueprint', 'maxNodeExecutionTime', 5000);
      const loadedEnableNodeCaching = await ConfigManager.get('blueprint', 'enableNodeCaching', true);
      const loadedDebugMode = await ConfigManager.get('blueprint', 'debugMode', false);
      
      // Plugin settings
      const loadedPluginMemoryLimit = await ConfigManager.get('plugins', 'memoryLimitMB', 128);
      const loadedPluginTimeout = await ConfigManager.get('plugins', 'timeoutMs', 1000);
      const loadedAllowDangerousPermissions = await ConfigManager.get('plugins', 'allowDangerousPermissions', false);
      
      // Update state
      setAppName(loadedAppName);
      setTheme(loadedTheme);
      setAutoSave(loadedAutoSave);
      setAutoSaveInterval(loadedAutoSaveInterval);
      setMaxNodeExecutionTime(loadedMaxNodeExecutionTime);
      setEnableNodeCaching(loadedEnableNodeCaching);
      setDebugMode(loadedDebugMode);
      setPluginMemoryLimit(loadedPluginMemoryLimit);
      setPluginTimeout(loadedPluginTimeout);
      setAllowDangerousPermissions(loadedAllowDangerousPermissions);
    } catch (error) {
      setErrorMessage('Failed to load settings: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save settings to ConfigManager
  const saveSettings = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // General settings
      await ConfigManager.set('application', 'name', appName);
      await ConfigManager.set('ui', 'theme', theme);
      await ConfigManager.set('application', 'autoSave', autoSave);
      await ConfigManager.set('application', 'autoSaveInterval', autoSaveInterval);
      
      // Blueprint settings
      await ConfigManager.set('blueprint', 'maxNodeExecutionTime', maxNodeExecutionTime);
      await ConfigManager.set('blueprint', 'enableNodeCaching', enableNodeCaching);
      await ConfigManager.set('blueprint', 'debugMode', debugMode);
      
      // Plugin settings
      await ConfigManager.set('plugins', 'memoryLimitMB', pluginMemoryLimit);
      await ConfigManager.set('plugins', 'timeoutMs', pluginTimeout);
      await ConfigManager.set('plugins', 'allowDangerousPermissions', allowDangerousPermissions);
      
      setSuccessMessage('Settings saved successfully');
    } catch (error) {
      setErrorMessage('Failed to save settings: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset settings to defaults
  const resetSettings = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // General settings
      setAppName('My Anvil App');
      setTheme('light');
      setAutoSave(true);
      setAutoSaveInterval(5);
      
      // Blueprint settings
      setMaxNodeExecutionTime(5000);
      setEnableNodeCaching(true);
      setDebugMode(false);
      
      // Plugin settings
      setPluginMemoryLimit(128);
      setPluginTimeout(1000);
      setAllowDangerousPermissions(false);
      
      // Save defaults to ConfigManager
      await saveSettings();
      
      setSuccessMessage('Settings reset to defaults');
    } catch (error) {
      setErrorMessage('Failed to reset settings: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Stack tokens={{ childrenGap: 16 }}>
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
      
      <Stack horizontal horizontalAlign="space-between">
        <Text variant="xLarge">Settings</Text>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton text="Save" onClick={saveSettings} />
          <DefaultButton text="Reset to Defaults" onClick={resetSettings} />
        </Stack>
      </Stack>
      
      <Stack tokens={{ childrenGap: 16 }}>
        <Text variant="large">General Settings</Text>
        <Stack tokens={{ childrenGap: 8 }}>
          <TextField
            label="Application Name"
            value={appName}
            onChange={(_, newValue) => setAppName(newValue || '')}
          />
          <Dropdown
            label="Theme"
            selectedKey={theme}
            options={themeOptions}
            onChange={(_, option) => option && setTheme(option.key as string)}
          />
          <Toggle
            label="Auto Save"
            checked={autoSave}
            onChange={(_, checked) => setAutoSave(checked || false)}
          />
          {autoSave && (
            <TextField
              label="Auto Save Interval (minutes)"
              type="number"
              value={autoSaveInterval.toString()}
              onChange={(_, newValue) => setAutoSaveInterval(parseInt(newValue || '5'))}
              min={1}
              max={60}
            />
          )}
        </Stack>
        
        <Text variant="large">Blueprint Settings</Text>
        <Stack tokens={{ childrenGap: 8 }}>
          <TextField
            label="Max Node Execution Time (ms)"
            type="number"
            value={maxNodeExecutionTime.toString()}
            onChange={(_, newValue) => setMaxNodeExecutionTime(parseInt(newValue || '5000'))}
            min={1000}
            max={30000}
          />
          <Toggle
            label="Enable Node Caching"
            checked={enableNodeCaching}
            onChange={(_, checked) => setEnableNodeCaching(checked || false)}
          />
          <Toggle
            label="Debug Mode"
            checked={debugMode}
            onChange={(_, checked) => setDebugMode(checked || false)}
          />
        </Stack>
        
        <Text variant="large">Plugin Settings</Text>
        <Stack tokens={{ childrenGap: 8 }}>
          <TextField
            label="Plugin Memory Limit (MB)"
            type="number"
            value={pluginMemoryLimit.toString()}
            onChange={(_, newValue) => setPluginMemoryLimit(parseInt(newValue || '128'))}
            min={32}
            max={512}
          />
          <TextField
            label="Plugin Timeout (ms)"
            type="number"
            value={pluginTimeout.toString()}
            onChange={(_, newValue) => setPluginTimeout(parseInt(newValue || '1000'))}
            min={500}
            max={10000}
          />
          <Toggle
            label="Allow Dangerous Permissions"
            checked={allowDangerousPermissions}
            onChange={(_, checked) => setAllowDangerousPermissions(checked || false)}
          />
          {allowDangerousPermissions && (
            <MessageBar messageBarType={MessageBarType.warning}>
              Enabling dangerous permissions can pose security risks. Only enable this if you trust all plugin sources.
            </MessageBar>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SettingsPanel;
