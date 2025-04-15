import React, { createContext } from 'react';

// Define the Project type
export interface Project {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  created: Date;
  modified: Date;
  components: ComponentInstance[];
  blueprints: Blueprint[];
  variables: Variable[];
  theme: Theme;
  settings: ProjectSettings;
}

// Define component instance type
export interface ComponentInstance {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  children: ComponentInstance[];
  styles: Record<string, any>;
  events: Record<string, string>; // Event name -> Blueprint ID
}

// Define blueprint type
export interface Blueprint {
  id: string;
  name: string;
  description: string;
  nodes: NodeInstance[];
  connections: Connection[];
}

// Define node instance type
export interface NodeInstance {
  id: string;
  type: string;
  position: { x: number, y: number };
  data: Record<string, any>;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

// Define connection type
export interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

// Define variable type
export interface Variable {
  id: string;
  name: string;
  type: string;
  defaultValue: any;
  scope: 'global' | 'blueprint';
  blueprintId?: string; // For blueprint-scoped variables
}

// Define theme type
export interface Theme {
  id: string;
  name: string;
  colors: Record<string, string>;
  typography: Typography;
  spacing: Spacing;
}

// Define typography type
export interface Typography {
  fontFamily: string;
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
}

// Define spacing type
export interface Spacing {
  unit: number;
  scale: Record<string, number>;
}

// Define project settings type
export interface ProjectSettings {
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  window: {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    resizable: boolean;
    frame: boolean;
    transparent: boolean;
  };
  build: {
    outputDir: string;
    platforms: ('win' | 'mac' | 'linux')[];
  };
}

// Define the ProjectContext type
interface ProjectContextType {
  project: Project | null;
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
}

// Create the ProjectContext with default values
export const ProjectContext = createContext<ProjectContextType>({
  project: null,
  setProject: () => {},
  updateProject: () => {},
});
