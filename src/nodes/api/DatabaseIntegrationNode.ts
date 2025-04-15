/**
 * Database Integration Node - Connect API endpoints to database operations
 * 
 * @fileoverview Implementation of database integration node following
 * APEX standard for max 500 lines per file (Rule #5: FILE-SIZE)
 * Compliant with Rule #26 (CONF-EXT) and Rule #59 (IMPL-PLACE)
 */

import { APINodeDefinition } from '../APINodeTypes';

export const DatabaseIntegrationNode: APINodeDefinition = {
  id: 'api-database-integration',
  type: 'api',
  category: 'API',
  name: 'Database Integration',
  description: 'Connect API handlers to database operations',
  
  inputs: [
    {
      id: 'connectionId',
      name: 'Connection ID',
      type: 'string',
      description: 'The ID of the database connection to use',
      required: true,
      defaultValue: ''
    },
    {
      id: 'operation',
      name: 'Operation',
      type: 'string',
      description: 'Database operation (query, insert, update, delete)',
      required: true,
      defaultValue: 'query'
    },
    {
      id: 'collection',
      name: 'Collection/Table',
      type: 'string',
      description: 'The collection or table to operate on',
      required: true,
      defaultValue: 'users'
    },
    {
      id: 'query',
      name: 'Query/Filter',
      type: 'object',
      description: 'The query or filter criteria',
      required: false,
      defaultValue: {}
    },
    {
      id: 'data',
      name: 'Data',
      type: 'any',
      description: 'Data for insert or update operations',
      required: false,
      defaultValue: null
    },
    {
      id: 'options',
      name: 'Options',
      type: 'object',
      description: 'Additional operation options (limit, sort, etc.)',
      required: false,
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
      id: 'result',
      name: 'Result',
      type: 'any',
      description: 'The operation result (documents, count, etc.)',
      required: false,
      defaultValue: null
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the operation was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the operation failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      // Validate inputs in accordance with Rule #23 (DATA-CHECKALL)
      const connectionId = inputs.connectionId;
      if (!connectionId) {
        return {
          flow: true,
          result: null,
          success: false,
          error: 'No database connection ID provided'
        };
      }
      
      const operation = (inputs.operation || 'query').toLowerCase();
      const collection = inputs.collection;
      if (!collection) {
        return {
          flow: true,
          result: null,
          success: false,
          error: 'No collection/table specified'
        };
      }
      
      const query = inputs.query || {};
      const documentData = inputs.data || {};
      const options = inputs.options || {};
      
      // Get the database connector from the context using DataConnector service
      // in accordance with Rule #26 (CONF-EXT)
      const { DataConnector } = await import('../../services/DataConnector');
      const dbConnection = await DataConnector.getConnection(connectionId);
      
      if (!dbConnection) {
        return {
          flow: true,
          result: null,
          success: false,
          error: `Database connection '${connectionId}' not found`
        };
      }
      
      let result;
      
      // Perform operation based on the specified type
      // with appropriate error handling per Rule #61 (ERR-HDL)
      switch (operation) {
        case 'query': {
          // Build SQL query or use collection name based on database type
          let sqlQuery = '';
          const params: any[] = [];
          
          if (dbConnection.type === 'mongodb') {
            // For MongoDB-like databases, we'd use the DataConnector's executeQuery with a special format
            // But since there's no direct MongoDB query method, we translate to the available API
            result = await DataConnector.executeQuery(
              connectionId,
              `FIND_FROM_${collection}`,
              [JSON.stringify(query), JSON.stringify(options)]
            );
          } else {
            // For SQL databases, build a proper SQL query
            sqlQuery = `SELECT * FROM ${collection} WHERE `;
            
            if (Object.keys(query).length === 0) {
              sqlQuery = `SELECT * FROM ${collection}`;
            } else {
              // Simple query builder (would be more sophisticated in production)
              const conditions = [];
              for (const key in query) {
                conditions.push(`${key} = ?`);
                params.push(query[key]);
              }
              
              sqlQuery += conditions.join(' AND ');
            }
            
            // Apply options like limit, offset if provided
            if (options.limit) {
              sqlQuery += ` LIMIT ${options.limit}`;
            }
            
            if (options.offset) {
              sqlQuery += ` OFFSET ${options.offset}`;
            }
            
            result = await DataConnector.executeQuery(connectionId, sqlQuery, params);
          }
          break;
        }
          
        case 'insert': {
          if (!inputs.data) {
            return {
              flow: true,
              result: null,
              success: false,
              error: 'No data provided for insert operation'
            };
          }
          
          if (dbConnection.type === 'mongodb') {
            // For MongoDB-like databases
            result = await DataConnector.executeQuery(
              connectionId,
              `INSERT_INTO_${collection}`,
              [JSON.stringify(documentData)]
            );
          } else {
            // For SQL databases
            const columns = Object.keys(documentData);
            const placeholders = Array(columns.length).fill('?').join(', ');
            const values = Object.values(documentData);
            
            const sqlQuery = `INSERT INTO ${collection} (${columns.join(', ')}) VALUES (${placeholders})`;
            result = await DataConnector.executeQuery(connectionId, sqlQuery, values);
          }
          break;
        }
          
        case 'update': {
          if (!inputs.data) {
            return {
              flow: true,
              result: null,
              success: false,
              error: 'No data provided for update operation'
            };
          }
          
          if (dbConnection.type === 'mongodb') {
            // For MongoDB-like databases
            result = await DataConnector.executeQuery(
              connectionId,
              `UPDATE_${collection}`,
              [JSON.stringify(query), JSON.stringify(documentData)]
            );
          } else {
            // For SQL databases
            const setClause = Object.keys(documentData)
              .map(key => `${key} = ?`)
              .join(', ');
            
            let whereClause = '';
            const params = [...Object.values(documentData)];
            
            if (Object.keys(query).length > 0) {
              const conditions = Object.keys(query)
                .map(key => `${key} = ?`);
              
              whereClause = ` WHERE ${conditions.join(' AND ')}`;
              params.push(...Object.values(query));
            }
            
            const sqlQuery = `UPDATE ${collection} SET ${setClause}${whereClause}`;
            result = await DataConnector.executeQuery(connectionId, sqlQuery, params);
          }
          break;
        }
          
        case 'delete': {
          if (dbConnection.type === 'mongodb') {
            // For MongoDB-like databases
            result = await DataConnector.executeQuery(
              connectionId,
              `DELETE_FROM_${collection}`,
              [JSON.stringify(query)]
            );
          } else {
            // For SQL databases
            let whereClause = '';
            const params: any[] = [];
            
            if (Object.keys(query).length > 0) {
              const conditions = Object.keys(query)
                .map(key => `${key} = ?`);
              
              whereClause = ` WHERE ${conditions.join(' AND ')}`;
              params.push(...Object.values(query));
            }
            
            const sqlQuery = `DELETE FROM ${collection}${whereClause}`;
            result = await DataConnector.executeQuery(connectionId, sqlQuery, params);
          }
          break;
        }
          
        default:
          return {
            flow: true,
            result: null,
            success: false,
            error: `Unsupported database operation: ${operation}`
          };
      }
      
      return {
        flow: true,
        result: result?.data || result,
        success: result?.success || false,
        error: result?.error || ''
      };
    } catch (error) {
      // Proper error handling per Rule #61 (ERR-HDL)
      return {
        flow: true,
        result: null,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};