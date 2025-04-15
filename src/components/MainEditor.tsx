import React, { useEffect, useState } from 'react';
import { 
  Stack, 
  Text, 
  PrimaryButton, 
  DefaultButton, 
  Dialog, 
  DialogType, 
  DialogFooter,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Pivot,
  PivotItem,
  CommandBar,
  ICommandBarItemProps,
} from '@fluentui/react';
import { useUI } from '../contexts/UIContext';
import { ComponentLibrary } from './ComponentLibrary/ComponentLibrary';
import { Workspace } from './Workspace/Workspace';
import { PropertiesPanel } from './PropertiesPanel/PropertiesPanel';
import { BlueprintEditor } from './BlueprintEditor/BlueprintEditor';
import { NodeLibrary } from './BlueprintEditor/NodeLibrary';
import { DatabaseConnectionManager } from './DataConnectivity/DatabaseConnectionManager';
import { LLMProviderManager } from './LLMIntegration/LLMProviderManager';
import { PluginManagerUI } from './Extensibility/PluginManagerUI';
import { SettingsPanel } from './Settings/SettingsPanel';
import { ApplicationExport } from './ApplicationExport';
import { ConfigManager } from '../services/ConfigManager';

/**
 * Main Editor Component
 * 
 * The primary editor interface for the Anvil platform
 * 
 * @author 
 */
