import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Blueprint type definition
export interface Blueprint {
  id: string;
  name: string;
  description?: string;
  nodes: BlueprintNode[];
  connections: BlueprintConnection[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Blueprint node definition
export interface BlueprintNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  width?: number;
  height?: number;
}

// Blueprint connection definition
export interface BlueprintConnection {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
  data?: Record<string, any>;
}

// Component definition
export interface Component {
  id: string;
  name: string;
  description?: string;
  category: string;
  properties: ComponentProperty[];
  events: ComponentEvent[];
  icon?: string;
}

// Component property definition
export interface ComponentProperty {
  id: string;
  name: string;
  type: string;
  defaultValue?: any;
  required?: boolean;
  description?: string;
}

// Component event definition
export interface ComponentEvent {
  id: string;
  name: string;
  description?: string;
  parameters?: ComponentEventParameter[];
}

// Component event parameter definition
export interface ComponentEventParameter {
  id: string;
  name: string;
  type: string;
  description?: string;
}

// Project metadata
export interface ProjectMetadata {
  id: string;
  name: string;
  description?: string;
  version: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  settings: Record<string, any>;
}

// The ProjectContext type definition
interface ProjectContextType {
  // Project metadata
  projectMetadata: ProjectMetadata | null;
  setProjectMetadata: (metadata: ProjectMetadata) => void;
  
  // Blueprints
  blueprints: Blueprint[];
  getBlueprint: (id: string) => Blueprint | undefined;
  createBlueprint: (name: string, description?: string) => string;
  updateBlueprint: (id: string, updates: Partial<Blueprint>) => void;
  deleteBlueprint: (id: string) => void;
  
  // Blueprint nodes
  addNode: (blueprintId: string, nodeType: string, position: { x: number; y: number }, data?: Record<string, any>) => string;
  updateNode: (blueprintId: string, nodeId: string, updates: Partial<BlueprintNode>) => void;
  deleteNode: (blueprintId: string, nodeId: string) => void;
  
  // Blueprint connections
  addConnection: (
    blueprintId: string,
    source: string,
    target: string,
    sourceHandle?: string,
    targetHandle?: string,
    data?: Record<string, any>
  ) => string;
  deleteConnection: (blueprintId: string, connectionId: string) => void;
  
  // Components
  components: Component[];
  getComponent: (id: string) => Component | undefined;
  createComponent: (component: Omit<Component, 'id'>) => string;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  
  // Project operations
  createNewProject: (name: string, description?: string) => void;
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  exportProject: () => Promise<Blob>;
  
  // Project state
  hasUnsavedChanges: boolean;
  isLoading: boolean;
}

// Default project metadata
const defaultProjectMetadata: ProjectMetadata = {
  id: 'new-project',
  name: 'New Project',
  description: 'A new Anvil project',
  version: '0.1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {}
};

// Create the default context
const defaultProjectContext: ProjectContextType = {
  projectMetadata: null,
  setProjectMetadata: () => {},
  
  blueprints: [],
  getBlueprint: () => undefined,
  createBlueprint: () => '',
  updateBlueprint: () => {},
  deleteBlueprint: () => {},
  
  addNode: () => '',
  updateNode: () => {},
  deleteNode: () => {},
  
  addConnection: () => '',
  deleteConnection: () => {},
  
  components: [],
  getComponent: () => undefined,
  createComponent: () => '',
  updateComponent: () => {},
  deleteComponent: () => {},
  
  createNewProject: () => {},
  saveProject: async () => {},
  loadProject: async () => {},
  exportProject: async () => new Blob(),
  
  hasUnsavedChanges: false,
  isLoading: false
};

// Create the Project context
export const ProjectContext = createContext<ProjectContextType>(defaultProjectContext);

// ProjectProvider props
interface ProjectProviderProps {
  children: ReactNode;
}

/**
 * Project Context Provider
 * 
 * Manages the state and operations for the project
 */
export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  // Project metadata
  const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata | null>(null);
  
  // Blueprints
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  
  // Components
  const [components, setComponents] = useState<Component[]>([]);
  
