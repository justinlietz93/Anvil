import { BlueprintRegistry } from '../services/BlueprintRegistry';
import { BuiltInNodes } from './BuiltInNodes';

/**
 * Register all built-in nodes with the BlueprintRegistry
 * 
 * @author Justin Lietz
 */
export const registerBuiltInNodes = (): void => {
  // Register each built-in node
  BuiltInNodes.forEach(node => {
    BlueprintRegistry.registerNode(node);
  });
  
  console.log(`Registered ${BuiltInNodes.length} built-in nodes`);
};
