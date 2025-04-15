import { NodeDefinition } from '../services/BlueprintRegistry';
import { ControlFlowNodes } from './ControlFlowNodes';
import { DataManipulationNodes } from './DataManipulationNodes';
import { MathNodes } from './MathNodes';
import { StringNodes } from './StringNodes';
import { LogicNodes } from './LogicNodes';
import { UIEventNodes } from './UIEventNodes';
import { UIComponentNodes } from './UIComponentNodes';

/**
 * Main entry point for all built-in nodes
 * 
 * @author Justin Lietz
 */

// Export all node categories
export const BuiltInNodes = [
  ...ControlFlowNodes,
  ...DataManipulationNodes,
  ...MathNodes,
  ...StringNodes,
  ...LogicNodes,
  ...UIEventNodes,
  ...UIComponentNodes
];

// Export individual node categories for direct access
export {
  ControlFlowNodes,
  DataManipulationNodes,
  MathNodes,
  StringNodes,
  LogicNodes,
  UIEventNodes,
  UIComponentNodes
};
