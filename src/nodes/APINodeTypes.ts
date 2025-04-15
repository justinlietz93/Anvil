/**
 * API Node Types - Interface definitions for API nodes
 * 
 * @fileoverview Contains type definitions for API nodes following
 * APEX standard for clean interface separation (Rule #7: MOD-INT)
 */

/**
 * Interface for API node definitions
 */
export interface APINodeDefinition {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  inputs: any[];
  outputs: any[];
  compute: Function;
}