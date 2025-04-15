/**
 * API Request Node - Make HTTP requests to external APIs
 * 
 * @fileoverview Implementation of API request node following
 * APEX standard for max 500 lines per file (Rule #5: FILE-SIZE)
 */

import { APINodeDefinition } from '../APINodeTypes';

export const APIRequestNode: APINodeDefinition = {
  id: 'api-request',
  type: 'api',
  category: 'API',
  name: 'API Request',
  description: 'Make HTTP requests to external APIs',
  
  inputs: [
    {
      id: 'url',
      name: 'URL',
      type: 'string',
      description: 'The URL to make the request to',
      required: true,
      defaultValue: 'https://api.example.com/data'
    },
    {
      id: 'method',
      name: 'Method',
      type: 'string',
      description: 'The HTTP method to use (GET, POST, PUT, DELETE)',
      required: true,
      defaultValue: 'GET'
    },
    {
      id: 'headers',
      name: 'Headers',
      type: 'object',
      description: 'The HTTP headers to include',
      required: false,
      defaultValue: { 'Content-Type': 'application/json' }
    },
    {
      id: 'body',
      name: 'Body',
      type: 'any',
      description: 'The request body (for POST, PUT)',
      required: false,
      defaultValue: null
    },
    {
      id: 'params',
      name: 'Query Params',
      type: 'object',
      description: 'The URL query parameters',
      required: false,
      defaultValue: {}
    },
    {
      id: 'timeout',
      name: 'Timeout',
      type: 'number',
      description: 'Request timeout in milliseconds',
      required: false,
      defaultValue: 5000
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
      id: 'response',
      name: 'Response',
      type: 'object',
      description: 'The API response data',
      required: false,
      defaultValue: {}
    },
    {
      id: 'status',
      name: 'Status',
      type: 'number',
      description: 'The HTTP status code',
      required: false,
      defaultValue: 0
    },
    {
      id: 'headers',
      name: 'Response Headers',
      type: 'object',
      description: 'The response headers',
      required: false,
      defaultValue: {}
    },
    {
      id: 'success',
      name: 'Success',
      type: 'boolean',
      description: 'Whether the request was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if the request failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const url = inputs.url;
      const method = (inputs.method || 'GET').toUpperCase();
      const headers = inputs.headers || { 'Content-Type': 'application/json' };
      const body = inputs.body;
      const params = inputs.params || {};
      const timeout = inputs.timeout || 5000;
      
      if (!url) {
        return {
          flow: true,
          response: {},
          status: 0,
          headers: {},
          success: false,
          error: 'No URL provided'
        };
      }
      
      // Build URL with query parameters
      let finalUrl = url;
      if (Object.keys(params).length > 0) {
        const queryString = Object.entries(params)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
          .join('&');
        
        finalUrl = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
      }
      
      // Create request options
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include',
      };
      
      // Add body for POST, PUT, PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method) && body !== null) {
        options.body = typeof body === 'object' ? JSON.stringify(body) : String(body);
      }
      
      // Make the request using fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      options.signal = controller.signal;
      
      const response = await fetch(finalUrl, options);
      clearTimeout(timeoutId);
      
      // Parse response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      // Parse response based on content type
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        responseData = await response.text();
      } else {
        responseData = await response.arrayBuffer();
      }
      
      return {
        flow: true,
        response: responseData,
        status: response.status,
        headers: responseHeaders,
        success: response.ok,
        error: ''
      };
    } catch (error) {
      return {
        flow: true,
        response: {},
        status: 0,
        headers: {},
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};