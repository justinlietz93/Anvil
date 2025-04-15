import { ConfigManager } from '../services/ConfigManager';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for database node definitions
 */
export interface DatabaseNodeDefinition {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  inputs: any[];
  outputs: any[];
  compute: Function;
}

/**
 * Database Query Node - Execute a SQL query
 */
export const DatabaseQueryNode: DatabaseNodeDefinition = {
  id: 'database-query',
  type: 'database',
  category: 'Database',
  name: 'Query',
  description: 'Execute a SQL query on a database',
  
  inputs: [
    {
      id: 'connectionId',
      name: 'Connection ID',
      type: 'string',
      description: 'The ID of the database connection',
      required: true,
      defaultValue: ''
    },
    {
      id: 'query',
      name: 'Query',
      type: 'string',
      description: 'The SQL query to execute',
      required: true,
      defaultValue: 'SELECT * FROM table'
    },
    {
      id: 'params',
      name: 'Parameters',
      type: 'array',
      description: 'The parameters for the query',
      required: false,
      defaultValue: []
    },
    {
      id: 'limit',
      name: 'Limit',
      type: 'number',
      description: 'Maximum number of results to return',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'database', 'defaultLimit'], 100)
    },
    {
      id: 'offset',
      name: 'Offset',
      type: 'number',
      description: 'Number of results to skip',
      required: false,
      defaultValue: ConfigManager.getNested('nodes', ['defaults', 'database', 'defaultOffset'], 0)
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'results',
      name: 'Results',
      type: 'array',
      description: 'The query results',
      required: false,
      defaultValue: []
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the query was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the query failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { DataConnector } = await import('../services/DataConnector');
      
      const connectionId = inputs.connectionId;
      const query = inputs.query;
      const params = inputs.params || [];
      const limit = inputs.limit || ConfigManager.getNested('nodes', ['defaults', 'database', 'defaultLimit'], 100);
      const offset = inputs.offset || ConfigManager.getNested('nodes', ['defaults', 'database', 'defaultOffset'], 0);
      
      if (!connectionId) {
        return {
          flow: true,
          results: [],
          success: false,
          error: 'No connection ID provided'
        };
      }
      
      if (!query) {
        return {
          flow: true,
          results: [],
          success: false,
          error: 'No query provided'
        };
      }
      
      // Add limit and offset to the query if not already present
      let modifiedQuery = query;
      if (!modifiedQuery.toLowerCase().includes('limit') && limit > 0) {
        modifiedQuery += ` LIMIT ${limit}`;
      }
      
      if (!modifiedQuery.toLowerCase().includes('offset') && offset > 0) {
        modifiedQuery += ` OFFSET ${offset}`;
      }
      
      const result = await DataConnector.executeQuery(connectionId, modifiedQuery, params);
      
      return {
        flow: true,
        results: result.data || [],
        success: result.success,
        error: result.error || ''
      };
    } catch (error) {
      return {
        flow: true,
        results: [],
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * Database Insert Node - Insert data into a table
 */
export const DatabaseInsertNode: DatabaseNodeDefinition = {
  id: 'database-insert',
  type: 'database',
  category: 'Database',
  name: 'Insert',
  description: 'Insert data into a database table',
  
  inputs: [
    {
      id: 'connectionId',
      name: 'Connection ID',
      type: 'string',
      description: 'The ID of the database connection',
      required: true,
      defaultValue: ''
    },
    {
      id: 'table',
      name: 'Table',
      type: 'string',
      description: 'The table to insert into',
      required: true,
      defaultValue: ''
    },
    {
      id: 'data',
      name: 'Data',
      type: 'object',
      description: 'The data to insert as key-value pairs',
      required: true,
      defaultValue: {}
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the insert was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'id',
      name: 'ID',
      type: 'any',
      description: 'The ID of the inserted record',
      required: false,
      defaultValue: null
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the insert failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { DataConnector } = await import('../services/DataConnector');
      
      const connectionId = inputs.connectionId;
      const table = inputs.table;
      const insertData = inputs.data || {};
      
      if (!connectionId) {
        return {
          flow: true,
          success: false,
          id: null,
          error: 'No connection ID provided'
        };
      }
      
      if (!table) {
        return {
          flow: true,
          success: false,
          id: null,
          error: 'No table provided'
        };
      }
      
      if (Object.keys(insertData).length === 0) {
        return {
          flow: true,
          success: false,
          id: null,
          error: 'No data provided'
        };
      }
      
      // Build the insert query
      const columns = Object.keys(insertData);
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(insertData);
      
      const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
      
      const result = await DataConnector.executeQuery(connectionId, query, values);
      
      return {
        flow: true,
        success: result.success,
        id: result.data && result.data[0] ? result.data[0].id : null,
        error: result.error || ''
      };
    } catch (error) {
      return {
        flow: true,
        success: false,
        id: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * Database Update Node - Update data in a table
 */
export const DatabaseUpdateNode: DatabaseNodeDefinition = {
  id: 'database-update',
  type: 'database',
  category: 'Database',
  name: 'Update',
  description: 'Update data in a database table',
  
  inputs: [
    {
      id: 'connectionId',
      name: 'Connection ID',
      type: 'string',
      description: 'The ID of the database connection',
      required: true,
      defaultValue: ''
    },
    {
      id: 'table',
      name: 'Table',
      type: 'string',
      description: 'The table to update',
      required: true,
      defaultValue: ''
    },
    {
      id: 'data',
      name: 'Data',
      type: 'object',
      description: 'The data to update as key-value pairs',
      required: true,
      defaultValue: {}
    },
    {
      id: 'where',
      name: 'Where',
      type: 'object',
      description: 'The where conditions as key-value pairs',
      required: true,
      defaultValue: {}
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the update was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'affectedRows',
      name: 'Affected Rows',
      type: 'number',
      description: 'The number of affected rows',
      required: false,
      defaultValue: 0
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the update failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { DataConnector } = await import('../services/DataConnector');
      
      const connectionId = inputs.connectionId;
      const table = inputs.table;
      const updateData = inputs.data || {};
      const whereData = inputs.where || {};
      
      if (!connectionId) {
        return {
          flow: true,
          success: false,
          affectedRows: 0,
          error: 'No connection ID provided'
        };
      }
      
      if (!table) {
        return {
          flow: true,
          success: false,
          affectedRows: 0,
          error: 'No table provided'
        };
      }
      
      if (Object.keys(updateData).length === 0) {
        return {
          flow: true,
          success: false,
          affectedRows: 0,
          error: 'No data provided'
        };
      }
      
      if (Object.keys(whereData).length === 0) {
        return {
          flow: true,
          success: false,
          affectedRows: 0,
          error: 'No where conditions provided'
        };
      }
      
      // Build the update query
      const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const whereClause = Object.keys(whereData).map(key => `${key} = ?`).join(' AND ');
      const values = [...Object.values(updateData), ...Object.values(whereData)];
      
      const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
      
      const result = await DataConnector.executeQuery(connectionId, query, values);
      
      return {
        flow: true,
        success: result.success,
        affectedRows: result.affectedRows || 0,
        error: result.error || ''
      };
    } catch (error) {
      return {
        flow: true,
        success: false,
        affectedRows: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

/**
 * Database Delete Node - Delete data from a table
 */
export const DatabaseDeleteNode: DatabaseNodeDefinition = {
  id: 'database-delete',
  type: 'database',
  category: 'Database',
  name: 'Delete',
  description: 'Delete data from a database table',
  
  inputs: [
    {
      id: 'connectionId',
      name: 'Connection ID',
      type: 'string',
      description: 'The ID of the database connection',
      required: true,
      defaultValue: ''
    },
    {
      id: 'table',
      name: 'Table',
      type: 'string',
      description: 'The table to delete from',
      required: true,
      defaultValue: ''
    },
    {
      id: 'where',
      name: 'Where',
      type: 'object',
      description: 'The where conditions as key-value pairs',
      required: true,
      defaultValue: {}
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true,
      defaultValue: null
    }
  ],
  
  outputs: [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output',
      required: false,
      defaultValue: null
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the delete was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'affectedRows',
      name: 'Affected Rows',
      type: 'number',
      description: 'The number of affected rows',
      required: false,
      defaultValue: 0
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the delete failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const { DataConnector } = await import('../services/DataConnector');
      
      const connectionId = inputs.connectionId;
      const table = inputs.table;
      const whereData = inputs.where || {};
      
      if (!connectionId) {
        return {
          flow: true,
          success: false,
          affectedRows: 0,
          error: 'No connection ID provided'
        };
      }
      
      if (!table) {
        return {
          flow: true,
          success: false,
          affectedRows: 0,
          error: 'No table provided'
        };
      }
      
      if (Object.keys(whereData).length === 0) {
        return {
          flow: true,
          success: false,
          affectedRows: 0,
          error: 'No where conditions provided'
        };
      }
      
      // Build the delete query with parameterized values for security
      const whereClause = Object.keys(whereData).map(key => `${key} = ?`).join(' AND ');
      const values = Object.values(whereData);
      
      const query = `DELETE FROM ${table} WHERE ${whereClause}`;
      
      const result = await DataConnector.executeQuery(connectionId, query, values);
      
      return {
        flow: true,
        success: result.success,
        affectedRows: result.affectedRows || 0,
        error: result.error || ''
      };
    } catch (error) {
      return {
        flow: true,
        success: false,
        affectedRows: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

// Export all database nodes
export const DatabaseNodes = [
  DatabaseQueryNode,
  DatabaseInsertNode,
  DatabaseUpdateNode,
  DatabaseDeleteNode
];
