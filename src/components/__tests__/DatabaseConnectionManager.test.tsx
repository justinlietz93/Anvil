import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DatabaseConnectionManager from '../DataConnectivity/DatabaseConnectionManager';
import { DataConnector } from '../../services/DataConnector';

// Mock the DataConnector
jest.mock('../../services/DataConnector', () => ({
  DataConnector: {
    getAllConnections: jest.fn().mockReturnValue([
      {
        id: 'conn-1',
        name: 'SQLite Test DB',
        type: 'sqlite',
        connectionString: '/path/to/test.db'
      },
      {
        id: 'conn-2',
        name: 'PostgreSQL DB',
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'testdb',
        username: 'user'
      }
    ]),
    getConnection: jest.fn().mockImplementation((id) => {
      if (id === 'conn-1') {
        return {
          id: 'conn-1',
          name: 'SQLite Test DB',
          type: 'sqlite',
          connectionString: '/path/to/test.db'
        };
      }
      return null;
    }),
    createSQLiteConnection: jest.fn().mockReturnValue('new-sqlite-conn'),
    createPostgreSQLConnection: jest.fn().mockReturnValue('new-pg-conn'),
    registerConnection: jest.fn().mockReturnValue('new-conn'),
    removeConnection: jest.fn().mockReturnValue(true),
    executeQuery: jest.fn().mockResolvedValue({ success: true, results: [{ value: 1 }] })
  }
}));

describe('DatabaseConnectionManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the database connection manager with connections list', () => {
    render(<DatabaseConnectionManager />);
    
    // Check if the title is rendered
    expect(screen.getByText('Database Connection Manager')).toBeInTheDocument();
    
    // Check if the connections are rendered
    expect(screen.getByText('SQLite Test DB')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL DB')).toBeInTheDocument();
    
    // Check if the add connection button is rendered
    expect(screen.getByText('Add Connection')).toBeInTheDocument();
  });

  test('loads connections from DataConnector on mount', () => {
    render(<DatabaseConnectionManager />);
    
    // Check if DataConnector.getAllConnections was called
    expect(DataConnector.getAllConnections).toHaveBeenCalled();
  });

  test('opens add connection dialog', async () => {
    render(<DatabaseConnectionManager />);
    
    // Click the add connection button
    fireEvent.click(screen.getByText('Add Connection'));
    
    // Check if the dialog is open
    expect(screen.getByText('Add Database Connection')).toBeInTheDocument();
    expect(screen.getByLabelText('Connection Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Connection Type')).toBeInTheDocument();
    
    // SQLite should be the default connection type
    expect(screen.getByLabelText('Database File Path')).toBeInTheDocument();
  });

  test('changes connection type in add dialog', async () => {
    render(<DatabaseConnectionManager />);
    
    // Open the add connection dialog
    fireEvent.click(screen.getByText('Add Connection'));
    
    // Change the connection type to PostgreSQL
    const typeDropdown = screen.getByLabelText('Connection Type');
    fireEvent.click(typeDropdown);
    fireEvent.click(screen.getByText('PostgreSQL'));
    
    // Check if the PostgreSQL fields are rendered
    expect(screen.getByLabelText('Host')).toBeInTheDocument();
    expect(screen.getByLabelText('Port')).toBeInTheDocument();
    expect(screen.getByLabelText('Database')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    
    // Change the connection type to MongoDB
    fireEvent.click(typeDropdown);
    fireEvent.click(screen.getByText('MongoDB'));
    
    // Check if the MongoDB fields are rendered
    expect(screen.getByLabelText('Connection String')).toBeInTheDocument();
  });

  test('adds a SQLite connection', async () => {
    render(<DatabaseConnectionManager />);
    
    // Open the add connection dialog
    fireEvent.click(screen.getByText('Add Connection'));
    
    // Fill in the connection details
    fireEvent.change(screen.getByLabelText('Connection Name'), { target: { value: 'New SQLite DB' } });
    fireEvent.change(screen.getByLabelText('Database File Path'), { target: { value: '/path/to/new.db' } });
    
    // Click the Add button
    fireEvent.click(screen.getByText('Add'));
    
    // Check if DataConnector.createSQLiteConnection was called with the correct parameters
    expect(DataConnector.createSQLiteConnection).toHaveBeenCalledWith('New SQLite DB', '/path/to/new.db');
    
    // Check if the connections are reloaded
    expect(DataConnector.getAllConnections).toHaveBeenCalledTimes(2);
    
    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText('Connection added successfully')).toBeInTheDocument();
    });
  });

  test('adds a PostgreSQL connection', async () => {
    render(<DatabaseConnectionManager />);
    
    // Open the add connection dialog
    fireEvent.click(screen.getByText('Add Connection'));
    
    // Change the connection type to PostgreSQL
    const typeDropdown = screen.getByLabelText('Connection Type');
    fireEvent.click(typeDropdown);
    fireEvent.click(screen.getByText('PostgreSQL'));
    
    // Fill in the connection details
    fireEvent.change(screen.getByLabelText('Connection Name'), { target: { value: 'New PostgreSQL DB' } });
    fireEvent.change(screen.getByLabelText('Host'), { target: { value: 'localhost' } });
    fireEvent.change(screen.getByLabelText('Port'), { target: { value: '5432' } });
    fireEvent.change(screen.getByLabelText('Database'), { target: { value: 'newdb' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'postgres' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    
    // Click the Add button
    fireEvent.click(screen.getByText('Add'));
    
    // Check if DataConnector.createPostgreSQLConnection was called with the correct parameters
    expect(DataConnector.createPostgreSQLConnection).toHaveBeenCalledWith('New PostgreSQL DB', {
      host: 'localhost',
      port: 5432,
      database: 'newdb',
      username: 'postgres',
      password: 'password'
    });
    
    // Check if the connections are reloaded
    expect(DataConnector.getAllConnections).toHaveBeenCalledTimes(2);
    
    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText('Connection added successfully')).toBeInTheDocument();
    });
  });

  test('removes a connection', async () => {
    render(<DatabaseConnectionManager />);
    
    // Find the remove button for the first connection
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    // Check if the confirmation dialog is shown
    expect(screen.getByText('Are you sure you want to remove this connection?')).toBeInTheDocument();
    
    // Click the Remove button in the dialog
    fireEvent.click(screen.getAllByText('Remove')[1]);
    
    // Check if DataConnector.removeConnection was called
    expect(DataConnector.removeConnection).toHaveBeenCalled();
    
    // Check if the connections are reloaded
    expect(DataConnector.getAllConnections).toHaveBeenCalledTimes(2);
    
    // Success message should be shown
    await waitFor(() => {
      expect(screen.getByText('Connection removed successfully')).toBeInTheDocument();
    });
  });

  test('tests a connection', async () => {
    render(<DatabaseConnectionManager />);
    
    // Find the test button for the first connection
    const testButtons = screen.getAllByText('Test');
    fireEvent.click(testButtons[0]);
    
    // Check if DataConnector.getConnection and executeQuery were called
    expect(DataConnector.getConnection).toHaveBeenCalledWith('conn-1');
    expect(DataConnector.executeQuery).toHaveBeenCalledWith('conn-1', 'SELECT 1');
    
    // Check if the test result dialog is shown
    await waitFor(() => {
      expect(screen.getByText('Connection successful!')).toBeInTheDocument();
    });
    
    // Close the dialog
    fireEvent.click(screen.getByText('Close'));
    
    // Dialog should be closed
    expect(screen.queryByText('Connection successful!')).not.toBeInTheDocument();
  });
});
