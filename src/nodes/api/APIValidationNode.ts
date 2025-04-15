/**
 * API Validation Node - Validate input data against schemas
 * 
 * @fileoverview Implementation of API validation node following
 * APEX standard for max 500 lines per file (Rule #5: FILE-SIZE)
 * Compliant with Rule #29 (SEC-INPUT-VAL) and Rule #8 (QUAL-CLARITY)
 */

import { APINodeDefinition } from '../APINodeTypes';

export const APIValidationNode: APINodeDefinition = {
  id: 'api-validation',
  type: 'api',
  category: 'API',
  name: 'API Validation',
  description: 'Validate API input data against schemas',
  
  inputs: [
    {
      id: 'data',
      name: 'Input Data',
      type: 'any',
      description: 'The data to validate',
      required: true,
      defaultValue: {}
    },
    {
      id: 'schema',
      name: 'Schema',
      type: 'object',
      description: 'Validation schema definition',
      required: true,
      defaultValue: {}
    },
    {
      id: 'options',
      name: 'Options',
      type: 'object',
      description: 'Validation options',
      required: false,
      defaultValue: { abortEarly: false }
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
      id: 'validatedData',
      name: 'Validated Data',
      type: 'any',
      description: 'The validated (and possibly transformed) data',
      required: false,
      defaultValue: {}
    },
    {
      id: 'valid',
      name: 'Valid',
      type: 'boolean',
      description: 'Whether the data is valid',
      required: false,
      defaultValue: false
    },
    {
      id: 'errors',
      name: 'Validation Errors',
      type: 'array',
      description: 'List of validation errors if any',
      required: false,
      defaultValue: []
    }
  ],
  
  compute: async (inputs: any, data: any, context: any) => {
    try {
      const inputData = inputs.data || {};
      const schema = inputs.schema || {};
      const options = inputs.options || { abortEarly: false };
      
      if (Object.keys(schema).length === 0) {
        return {
          flow: true,
          validatedData: inputData,
          valid: false,
          errors: [{ message: 'No validation schema provided' }]
        };
      }
      
      // Try to use popular validation libraries if available
      let isValid = false;
      let validatedData = inputData;
      let validationErrors: any[] = [];
      
      try {
        // Try Joi validation with proper type checking
        // Use require() instead of dynamic import for better TypeScript compatibility
        try {
          // Check if joi is available (will throw if not installed)
          const joi = require('joi');
          
          const joiSchema = joi.object(schema);
          const validation = joiSchema.validate(inputData, options);
          
          isValid = !validation.error;
          validatedData = validation.value;
          // Fix the error by adding a null check
          validationErrors = isValid ? [] : (validation.error?.details || []);
        } catch (moduleError) {
          // Module not available, continue to fallback
          throw moduleError;
        }
      } catch (joiError) {
        // Fall back to simple validation if no libraries are available
        isValid = true;
        validationErrors = [];
        
        // Simple validation for required fields
        Object.entries(schema).forEach(([field, fieldSchema]: [string, any]) => {
          if (fieldSchema.required && (inputData[field] === undefined || inputData[field] === null)) {
            isValid = false;
            validationErrors.push({
              message: `Field '${field}' is required`,
              path: field
            });
          }
        });
      }
      
      return {
        flow: true,
        validatedData,
        valid: isValid,
        errors: validationErrors
      };
    } catch (error) {
      return {
        flow: true,
        validatedData: inputs.data || {},
        valid: false,
        errors: [{ message: error instanceof Error ? error.message : String(error) }]
      };
    }
  }
};