const MainEditor: React.FC = () => {
  // Use the enhanced UI context
  const { 
    activeTab, 
    setActiveTab, 
    showNotification,
    notifications,
    openModal,
    closeModal,
    activeModal,
    modalProps,
    isPropertiesPanelOpen,
    setPropertiesPanelOpen,
    isNodeLibraryOpen,
    setNodeLibraryOpen,
    isComponentLibraryOpen,
    setComponentLibraryOpen,
  } = useUI();
  
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load configuration on component mount
  useEffect(() => {
    loadConfiguration();
  }, []);
  
  // Load configuration from ConfigManager
  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      
      // Initialize ConfigManager
      ConfigManager.initialize();
      
      // Load last active tab from configuration
      const lastActiveTab = await ConfigManager.getSync('ui', 'lastActiveTab', 'designer');
      setActiveTab(lastActiveTab);
      
      showNotification('Application loaded successfully', 'success');
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading configuration:', error);
      showNotification('Error loading application configuration', 'error');
      setIsLoading(false);
    }
  };
  
  // Save active tab to configuration
  const saveActiveTab = async (tab: string) => {
    try {
      await ConfigManager.set('ui', 'lastActiveTab', tab);
    } catch (error) {
      console.error('Error saving active tab:', error);
      showNotification('Failed to save preferences', 'warning');
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
  
  // Command bar items configuration
  const getCommandItems = (): ICommandBarItemProps[] => {
    const commonItems: ICommandBarItemProps[] = [
      {
        key: 'newProject',
        text: 'New Project',
        iconProps: { iconName: 'Add' },
        onClick: () => openModal('newProject'),
      },
      {
        key: 'openProject',
        text: 'Open Project',
        iconProps: { iconName: 'OpenFile' },
        onClick: () => openModal('openProject'),
      },
      {
        key: 'saveProject',
        text: 'Save Project',
        iconProps: { iconName: 'Save' },
        onClick: () => {
          showNotification('Project saved successfully', 'success');
        },
      },
    ];
    
    // Tab-specific commands
    switch(activeTab) {
      case 'designer':
        return [
          ...commonItems,
          {
            key: 'toggleComponentLibrary',
            text: isComponentLibraryOpen ? 'Hide Components' : 'Show Components',
            iconProps: { iconName: isComponentLibraryOpen ? 'ChromeClose' : 'Library' },
            onClick: () => setComponentLibraryOpen(!isComponentLibraryOpen),
          },
          {
            key: 'togglePropertiesPanel',
            text: isPropertiesPanelOpen ? 'Hide Properties' : 'Show Properties',
            iconProps: { iconName: isPropertiesPanelOpen ? 'ChromeClose' : 'Settings' },
            onClick: () => setPropertiesPanelOpen(!isPropertiesPanelOpen),
          },
          {
            key: 'previewApp',
            text: 'Preview',
            iconProps: { iconName: 'Play' },
            onClick: () => {
              showNotification('Application preview started', 'info');
            },
          }
        ];
      case 'blueprint':
        return [
          ...commonItems,
          {
            key: 'toggleNodeLibrary',
            text: isNodeLibraryOpen ? 'Hide Nodes' : 'Show Nodes',
            iconProps: { iconName: isNodeLibraryOpen ? 'ChromeClose' : 'Library' },
            onClick: () => setNodeLibraryOpen(!isNodeLibraryOpen),
          },
          {
            key: 'runFlow',
            text: 'Run Flow',
            iconProps: { iconName: 'Play' },
            onClick: () => {
              showNotification('Blueprint flow started', 'info');
            },
          },
          {
            key: 'validateFlow',
            text: 'Validate',
            iconProps: { iconName: 'CheckList' },
            onClick: () => {
              showNotification('Blueprint flow validated successfully', 'success');
            },
          }
        ];
      case 'data':
        return [
          ...commonItems,
          {
            key: 'newConnection',
            text: 'New Connection',
            iconProps: { iconName: 'Database' },
            onClick: () => openModal('newDbConnection'),
          },
          {
            key: 'importSchema',
            text: 'Import Schema',
            iconProps: { iconName: 'Import' },
            onClick: () => openModal('importSchema'),
          },
          {
            key: 'testConnection',
            text: 'Test Connections',
            iconProps: { iconName: 'TestAutoSolid' },
            onClick: () => {
              showNotification('All connections tested successfully', 'success');
            },
          }
        ];
      case 'llm':
        return [
          ...commonItems,
          {
            key: 'addLLMProvider',
            text: 'Add Provider',
            iconProps: { iconName: 'Add' },
            onClick: () => openModal('addLLMProvider'),
          },
          {
            key: 'testLLM',
            text: 'Test Connection',
            iconProps: { iconName: 'TestAutoSolid' },
            onClick: () => {
              showNotification('LLM connection tested successfully', 'success');
            },
          },
          {
            key: 'llmSettings',
            text: 'LLM Settings',
            iconProps: { iconName: 'Settings' },
            onClick: () => openModal('llmSettings'),
          }
        ];
      case 'plugins':
        return [
          ...commonItems,
          {
            key: 'installPlugin',
            text: 'Install Plugin',
            iconProps: { iconName: 'Installation' },
            onClick: () => openModal('installPlugin'),
          },
          {
            key: 'packagePlugin',
            text: 'Package Plugin',
            iconProps: { iconName: 'Package' },
            onClick: () => openModal('packagePlugin'),
          },
          {
            key: 'pluginMarketplace',
            text: 'Marketplace',
            iconProps: { iconName: 'Shop' },
            onClick: () => openModal('pluginMarketplace'),
          }
        ];
      default:
        return commonItems;
    }
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'designer':
        return (
          <Stack horizontal tokens={{ childrenGap: 16 }} styles={{ root: { height: 'calc(100vh - 180px)' } }}>
            {isComponentLibraryOpen && (
              <Stack.Item styles={{ root: { width: 300, overflowY: 'auto' } }}>
                <ComponentLibrary />
              </Stack.Item>
            )}
            <Stack.Item grow styles={{ root: { overflowY: 'auto' } }}>
              <Workspace />
            </Stack.Item>
            {isPropertiesPanelOpen && (
              <Stack.Item styles={{ root: { width: 300, overflowY: 'auto' } }}>
                <PropertiesPanel />
              </Stack.Item>
            )}
          </Stack>
        );
      case 'blueprint':
        return (
          <Stack horizontal tokens={{ childrenGap: 16 }} styles={{ root: { height: 'calc(100vh - 180px)' } }}>
            {isNodeLibraryOpen && (
              <Stack.Item styles={{ root: { width: 300, overflowY: 'auto' } }}>
                <NodeLibrary />
              </Stack.Item>
            )}
            <Stack.Item grow styles={{ root: { overflowY: 'auto' } }}>
              <BlueprintEditor />
            </Stack.Item>
          </Stack>
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
      case 'export':
        return (
          <ApplicationExport />
        );
      default:
        return (
          <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { height: 'calc(100vh - 180px)' } }}>
            <Text variant="large">Select a tab to get started</Text>
          </Stack>
        );
    }
  };
  
  // Render notifications
  const renderNotifications = () => {
    return notifications.map(notification => (
      <MessageBar
        key={notification.id}
        messageBarType={
          notification.type === 'error' ? MessageBarType.error :
          notification.type === 'warning' ? MessageBarType.warning :
          notification.type === 'success' ? MessageBarType.success :
          MessageBarType.info
        }
        isMultiline={false}
        dismissButtonAriaLabel="Close"
        styles={{ root: { marginBottom: 8 } }}
      >
        {notification.message}
      </MessageBar>
    ));
  };
  
  // Render modals based on activeModal
  const renderModals = () => {
    // Common dialog footer
    const dialogFooter = (
      <DialogFooter>
        <PrimaryButton text="OK" onClick={closeModal} />
        <DefaultButton text="Cancel" onClick={closeModal} />
      </DialogFooter>
    );
    
    switch (activeModal) {
      case 'newProject':
        return (
          <Dialog
            hidden={false}
            onDismiss={closeModal}
            dialogContentProps={{
              type: DialogType.normal,
              title: 'Create New Project',
              subText: 'Configure your new Anvil project'
            }}
          >
            {/* New project form would go here */}
            {dialogFooter}
          </Dialog>
        );
      case 'openProject':
        return (
          <Dialog
            hidden={false}
            onDismiss={closeModal}
            dialogContentProps={{
              type: DialogType.normal,
              title: 'Open Project',
              subText: 'Select an existing project to open'
            }}
          >
            {/* Open project form would go here */}
            {dialogFooter}
          </Dialog>
        );
      case 'settings':
        return (
          <Dialog
            hidden={false}
            onDismiss={closeModal}
            dialogContentProps={{
              type: DialogType.largeHeader,
              title: 'Settings',
            }}
            modalProps={{
              isBlocking: false,
              styles: { main: { minWidth: 800 } }
            }}
          >
            <SettingsPanel />
            <DialogFooter>
              <PrimaryButton text="Save" onClick={closeModal} />
              <DefaultButton text="Cancel" onClick={closeModal} />
            </DialogFooter>
          </Dialog>
        );
      default:
        return null;
    }
  };
  
  return (
    <Stack tokens={{ childrenGap: 0 }} styles={{ root: { height: '100vh' } }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" styles={{ root: { padding: '8px 16px', borderBottom: '1px solid #eee' } }}>
        <Text variant="xxLarge" styles={{ root: { marginRight: 20 } }}>Anvil Desktop Platform</Text>
        <CommandBar
          items={getCommandItems()}
          farItems={[
            {
              key: 'export',
              text: 'Export App',
              iconProps: { iconName: 'Export' },
              onClick: () => setActiveTab('export'),
            },
            {
              key: 'settings',
              text: 'Settings',
              iconProps: { iconName: 'Settings' },
              onClick: () => openModal('settings'),
            },
          ]}
          styles={{ root: { paddingLeft: 0 } }}
        />
      </Stack>
      
      <Stack styles={{ root: { padding: '8px 16px' } }}>
        {isLoading && (
          <Spinner size={SpinnerSize.large} label="Loading..." />
        )}
        
        <Stack tokens={{ childrenGap: 8 }} styles={{ root: { marginBottom: 16 } }}>
          {renderNotifications()}
        </Stack>
        
        <Pivot 
          selectedKey={activeTab} 
          onLinkClick={handleTabChange}
          styles={{ 
            root: { 
              marginBottom: 16,
              borderBottom: '1px solid #e8e8e8',
              paddingBottom: 8
            },
            link: {
              fontSize: '16px', 
              padding: '10px 15px'
            },
            linkIsSelected: {
              fontSize: '16px',
              padding: '10px 15px'
            }
          }}
        >
          <PivotItem headerText="Visual Designer" itemKey="designer" />
          <PivotItem headerText="Blueprint Editor" itemKey="blueprint" />
          <PivotItem headerText="Data Connectivity" itemKey="data" />
          <PivotItem headerText="LLM Integration" itemKey="llm" />
          <PivotItem headerText="Plugins" itemKey="plugins" />
          <PivotItem headerText="Export" itemKey="export" />
        </Pivot>
      </Stack>
      
      <Stack.Item grow styles={{ root: { overflow: 'hidden' } }}>
        {renderTabContent()}
      </Stack.Item>
      
      {/* Render active modal */}
      {activeModal && renderModals()}
    </Stack>
  );
};

export default MainEditor;
