import { DataConnector, DatabaseConfig, QueryResult } from '../DataConnector';
import { ConfigManager } from '../ConfigManager';

// Mock the ConfigManager
jest.mock('../ConfigManager', () => ({
  ConfigManager: {
    initialize: jest.fn(),
    get: jest.fn().mockImplementation((section, key, defaultValue) => {
      if (section === 'database' && key === 'connections.sqlite.defaultPath') {
        return './data/database.sqlite';
      }
      if (section === 'database' && key === 'connections.postgresql.defaultHost') {
        return 'localhost';
      }
      if (section === 'database' && key === 'connections.postgresql.defaultPort') {
        return 5432;
      }
      if (section === 'database' && key === 'connections.mysql.defaultHost') {
        return 'localhost';
      }
      if (section === 'database' && key === 'connections.mysql.defaultPort') {
        return 3306;
      }
      return defaultValue;
    })
  }
}));

describe('DataConnector', () => {
  beforeEach(() => {
    // Reset the DataConnector before each test
    jest.clearAllMocks();
    // Clear all connections
    (DataConnector as any).connections = new Map();
  });

  test('should initialize and load configurations', () => {
    DataConnector.initialize();
    expect(ConfigManager.initialize).toHaveBeenCalled();
  });

  test('should register a database connection', () => {
    const connectionId = DataConnector.registerConnection({
      name: 'Test Connection',
      type: 'sqlite',
      connectionString: './test.db'
    });

    expect(connectionId).toBeDefined();
    expect(typeof connectionId).toBe('string');
    
    const connection = DataConnector.getConnection(connectionId);
    expect(connection).toBeDefined();
    expect(connection?.name).toBe('Test Connection');
    expect(connection?.type).toBe('sqlite');
    expect(connection?.connectionString).toBe('./test.db');
  });

  test('should get all database connections', () => {
    const id1 = DataConnector.registerConnection({
      name: 'Connection 1',
      type: 'sqlite',
      connectionString: './db1.db'
    });

    const id2 = DataConnector.registerConnection({
      name: 'Connection 2',
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'testdb',
      username: 'user',
      password: 'pass'
    });

    const connections = DataConnector.getAllConnections();
    expect(connections.length).toBe(2);
    expect(connections[0].name).toBe('Connection 1');
    expect(connections[1].name).toBe('Connection 2');
  });

  test('should update a database connection', () => {
    const connectionId = DataConnector.registerConnection({
      name: 'Original Name',
      type: 'sqlite',
      connectionString: './original.db'
    });

    const updated = DataConnector.updateConnection(connectionId, {
      name: 'Updated Name',
      connectionString: './updated.db'
    });

    expect(updated).toBe(true);
    
    const connection = DataConnector.getConnection(connectionId);
    expect(connection?.name).toBe('Updated Name');
    expect(connection?.connectionString).toBe('./updated.db');
    expect(connection?.type).toBe('sqlite'); // Type should remain unchanged
  });

  test('should remove a database connection', () => {
    const connectionId = DataConnector.registerConnection({
      name: 'Test Connection',
      type: 'sqlite',
      connectionString: './test.db'
    });

    expect(DataConnector.getConnection(connectionId)).toBeDefined();
    
    const removed = DataConnector.removeConnection(connectionId);
    expect(removed).toBe(true);
    expect(DataConnector.getConnection(connectionId)).toBeUndefined();
  });

  test('should create a SQLite connection with default path from config', () => {
    const connectionId = DataConnector.createSQLiteConnection('SQLite Test');
    
    const connection = DataConnector.getConnection(connectionId);
    expect(connection?.name).toBe('SQLite Test');
    expect(connection?.type).toBe('sqlite');
    expect(connection?.connectionString).toBe('./data/database.sqlite'); // From mocked ConfigManager
  });

  test('should create a PostgreSQL connection with defaults from config', () => {
    const connectionId = DataConnector.createPostgreSQLConnection('PostgreSQL Test', {
      database: 'testdb',
      username: 'user',
      password: 'pass'
    });
    
    const connection = DataConnector.getConnection(connectionId);
    expect(connection?.name).toBe('PostgreSQL Test');
    expect(connection?.type).toBe('postgresql');
    expect(connection?.host).toBe('localhost'); // From mocked ConfigManager
    expect(connection?.port).toBe(5432); // From mocked ConfigManager
    expect(connection?.database).toBe('testdb');
    expect(connection?.username).toBe('user');
    expect(connection?.password).toBe('pass');
  });

  test('should execute a query successfully', async () => {
    const connectionId = DataConnector.registerConnection({
      name: 'Test Connection',
      type: 'sqlite',
      connectionString: './test.db'
    });

    const result = await DataConnector.executeQuery(connectionId, 'SELECT * FROM test');
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data?.length).toBeGreaterThan(0);
    expect(result.affectedRows).toBeDefined();
  });

  test('should handle query execution with invalid connection ID', async () => {
    const result = await DataConnector.executeQuery('invalid-id', 'SELECT * FROM test');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Connection not found');
  });
});