  // Project state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  /**
   * Get a blueprint by ID
   */
  const getBlueprint = (id: string): Blueprint | undefined => {
    return blueprints.find(blueprint => blueprint.id === id);
  };
  
  /**
   * Create a new blueprint
   */
  const createBlueprint = (name: string, description?: string): string => {
    const id = `blueprint-${Date.now()}`;
    
    const newBlueprint: Blueprint = {
      id,
      name,
      description: description || '',
      nodes: [],
      connections: [],
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setBlueprints([...blueprints, newBlueprint]);
    setHasUnsavedChanges(true);
    
    return id;
  };
  
  /**
   * Update a blueprint
   */
  const updateBlueprint = (id: string, updates: Partial<Blueprint>): void => {
    setBlueprints(blueprints.map(blueprint => {
      if (blueprint.id === id) {
        return {
          ...blueprint,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return blueprint;
    }));
    
    setHasUnsavedChanges(true);
  };
  
  /**
   * Delete a blueprint
   */
  const deleteBlueprint = (id: string): void => {
    setBlueprints(blueprints.filter(blueprint => blueprint.id !== id));
    setHasUnsavedChanges(true);
  };
  
  /**
   * Add a node to a blueprint
   */
  const addNode = (
    blueprintId: string,
    nodeType: string,
    position: { x: number; y: number },
    data: Record<string, any> = {}
  ): string => {
    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    setBlueprints(blueprints.map(blueprint => {
      if (blueprint.id === blueprintId) {
        const newNode: BlueprintNode = {
          id: nodeId,
          type: nodeType,
          position,
          data
        };
        
        return {
          ...blueprint,
          nodes: [...blueprint.nodes, newNode],
          updatedAt: new Date().toISOString()
        };
      }
      return blueprint;
    }));
    
    setHasUnsavedChanges(true);
    return nodeId;
  };
  
  /**
   * Update a node in a blueprint
   */
  const updateNode = (blueprintId: string, nodeId: string, updates: Partial<BlueprintNode>): void => {
    setBlueprints(blueprints.map(blueprint => {
      if (blueprint.id === blueprintId) {
        const updatedNodes = blueprint.nodes.map(node => {
          if (node.id === nodeId) {
            return {
              ...node,
              ...updates
            };
          }
          return node;
        });
        
        return {
          ...blueprint,
          nodes: updatedNodes,
          updatedAt: new Date().toISOString()
        };
      }
      return blueprint;
    }));
    
    setHasUnsavedChanges(true);
  };
  
  /**
   * Delete a node from a blueprint
   */
  const deleteNode = (blueprintId: string, nodeId: string): void => {
    setBlueprints(blueprints.map(blueprint => {
      if (blueprint.id === blueprintId) {
        // Remove the node
        const updatedNodes = blueprint.nodes.filter(node => node.id !== nodeId);
        
        // Remove any connections to or from the node
        const updatedConnections = blueprint.connections.filter(
          conn => conn.source !== nodeId && conn.target !== nodeId
        );
        
        return {
          ...blueprint,
          nodes: updatedNodes,
          connections: updatedConnections,
          updatedAt: new Date().toISOString()
        };
      }
      return blueprint;
    }));
    
    setHasUnsavedChanges(true);
  };
  
  /**
   * Add a connection to a blueprint
   */
  const addConnection = (
    blueprintId: string,
    source: string,
    target: string,
    sourceHandle?: string,
    targetHandle?: string,
    data: Record<string, any> = {}
  ): string => {
    const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    setBlueprints(blueprints.map(blueprint => {
      if (blueprint.id === blueprintId) {
        const newConnection: BlueprintConnection = {
          id: connectionId,
          source,
          target,
          sourceHandle,
          targetHandle,
          data
        };
        
        return {
          ...blueprint,
          connections: [...blueprint.connections, newConnection],
          updatedAt: new Date().toISOString()
        };
      }
      return blueprint;
    }));
    
    setHasUnsavedChanges(true);
    return connectionId;
  };
  
  /**
   * Delete a connection from a blueprint
   */
  const deleteConnection = (blueprintId: string, connectionId: string): void => {
    setBlueprints(blueprints.map(blueprint => {
      if (blueprint.id === blueprintId) {
        const updatedConnections = blueprint.connections.filter(conn => conn.id !== connectionId);
        
        return {
          ...blueprint,
          connections: updatedConnections,
          updatedAt: new Date().toISOString()
        };
      }
      return blueprint;
    }));
    
    setHasUnsavedChanges(true);
  };
  
  /**
   * Get a component by ID
   */
  const getComponent = (id: string): Component | undefined => {
    return components.find(component => component.id === id);
  };
  
  /**
   * Create a new component
   */
  const createComponent = (component: Omit<Component, 'id'>): string => {
    const id = `component-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newComponent: Component = {
      id,
      ...component
    };
    
    setComponents([...components, newComponent]);
    setHasUnsavedChanges(true);
    
    return id;
  };
  
  /**
   * Update a component
   */
  const updateComponent = (id: string, updates: Partial<Component>): void => {
    setComponents(components.map(component => {
      if (component.id === id) {
        return {
          ...component,
          ...updates
        };
      }
      return component;
    }));
    
    setHasUnsavedChanges(true);
  };
  
  /**
   * Delete a component
   */
  const deleteComponent = (id: string): void => {
    setComponents(components.filter(component => component.id !== id));
    setHasUnsavedChanges(true);
  };
  
  /**
   * Create a new project
   */
  const createNewProject = (name: string, description?: string): void => {
    const id = `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const metadata: ProjectMetadata = {
      id,
      name,
      description: description || 'A new Anvil project',
      version: '0.1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {}
    };
    
    setProjectMetadata(metadata);
    setBlueprints([]);
    setComponents([]);
    setHasUnsavedChanges(false);
  };
  
  /**
   * Save the project
   */
  const saveProject = async (): Promise<void> => {
    if (!projectMetadata) {
      console.error('No project metadata to save');
      return;
    }
    
    setIsLoading(true);
    
    // In a real implementation, this would save to a file or database
    try {
      // Simulate a network call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the last saved time
      setProjectMetadata({
        ...projectMetadata,
        updatedAt: new Date().toISOString()
      });
      
      setHasUnsavedChanges(false);
      console.log('Project saved:', projectMetadata.name);
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Load a project
   */
  const loadProject = async (projectId: string): Promise<void> => {
    setIsLoading(true);
    
    // In a real implementation, this would load from a file or database
    try {
      // Simulate a network call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For now, just create a dummy project
      const metadata: ProjectMetadata = {
        id: projectId,
        name: `Project ${projectId}`,
        description: 'A loaded project',
        version: '0.1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {}
      };
      
      setProjectMetadata(metadata);
      setBlueprints([]);
      setComponents([]);
      setHasUnsavedChanges(false);
      
      console.log('Project loaded:', metadata.name);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Export the project
   */
  const exportProject = async (): Promise<Blob> => {
    setIsLoading(true);
    
    try {
      // Create the project data object
      const projectData = {
        metadata: projectMetadata,
        blueprints,
        components
      };
      
      // Serialize to JSON
      const jsonString = JSON.stringify(projectData, null, 2);
      
      // Create a Blob
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      console.log('Project exported:', projectMetadata?.name);
      
      return blob;
    } catch (error) {
      console.error('Error exporting project:', error);
      return new Blob(['{}'], { type: 'application/json' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize a new project when the provider mounts
  useEffect(() => {
    if (!projectMetadata) {
      setProjectMetadata(defaultProjectMetadata);
    }
  }, [projectMetadata]);
  
  return (
    <ProjectContext.Provider value={{
      projectMetadata,
      setProjectMetadata,
      
      blueprints,
      getBlueprint,
      createBlueprint,
      updateBlueprint,
      deleteBlueprint,
      
      addNode,
      updateNode,
      deleteNode,
      
      addConnection,
      deleteConnection,
      
      components,
      getComponent,
      createComponent,
      updateComponent,
      deleteComponent,
      
      createNewProject,
      saveProject,
      loadProject,
      exportProject,
      
      hasUnsavedChanges,
      isLoading
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use the Project context
export const useProject = () => useContext(ProjectContext);
