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
  Label
} from '@fluentui/react';
import { DataConnector, DatabaseConfig } from '../../services/DataConnector';
import { ConfigManager } from '../../services/ConfigManager';

/**
 * Database Connection Manager Component
 * 
 * Provides a user interface for managing database connections in the Anvil platform
 * 
 * @author Justin Lietz
 */
const DatabaseConnectionManager: React.FC = () => {
  // State for connection list
  const [connections, setConnections] = useState<any[]>([]);
  
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for error message
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // State for success message
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // State for add connection dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [connectionName, setConnectionName] = useState<string>('');
  const [connectionType, setConnectionType] = useState<string>('sqlite');
  const [connectionPath, setConnectionPath] = useState<string>('');
  const [connectionHost, setConnectionHost] = useState<string>('localhost');
  const [connectionPort, setConnectionPort] = useState<string>('');
  const [connectionDatabase, setConnectionDatabase] = useState<string>('');
  const [connectionUsername, setConnectionUsername] = useState<string>('');
  const [connectionPassword, setConnectionPassword] = useState<string>('');
  
  // State for remove connection dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState<boolean>(false);
  const [connectionToRemove, setConnectionToRemove] = useState<string>('');
  
  // State for test connection dialog
  const [isTestDialogOpen, setIsTestDialogOpen] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');
  const [testSuccess, setTestSuccess] = useState<boolean>(false);
  
  // Connection type options
  const connectionTypeOptions: IDropdownOption[] = [
    { key: 'sqlite', text: 'SQLite' },
    { key: 'postgresql', text: 'PostgreSQL' },
    { key: 'mysql', text: 'MySQL' },
    { key: 'sqlserver', text: 'SQL Server' },
    { key: 'mongodb', text: 'MongoDB' }
  ];
  
  // Columns for the connections list
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
      key: 'details',
      name: 'Connection Details',
      fieldName: 'details',
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
            onClick={() => handleTestConnection(item.id)}
          />
          <DefaultButton 
            text="Remove" 
            onClick={() => openRemoveDialog(item.id, item.name)}
          />
        </Stack>
      )
    }
  ];
  
  // Load connections on component mount
  useEffect(() => {
    loadConnections();
    loadSavedConnectionsFromConfig();
  }, []);
  
  // Load connections from the DataConnector
  const loadConnections = () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const allConnections = DataConnector.getAllConnections();
      
      // Transform connections for the list
      const connectionsList = allConnections.map(connection => ({
        id: connection.id,
        name: connection.name,
        type: connection.type,
        details: getConnectionDetails(connection)
      }));
      
      setConnections(connectionsList);
    } catch (error) {
      setErrorMessage('Failed to load connections: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load saved connections from secure configuration
  const loadSavedConnectionsFromConfig = async () => {
    try {
      // Get all saved connections from the configuration
      const savedConnections = ConfigManager.getSection('database_connections');
      
      // Register each saved connection
      for (const key in savedConnections) {
        if (typeof savedConnections[key] === 'object' && savedConnections[key] !== null) {
          const connectionConfig = savedConnections[key] as any;
          
          // Skip if this connection is already registered
          if (DataConnector.getAllConnections().some(conn => conn.id === connectionConfig.id)) {
            continue;
          }
          
          // For connections with passwords, retrieve them securely
          if (connectionConfig.type !== 'sqlite' && connectionConfig.type !== 'mongodb') {
            // Get password securely
            const passwordKey = `${connectionConfig.id}_password`;
            const password = await ConfigManager.get('database_connections', passwordKey, '');
            
            // Register the connection with the secure password
            DataConnector.registerConnection({
              ...connectionConfig,
              password
            });
          } else {
            // Register the connection as is
            DataConnector.registerConnection(connectionConfig);
          }
        }
      }
      
      // Refresh the connections list
      loadConnections();
    } catch (error) {
      console.error('Error loading saved connections:', error);
    }
  };
  
  // Get connection details as a string
  const getConnectionDetails = (connection: DatabaseConfig): string => {
    switch (connection.type) {
      case 'sqlite':
        return `Path: ${connection.connectionString}`;
      case 'postgresql':
      case 'mysql':
      case 'sqlserver':
        return `Host: ${connection.host}:${connection.port}, Database: ${connection.database}`;
      case 'mongodb':
        return `Connection String: ${connection.connectionString}`;
      default:
        return '';
    }
  };
  
  // Handle adding a connection
  const handleAddConnection = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      let connectionId = '';
      
      switch (connectionType) {
        case 'sqlite':
          connectionId = DataConnector.createSQLiteConnection(connectionName, connectionPath);
          break;
        case 'postgresql':
          connectionId = DataConnector.createPostgreSQLConnection(connectionName, {
            host: connectionHost,
            port: parseInt(connectionPort),
            database: connectionDatabase,
            username: connectionUsername,
            password: connectionPassword
          });
          break;
        case 'mysql':
          connectionId = DataConnector.registerConnection({
            name: connectionName,
            type: 'mysql',
            host: connectionHost,
            port: parseInt(connectionPort),
            database: connectionDatabase,
            username: connectionUsername,
            password: connectionPassword
          });
          break;
        case 'sqlserver':
          connectionId = DataConnector.registerConnection({
            name: connectionName,
            type: 'sqlserver',
            host: connectionHost,
            port: parseInt(connectionPort),
            database: connectionDatabase,
            username: connectionUsername,
            password: connectionPassword
          });
          break;
        case 'mongodb':
          connectionId = DataConnector.registerConnection({
            name: connectionName,
            type: 'mongodb',
            connectionString: connectionPath
          });
          break;
      }
      
      if (connectionId) {
        // Save the connection to secure configuration
        await saveConnectionToConfig(connectionId);
        
        setSuccessMessage('Connection added successfully');
        loadConnections();
        closeAddDialog();
      } else {
        setErrorMessage('Failed to add connection');
      }
    } catch (error) {
      setErrorMessage('Error adding connection: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save connection to secure configuration
  const saveConnectionToConfig = async (connectionId: string) => {
    try {
      const connection = DataConnector.getConnection(connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }
      
      // Create a copy of the connection without the password
      const connectionToSave = { ...connection };
      
      // For connections with passwords, store them securely
      if (connection.password && (
          connection.type === 'postgresql' || 
          connection.type === 'mysql' || 
          connection.type === 'sqlserver'
      )) {
        // Store password securely
        const passwordKey = `${connectionId}_password`;
        await ConfigManager.set('database_connections', passwordKey, connection.password);
        
        // Remove password from the connection object
        delete connectionToSave.password;
      }
      
      // Save the connection configuration
      await ConfigManager.set('database_connections', connectionId, connectionToSave);
    } catch (error) {
      console.error('Error saving connection to config:', error);
      throw error;
    }
  };
  
  // Handle removing a connection
  const handleRemoveConnection = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const connection = DataConnector.getConnection(connectionToRemove);
      const success = DataConnector.removeConnection(connectionToRemove);
      
      if (success) {
        // Remove from secure configuration
        if (connection) {
          // Remove the connection
          await ConfigManager.set('database_connections', connectionToRemove, undefined);
          
          // Remove password if it exists
          if (connection.password) {
            const passwordKey = `${connectionToRemove}_password`;
            await ConfigManager.deleteSensitiveValue('database_connections', passwordKey);
          }
        }
        
        setSuccessMessage('Connection removed successfully');
        loadConnections();
        closeRemoveDialog();
      } else {
        setErrorMessage('Failed to remove connection');
      }
    } catch (error) {
      setErrorMessage('Error removing connection: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle testing a connection
  const handleTestConnection = async (connectionId: string) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // This would be implemented to test the connection
      // For now, we'll just simulate a test
      const connection = DataConnector.getConnection(connectionId);
      
      if (!connection) {
        throw new Error('Connection not found');
      }
      
      // Simulate a test query
      const result = await DataConnector.executeQuery(connectionId, 'SELECT 1');
      
      setTestSuccess(result.success);
      setTestResult(result.success ? 'Connection successful!' : `Connection failed: ${result.error}`);
      setIsTestDialogOpen(true);
    } catch (error) {
      setErrorMessage('Error testing connection: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Open the add connection dialog
  const openAddDialog = () => {
    setConnectionName('');
    setConnectionType('sqlite');
    setConnectionPath('');
    setConnectionHost('localhost');
    setConnectionPort('');
    setConnectionDatabase('');
    setConnectionUsername('');
    setConnectionPassword('');
    setIsAddDialogOpen(true);
  };
  
  // Close the add connection dialog
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };
  
  // Open the remove connection dialog
  const openRemoveDialog = (connectionId: string, connectionName: string) => {
    setConnectionToRemove(connectionId);
    setIsRemoveDialogOpen(true);
  };
  
  // Close the remove connection dialog
  const closeRemoveDialog = () => {
    setConnectionToRemove('');
    setIsRemoveDialogOpen(false);
  };
  
  // Close the test connection dialog
  const closeTestDialog = () => {
    setIsTestDialogOpen(false);
  };
  
  // Render connection form fields based on connection type
  const renderConnectionFields = () => {
    switch (connectionType) {
      case 'sqlite':
        return (
          <TextField
            label="Database File Path"
            value={connectionPath}
            onChange={(_, newValue) => setConnectionPath(newValue || '')}
            required
          />
        );
      case 'mongodb':
        return (
          <TextField
            label="Connection String"
            value={connectionPath}
            onChange={(_, newValue) => setConnectionPath(newValue || '')}
            required
          />
        );
      case 'postgresql':
      case 'mysql':
      case 'sqlserver':
        return (
          <Stack tokens={{ childrenGap: 8 }}>
            <TextField
              label="Host"
              value={connectionHost}
              onChange={(_, newValue) => setConnectionHost(newValue || '')}
              required
            />
            <TextField
              label="Port"
              value={connectionPort}
              onChange={(_, newValue) => setConnectionPort(newValue || '')}
              required
              type="number"
            />
            <TextField
              label="Database"
              value={connectionDatabase}
              onChange={(_, newValue) => setConnectionDatabase(newValue || '')}
              required
            />
            <TextField
              label="Username"
              value={connectionUsername}
              onChange={(_, newValue) => setConnectionUsername(newValue || '')}
              required
            />
            <TextField
              label="Password"
              value={connectionPassword}
              onChange={(_, newValue) => setConnectionPassword(newValue || '')}
              type="password"
              required
            />
          </Stack>
        );
      default:
        return null;
    }
  };
  
  return (
    <Stack tokens={{ childrenGap: 16, padding: 16 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <Text variant="xLarge">Database Connection Manager</Text>
        <PrimaryButton text="Add Connection" onClick={openAddDialog} />
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
        items={connections}
        columns={columns}
        layoutMode={DetailsListLayoutMode.justified}
        selectionMode={SelectionMode.none}
        isHeaderVisible={true}
      />
      
      {/* Add Connection Dialog */}
      <Dialog
        hidden={!isAddDialogOpen}
        onDismiss={closeAddDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Add Database Connection',
          subText: 'Enter the details for the database connection'
        }}
        modalProps={{
          isBlocking: true
        }}
      >
        <Stack tokens={{ childrenGap: 8 }}>
          <TextField
            label="Connection Name"
            value={connectionName}
            onChange={(_, newValue) => setConnectionName(newValue || '')}
            required
          />
          <Dropdown
            label="Connection Type"
            selectedKey={connectionType}
            options={connectionTypeOptions}
            onChange={(_, option) => option && setConnectionType(option.key as string)}
            required
          />
          {renderConnectionFields()}
        </Stack>
        <DialogFooter>
          <PrimaryButton 
            text="Add" 
            onClick={handleAddConnection} 
            disabled={!connectionName || (connectionType === 'sqlite' && !connectionPath)}
          />
          <DefaultButton text="Cancel" onClick={closeAddDialog} />
        </DialogFooter>
      </Dialog>
      
      {/* Remove Connection Dialog */}
      <Dialog
        hidden={!isRemoveDialogOpen}
        onDismiss={closeRemoveDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Remove Connection',
          subText: 'Are you sure you want to remove this connection?'
        }}
        modalProps={{
          isBlocking: true
        }}
      >
        <DialogFooter>
          <PrimaryButton text="Remove" onClick={handleRemoveConnection} />
          <DefaultButton text="Cancel" onClick={closeRemoveDialog} />
        </DialogFooter>
      </Dialog>
      
      {/* Test Connection Dialog */}
      <Dialog
        hidden={!isTestDialogOpen}
        onDismiss={closeTestDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Connection Test Result'
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

export default DatabaseConnectionManager;
