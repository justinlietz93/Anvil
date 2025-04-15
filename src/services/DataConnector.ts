import { ConfigManager } from './ConfigManager';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for database connection configuration
 */
export interface DatabaseConfig {
  id: string;
  name: string;
  type: 'sqlite' | 'postgresql' | 'mysql' | 'sqlserver' | 'mongodb';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  options?: Record<string, any>;
}

/**
 * Interface for query result
 */
export interface QueryResult {
  success: boolean;
  data?: any[];
  affectedRows?: number;
  error?: string;
}

/**
 * Data Connector service for database operations
 * 
 * @author Justin Lietz
 */
class DataConnectorClass {
  private connections: Map<string, DatabaseConfig> = new Map();
  
  /**
   * Initialize the data connector
   */
  initialize(): void {
    // Load default configurations
    ConfigManager.initialize();
  }
  
  /**
   * Register a database connection
   * 
   * @param config - The database connection configuration
   * @returns The ID of the registered connection
   */
  registerConnection(config: Omit<DatabaseConfig, 'id'>): string {
    const id = uuidv4();
    const connection: DatabaseConfig = {
      id,
      ...config
    };
    
    this.connections.set(id, connection);
    return id;
  }
  
  /**
   * Get a database connection by ID
   * 
   * @param connectionId - The ID of the connection to get
   * @returns The database connection configuration or undefined if not found
   */
  getConnection(connectionId: string): DatabaseConfig | undefined {
    return this.connections.get(connectionId);
  }
  
  /**
   * Get all database connections
   * 
   * @returns Array of all database connection configurations
   */
  getAllConnections(): DatabaseConfig[] {
    return Array.from(this.connections.values());
  }
  
  /**
   * Update a database connection
   * 
   * @param connectionId - The ID of the connection to update
   * @param config - The updated configuration
   * @returns True if the connection was updated, false otherwise
   */
  updateConnection(connectionId: string, config: Partial<Omit<DatabaseConfig, 'id'>>): boolean {
    const connection = this.connections.get(connectionId);
    
    if (!connection) {
      return false;
    }
    
    this.connections.set(connectionId, {
      ...connection,
      ...config
    });
    
    return true;
  }
  
  /**
   * Remove a database connection
   * 
   * @param connectionId - The ID of the connection to remove
   * @returns True if the connection was removed, false otherwise
   */
  removeConnection(connectionId: string): boolean {
    return this.connections.delete(connectionId);
  }
  
  /**
   * Create a SQLite connection
   * 
   * @param name - The name of the connection
   * @param path - The path to the SQLite database file
   * @returns The ID of the registered connection
   */
  createSQLiteConnection(name: string, path?: string): string {
    const defaultPath = ConfigManager.get('database', 'connections.sqlite.defaultPath', './data/database.sqlite');
    
    return this.registerConnection({
      name,
      type: 'sqlite',
      connectionString: path || defaultPath
    });
  }
  
  /**
   * Create a PostgreSQL connection
   * 
   * @param name - The name of the connection
   * @param config - The PostgreSQL connection configuration
   * @returns The ID of the registered connection
   */
  createPostgreSQLConnection(name: string, config: {
    host?: string;
    port?: number;
    database: string;
    username: string;
    password: string;
  }): string {
    const defaultHost = ConfigManager.get('database', 'connections.postgresql.defaultHost', 'localhost');
    const defaultPort = ConfigManager.get('database', 'connections.postgresql.defaultPort', 5432);
    
    return this.registerConnection({
      name,
      type: 'postgresql',
      host: config.host || defaultHost,
      port: config.port || defaultPort,
      database: config.database,
      username: config.username,
      password: config.password
    });
  }
  
  /**
   * Create a MySQL connection
   * 
   * @param name - The name of the connection
   * @param config - The MySQL connection configuration
   * @returns The ID of the registered connection
   */
  createMySQLConnection(name: string, config: {
    host?: string;
    port?: number;
    database: string;
    username: string;
    password: string;
  }): string {
    const defaultHost = ConfigManager.get('database', 'connections.mysql.defaultHost', 'localhost');
    const defaultPort = ConfigManager.get('database', 'connections.mysql.defaultPort', 3306);
    
    return this.registerConnection({
      name,
      type: 'mysql',
      host: config.host || defaultHost,
      port: config.port || defaultPort,
      database: config.database,
      username: config.username,
      password: config.password
    });
  }
  
  /**
   * Execute a query on a database
   * 
   * @param connectionId - The ID of the connection to use
   * @param query - The query to execute
   * @param params - The parameters for the query
   * @returns Promise resolving to the query result
   */
  async executeQuery(connectionId: string, query: string, params: any[] = []): Promise<QueryResult> {
    try {
      const connection = this.getConnection(connectionId);
      
      if (!connection) {
        return {
          success: false,
          error: `Connection not found: ${connectionId}`
        };
      }
      
      // This would be implemented to execute the query on the database
      // For now, we'll just return a mock result
      return {
        success: true,
        data: [{ id: 1, name: 'Test' }],
        affectedRows: 1
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Export singleton instance
export const DataConnector = new DataConnectorClass();
