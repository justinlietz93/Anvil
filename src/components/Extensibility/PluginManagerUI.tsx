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
import { PluginManager, PluginMetadata, PluginPermission } from '../../services/PluginManager';
import { ConfigManager } from '../../services/ConfigManager';

/**
 * Plugin Manager UI Component
 * 
 * Provides a user interface for managing plugins in the Anvil platform
 * 
 * @author Justin Lietz
 */
const PluginManagerUI: React.FC = () => {
  // State for plugin list
  const [plugins, setPlugins] = useState<any[]>([]);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for error message
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // State for add plugin dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [pluginName, setPluginName] = useState<string>('');
  const [pluginVersion, setPluginVersion] = useState<string>('1.0.0');
  const [pluginDescription, setPluginDescription] = useState<string>('');
  const [pluginAuthor, setPluginAuthor] = useState<string>('');
  const [pluginCode, setPluginCode] = useState<string>('');
  
  // State for plugin permissions
  const [availablePermissions, setAvailablePermissions] = useState<PluginPermission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
  // State for remove plugin dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState<boolean>(false);
  const [pluginToRemove, setPluginToRemove] = useState<string>('');
  
  // State for plugin details dialog
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false);
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  
  // Columns for the plugins list
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
      key: 'version',
      name: 'Version',
      fieldName: 'version',
      minWidth: 70,
      maxWidth: 70,
      isResizable: true
    },
    {
      key: 'author',
      name: 'Author',
      fieldName: 'author',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true
    },
    {
      key: 'description',
      name: 'Description',
      fieldName: 'description',
      minWidth: 200,
      isResizable: true
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 100,
      maxWidth: 100,
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
            text="Details" 
            onClick={() => openDetailsDialog(item.id)}
          />
          <DefaultButton 
            text="Remove" 
            onClick={() => openRemoveDialog(item.id, item.name)}
          />
        </Stack>
      )
    }
  ];
  
  // Load plugins on component mount
  useEffect(() => {
    loadPlugins();
    loadAvailablePermissions();
  }, []);
  
  // Load plugins from the PluginManager
  const loadPlugins = () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const allPlugins = PluginManager.getAllPlugins();
      
      // Transform plugins for the list
      const pluginsList = allPlugins.map(plugin => ({
        id: plugin.metadata.id,
        name: plugin.metadata.name,
        version: plugin.metadata.version,
        author: plugin.metadata.author,
        description: plugin.metadata.description,
        status: plugin.isEnabled ? 'Enabled' : 'Disabled',
        isEnabled: plugin.isEnabled,
        permissions: plugin.metadata.permissions || []
      }));
      
      setPlugins(pluginsList);
    } catch (error) {
      setErrorMessage('Failed to load plugins: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load available permissions
  const loadAvailablePermissions = () => {
    try {
      const permissions = PluginManager.getAvailablePermissions();
      setAvailablePermissions(permissions);
    } catch (error) {
      console.error('Failed to load available permissions:', error);
    }
  };
  
  // Handle adding a plugin
  const handleAddPlugin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const metadata: Omit<PluginMetadata, 'id'> = {
        name: pluginName,
        version: pluginVersion,
        description: pluginDescription,
        author: pluginAuthor,
        permissions: selectedPermissions
      };
      
      const pluginId = await PluginManager.registerPlugin(metadata, pluginCode);
      
      if (pluginId) {
        setSuccessMessage('Plugin added successfully');
        loadPlugins();
        closeAddDialog();
      } else {
        setErrorMessage('Failed to add plugin');
      }
    } catch (error) {
      setErrorMessage('Error adding plugin: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle removing a plugin
  const handleRemovePlugin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const success = await PluginManager.unregisterPlugin(pluginToRemove);
      
      if (success) {
        setSuccessMessage('Plugin removed successfully');
        loadPlugins();
        closeRemoveDialog();
      } else {
        setErrorMessage('Failed to remove plugin');
      }
    } catch (error) {
      setErrorMessage('Error removing plugin: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle toggling a plugin
  const handleTogglePlugin = async (pluginId: string, enable: boolean) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      let success = false;
      
      if (enable) {
        success = await PluginManager.enablePlugin(pluginId);
      } else {
        success = await PluginManager.disablePlugin(pluginId);
      }
      
      if (success) {
        setSuccessMessage(`Plugin ${enable ? 'enabled' : 'disabled'} successfully`);
        loadPlugins();
        
        // If we're in the details dialog, update the selected plugin
        if (selectedPlugin && selectedPlugin.id === pluginId) {
          setSelectedPlugin({
            ...selectedPlugin,
            isEnabled: enable,
            status: enable ? 'Enabled' : 'Disabled'
          });
        }
      } else {
        setErrorMessage(`Failed to ${enable ? 'enable' : 'disable'} plugin`);
      }
    } catch (error) {
      setErrorMessage(`Error ${enable ? 'enabling' : 'disabling'} plugin: ` + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle permission toggle
  const handlePermissionToggle = (permissionName: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionName]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionName));
    }
  };
  
  // Open the add plugin dialog
  const openAddDialog = () => {
    setPluginName('');
    setPluginVersion('1.0.0');
    setPluginDescription('');
    setPluginAuthor('');
    setPluginCode('');
    setSelectedPermissions([]);
    setIsAddDialogOpen(true);
  };
  
  // Close the add plugin dialog
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };
  
  // Open the remove plugin dialog
  const openRemoveDialog = (pluginId: string, pluginName: string) => {
    setPluginToRemove(pluginId);
    setIsRemoveDialogOpen(true);
  };
  
  // Close the remove plugin dialog
  const closeRemoveDialog = () => {
    setPluginToRemove('');
    setIsRemoveDialogOpen(false);
  };
  
  // Open the plugin details dialog
  const openDetailsDialog = (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    
    if (plugin) {
      setSelectedPlugin(plugin);
      setIsDetailsDialogOpen(true);
    }
  };
  
  // Close the plugin details dialog
  const closeDetailsDialog = () => {
    setSelectedPlugin(null);
    setIsDetailsDialogOpen(false);
  };
  
  // Render permission toggles
  const renderPermissionToggles = () => {
    return availablePermissions.map(permission => (
      <Stack key={permission.name} horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        <Toggle
          label={permission.name}
          checked={selectedPermissions.includes(permission.name)}
          onChange={(_, checked) => handlePermissionToggle(permission.name, checked || false)}
        />
        <Text variant="small">{permission.description}</Text>
        {permission.dangerous && (
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false} styles={{ root: { maxWidth: 'auto' } }}>
            This permission can be dangerous
          </MessageBar>
        )}
      </Stack>
    ));
  };
  
  // Render plugin details
  const renderPluginDetails = () => {
    if (!selectedPlugin) return null;
    
    return (
      <Stack tokens={{ childrenGap: 16 }}>
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Text variant="large">{selectedPlugin.name} v{selectedPlugin.version}</Text>
          <Toggle
            label="Enabled"
            checked={selectedPlugin.isEnabled}
            onChange={(_, checked) => handleTogglePlugin(selectedPlugin.id, checked || false)}
          />
        </Stack>
        
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="mediumPlus">Author: {selectedPlugin.author}</Text>
          <Text variant="mediumPlus">Description: {selectedPlugin.description}</Text>
        </Stack>
        
        <Text variant="mediumPlus">Permissions:</Text>
        {selectedPlugin.permissions.length > 0 ? (
          <Stack tokens={{ childrenGap: 8 }}>
            {selectedPlugin.permissions.map((permission: string) => {
              const permInfo = availablePermissions.find(p => p.name === permission);
              return (
                <Stack key={permission} horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
                  <Text>{permission}</Text>
                  {permInfo?.dangerous && (
                    <MessageBar messageBarType={MessageBarType.warning} isMultiline={false} styles={{ root: { maxWidth: 'auto' } }}>
                      This permission can be dangerous
                    </MessageBar>
                  )}
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Text>No permissions</Text>
        )}
      </Stack>
    );
  };
  
  return (
    <Stack tokens={{ childrenGap: 16, padding: 16 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xLarge">Plugin Manager</Text>
        <PrimaryButton text="Add Plugin" onClick={openAddDialog} />
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
        items={plugins}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible={true}
      />
      
      {/* Add Plugin Dialog */}
      <Dialog
        hidden={!isAddDialogOpen}
        onDismiss={closeAddDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Add Plugin',
          subText: 'Enter the details for the plugin'
        }}
        modalProps={{
          isBlocking: true,
          styles: { main: { maxWidth: 800 } }
        }}
      >
        <Stack tokens={{ childrenGap: 8 }}>
          <TextField
            label="Plugin Name"
            value={pluginName}
            onChange={(_, newValue) => setPluginName(newValue || '')}
            required
          />
          <TextField
            label="Version"
            value={pluginVersion}
            onChange={(_, newValue) => setPluginVersion(newValue || '')}
            required
          />
          <TextField
            label="Description"
            value={pluginDescription}
            onChange={(_, newValue) => setPluginDescription(newValue || '')}
            multiline
            rows={3}
          />
          <TextField
            label="Author"
            value={pluginAuthor}
            onChange={(_, newValue) => setPluginAuthor(newValue || '')}
            required
          />
          
          <Text variant="mediumPlus">Permissions:</Text>
          <Stack tokens={{ childrenGap: 8 }}>
            {renderPermissionToggles()}
          </Stack>
          
          <TextField
            label="Plugin Code"
            value={pluginCode}
            onChange={(_, newValue) => setPluginCode(newValue || '')}
            multiline
            rows={10}
            required
          />
        </Stack>
        <DialogFooter>
          <PrimaryButton 
            text="Add" 
            onClick={handleAddPlugin} 
            disabled={!pluginName || !pluginVersion || !pluginAuthor || !pluginCode}
          />
          <DefaultButton text="Cancel" onClick={closeAddDialog} />
        </DialogFooter>
      </Dialog>
      
      {/* Remove Plugin Dialog */}
      <Dialog
        hidden={!isRemoveDialogOpen}
        onDismiss={closeRemoveDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Remove Plugin',
          subText: 'Are you sure you want to remove this plugin?'
        }}
        modalProps={{
          isBlocking: true
        }}
      >
        <DialogFooter>
          <PrimaryButton text="Remove" onClick={handleRemovePlugin} />
          <DefaultButton text="Cancel" onClick={closeRemoveDialog} />
        </DialogFooter>
      </Dialog>
      
      {/* Plugin Details Dialog */}
      <Dialog
        hidden={!isDetailsDialogOpen}
        onDismiss={closeDetailsDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Plugin Details'
        }}
        modalProps={{
          isBlocking: false,
          styles: { main: { maxWidth: 600 } }
        }}
      >
        {renderPluginDetails()}
        <DialogFooter>
          <PrimaryButton text="Close" onClick={closeDetailsDialog} />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};

export default PluginManagerUI;
