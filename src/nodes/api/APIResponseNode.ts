/**
 * API Response Node - Send responses for API requests
 * 
 * @fileoverview Implementation of API response node following
 * APEX standard for max 500 lines per file (Rule #5: FILE-SIZE)
 */

import { APINodeDefinition } from '../APINodeTypes';

export const APIResponseNode: APINodeDefinition = {
  id: 'api-response',
  type: 'api',
  category: 'API',
  name: 'API Response',
  description: 'Send a response for an API request',
  
  inputs: [
    {
      id: 'request',
      name: 'Request',
      type: 'object',
      description: 'The request object to respond to',
      required: true,
      defaultValue: null
    },
    {
      id: 'statusCode',
      name: 'Status Code',
      type: 'number',
      description: 'The HTTP status code to send',
      required: false,
      defaultValue: 200
    },
    {
      id: 'body',
      name: 'Response Body',
      type: 'any',
      description: 'The data to send in the response',
      required: false,
      defaultValue: {}
    },
    {
      id: 'headers',
      name: 'Headers',
      type: 'object',
      description: 'Additional headers to include in the response',
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
      description: 'Execution flow output (after sending response)',
      required: false,
      defaultValue: null
    },
    {
      id: 'sent',
      name: 'Sent',
      type: 'boolean',
      description: 'Whether the response was sent successfully',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the response failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const request = inputs.request;
      const statusCode = inputs.statusCode || 200;
      const body = inputs.body !== undefined ? inputs.body : {};
      const headers = inputs.headers || {};
      
      if (!request || !request.res) {
        return {
          flow: true,
          sent: false,
          error: 'Invalid request object'
        };
      }
      
      const res = request.res;
      
      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      
      // Send response
      res.status(statusCode).send(body);
      
      return {
        flow: true,
        sent: true,
        error: ''
      };
    } catch (error) {
      return {
        flow: true,
        sent: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};