/**
 * Authentication Node - Handle user authentication
 * 
 * @fileoverview Implementation of authentication node following
 * APEX standard for max 500 lines per file (Rule #5: FILE-SIZE)
 */

import { APINodeDefinition } from '../APINodeTypes';
import { ConfigManager } from '../../services/ConfigManager';

// Mock JWT implementation in case the real library is not available
const createMockJwt = () => {
  console.warn('Using mock JWT implementation - for development only');
  return {
    sign: (payload: any, secret: string) => {
      // Simple mock implementation that base64 encodes the payload
      const header = Buffer.from(JSON.stringify({ alg: 'mock', typ: 'JWT' })).toString('base64');
      const body = Buffer.from(JSON.stringify(payload)).toString('base64');
      const signature = Buffer.from(secret).toString('base64').substring(0, 10);
      return `${header}.${body}.${signature}`;
    },
    verify: (token: string, secret: string) => {
      // Simple mock implementation that assumes the token is valid and returns the payload
      try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token format');
        return JSON.parse(Buffer.from(parts[1], 'base64').toString());
      } catch (e) {
        throw new Error('Invalid token');
      }
    }
  };
};

// Try to load the real JWT library, fall back to mock if not available
let jwt: any;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  jwt = createMockJwt();
}

export const AuthenticationNode: APINodeDefinition = {
  id: 'api-authentication',
  type: 'api',
  category: 'API',
  name: 'Authentication',
  description: 'Authenticate users and generate tokens',
  
  inputs: [
    {
      id: 'method',
      name: 'Auth Method',
      type: 'string',
      description: 'The authentication method (jwt, session, oauth)',
      required: true,
      defaultValue: 'jwt'
    },
    {
      id: 'username',
      name: 'Username',
      type: 'string',
      description: 'Username or email',
      required: false,
      defaultValue: ''
    },
    {
      id: 'password',
      name: 'Password',
      type: 'string',
      description: 'Password (if applicable)',
      required: false,
      defaultValue: ''
    },
    {
      id: 'token',
      name: 'Token',
      type: 'string',
      description: 'Existing token to verify',
      required: false,
      defaultValue: ''
    },
    {
      id: 'userData',
      name: 'User Data',
      type: 'object',
      description: 'Additional user data for token generation',
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
      id: 'authenticated',
      name: 'Authenticated',
      type: 'boolean',
      description: 'Whether authentication was successful',
      required: false,
      defaultValue: false
    },
    {
      id: 'token',
      name: 'Token',
      type: 'string',
      description: 'Authentication token (if applicable)',
      required: false,
      defaultValue: ''
    },
    {
      id: 'user',
      name: 'User',
      type: 'object',
      description: 'User information',
      required: false,
      defaultValue: {}
    },
    {
      id: 'error',
      name: 'Error',
      type: 'string',
      description: 'Error message if authentication failed',
      required: false,
      defaultValue: ''
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const method = (inputs.method || 'jwt').toLowerCase();
      const username = inputs.username || '';
      const password = inputs.password || '';
      const inputToken = inputs.token || '';
      const userData = inputs.userData || {};
      
      // Different auth implementations based on method
      switch (method) {
        case 'jwt': {
          // Try to use jsonwebtoken if available
          try {
            // If we have a token to verify
            if (inputToken) {
              try {
                // Use getSync for non-sensitive config values (safer than getString which doesn't exist)
                const secret = ConfigManager.getSync('auth', 'jwt.secret', 'default-secret-key-change-me');
                const decoded = jwt.verify(inputToken, secret);
                
                return {
                  flow: true,
                  authenticated: true,
                  token: inputToken,
                  user: decoded,
                  error: ''
                };
              } catch (jwtError) {
                return {
                  flow: true,
                  authenticated: false,
                  token: '',
                  user: {},
                  error: 'Invalid or expired token'
                };
              }
            } 
            // Generate a new token
            else if (username || Object.keys(userData).length > 0) {
              const payload = {
                ...userData,
                username: username || userData.username || userData.email || 'anonymous',
                iat: Date.now() / 1000,
                exp: (Date.now() / 1000) + 3600 // 1 hour expiry
              };
              
              // Use getSync for non-sensitive config values
              const secret = ConfigManager.getSync('auth', 'jwt.secret', 'default-secret-key-change-me');
              const token = jwt.sign(payload, secret);
              
              return {
                flow: true,
                authenticated: true,
                token,
                user: payload,
                error: ''
              };
            } else {
              return {
                flow: true,
                authenticated: false,
                token: '',
                user: {},
                error: 'Insufficient authentication details'
              };
            }
          } catch (importError) {
            return {
              flow: true,
              authenticated: false,
              token: '',
              user: {},
              error: 'JWT library not available: ' + String(importError)
            };
          }
        }
        
        case 'session': {
          // Session authentication would require integration with an actual session store
          return {
            flow: true,
            authenticated: false,
            token: '',
            user: {},
            error: 'Session authentication not implemented in this node'
          };
        }
        
        case 'oauth': {
          // OAuth implementation would depend on specific provider integration
          return {
            flow: true,
            authenticated: false,
            token: '',
            user: {},
            error: 'OAuth authentication not implemented in this node'
          };
        }
        
        default:
          return {
            flow: true,
            authenticated: false,
            token: '',
            user: {},
            error: `Unsupported authentication method: ${method}`
          };
      }
    } catch (error) {
      return {
        flow: true,
        authenticated: false,
        token: '',
        user: {},
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};