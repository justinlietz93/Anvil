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
  Pivot,
  PivotItem
} from '@fluentui/react';
import { ComponentLibrary } from '../ComponentLibrary/ComponentLibrary';
import { Workspace } from '../Workspace/Workspace';
import { PropertiesPanel } from '../PropertiesPanel/PropertiesPanel';
import { BlueprintEditor } from '../BlueprintEditor/BlueprintEditor';
import { DatabaseConnectionManager } from '../DataConnectivity/DatabaseConnectionManager';
import { LLMProviderManager } from '../LLMIntegration/LLMProviderManager';
import { PluginManagerUI } from '../Extensibility/PluginManagerUI';
import { SettingsPanel } from '../Settings/SettingsPanel';
import { ConfigManager } from '../../services/ConfigManager';

/**
 * Main Editor Component
 * 
 * The primary editor interface for the Anvil platform
 * 
 * @author Justin Lietz
 */
const MainEditor: React.FC = () => {
  // State for selected component
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>('designer');
  
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for error message
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // State for settings dialog
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState<boolean>(false);
  
  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);
  
  // Load configuration from ConfigManager
  const loadConfiguration = async () => {
    try {
      // Initialize ConfigManager
      ConfigManager.initialize();
      
      // Load last active tab from configuration
      const lastActiveTab = await ConfigManager.get('ui', 'lastActiveTab', 'designer');
      setActiveTab(lastActiveTab);
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };
  
  // Save active tab to configuration
  const saveActiveTab = async (tab: string) => {
    try {
      await ConfigManager.set('ui', 'lastActiveTab', tab);
    } catch (error) {
      console.error('Error saving active tab:', error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (item?: PivotItem) => {
    if (item) {
      const newTab = item.props.itemKey || 'designer';
      setActiveTab(newTab);
      saveActiveTab(newTab);
    }
  };
  
  // Handle component selection
  const handleComponentSelect = (componentId: string) => {
    setSelectedComponentId(componentId);
  };
  
  // Open settings dialog
  const openSettingsDialog = () => {
    setIsSettingsDialogOpen(true);
  };
  
  // Close settings dialog
  const closeSettingsDialog = () => {
    setIsSettingsDialogOpen(false);
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'designer':
        return (
          <Stack horizontal tokens={{ childrenGap: 16 }} styles={{ root: { height: 'calc(100vh - 120px)' } }}>
            <Stack.Item styles={{ root: { width: 300, overflowY: 'auto' } }}>
              <ComponentLibrary onComponentSelect={handleComponentSelect} />
            </Stack.Item>
            <Stack.Item grow styles={{ root: { overflowY: 'auto' } }}>
              <Workspace selectedComponentId={selectedComponentId} />
            </Stack.Item>
            <Stack.Item styles={{ root: { width: 300, overflowY: 'auto' } }}>
              <PropertiesPanel selectedComponentId={selectedComponentId} />
            </Stack.Item>
          </Stack>
        );
      case 'blueprint':
        return (
          <BlueprintEditor />
        );
      case 'data':
        return (
          <DatabaseConnectionManager />
        );
      case 'llm':
        return (
          <LLMProviderManager />
        );
      case 'plugins':
        return (
          <PluginManagerUI />
        );
      default:
        return (
          <Text>Select a tab to get started</Text>
        );
    }
  };
  
  return (
    <Stack tokens={{ childrenGap: 16 }} styles={{ root: { height: '100vh', padding: 16 } }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xxLarge">Anvil Desktop Platform</Text>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton text="Export Application" onClick={() => {}} />
          <DefaultButton text="Settings" onClick={openSettingsDialog} />
        </Stack>
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
      
      <Pivot 
        selectedKey={activeTab} 
        onLinkClick={handleTabChange}
        styles={{ root: { marginBottom: 16 } }}
      >
        <PivotItem headerText="Visual Designer" itemKey="designer" />
        <PivotItem headerText="Blueprint Editor" itemKey="blueprint" />
        <PivotItem headerText="Data Connectivity" itemKey="data" />
        <PivotItem headerText="LLM Integration" itemKey="llm" />
        <PivotItem headerText="Plugins" itemKey="plugins" />
      </Pivot>
      
      {renderTabContent()}
      
      {/* Settings Dialog */}
      <Dialog
        hidden={!isSettingsDialogOpen}
        onDismiss={closeSettingsDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Settings',
          subText: 'Configure application settings'
        }}
        modalProps={{
          isBlocking: false,
          styles: { main: { maxWidth: 800 } }
        }}
      >
        <SettingsPanel />
        <DialogFooter>
          <PrimaryButton text="Close" onClick={closeSettingsDialog} />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};

export default MainEditor;
