# Anvil Platform Core Components Design

## Introduction

This document provides detailed design specifications for the core components of the Anvil platform, focusing on the MVP components (Visual GUI Builder and Blueprint System) while ensuring the architecture supports all required features.

## 1. Visual GUI Builder

### Component Library

#### Component Registry
The Component Registry is responsible for managing all available UI components that can be used in the Anvil platform.

```typescript
interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  propTypes: Record<string, PropTypeDefinition>;
  renderComponent: (props: any) => React.ReactNode;
}

interface PropTypeDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'enum';
  required: boolean;
  defaultValue?: any;
  options?: any[]; // For enum type
  description: string;
}
```

The Component Registry will be implemented as a service that:
1. Registers built-in components based on Fluent UI React
2. Provides methods to register custom components via plugins
3. Organizes components by category
4. Provides search and filtering capabilities

#### Fluent UI Component Wrappers

Each Fluent UI React component will be wrapped to provide:
1. Default properties suitable for no-code usage
2. Metadata for the properties panel
3. Event handling capabilities for the Blueprint system

Example component wrapper structure:
```typescript
// Button component wrapper
class ButtonComponent implements ComponentDefinition {
  id = 'fluent-button';
  name = 'Button';
  category = 'Basic Controls';
  icon = 'ButtonControl';
  description = 'A standard button control';
  
  defaultProps = {
    text: 'Button',
    primary: false,
    disabled: false,
    onClick: null
  };
  
  propTypes = {
    text: {
      type: 'string',
      required: true,
      defaultValue: 'Button',
      description: 'The text to display on the button'
    },
    primary: {
      type: 'boolean',
      required: false,
      defaultValue: false,
      description: 'Whether the button is a primary button'
    },
    disabled: {
      type: 'boolean',
      required: false,
      defaultValue: false,
      description: 'Whether the button is disabled'
    }
  };
  
  renderComponent(props: any) {
    return <PrimaryButton {...props} />;
  }
}
```

### Workspace

#### Canvas
The Canvas is the main editing area where users build their UI by dragging and dropping components.

Key features:
1. Grid-based layout system with snap-to-grid functionality
2. Support for different layout containers (Stack, Grid)
3. Component selection and multi-selection
4. Copy, paste, and delete operations
5. Undo/redo functionality
6. Zoom in/out and pan capabilities

Implementation considerations:
- Use React's context API for selection state
- Implement a custom drag-and-drop system optimized for UI building
- Use a virtual DOM approach for efficient rendering of complex UIs

#### Component Tree
The Component Tree provides a hierarchical view of all components in the workspace.

Key features:
1. Tree view of component hierarchy
2. Drag-and-drop reordering of components
3. Context menu for common operations
4. Visual indicators for selection state
5. Search and filtering capabilities

Implementation considerations:
- Use a recursive component structure for rendering the tree
- Implement efficient tree traversal algorithms
- Use virtualization for handling large component trees

### Properties Panel

The Properties Panel displays and allows editing of the properties of the selected component(s).

Key features:
1. Dynamic property editors based on property types
2. Validation of property values
3. Property grouping for organization
4. Support for complex property types (objects, arrays)
5. Custom property editors for specific components

Property editor components:
- TextPropertyEditor: For string properties
- NumberPropertyEditor: For numeric properties
- BooleanPropertyEditor: For boolean properties
- EnumPropertyEditor: For properties with predefined options
- ColorPropertyEditor: For color properties
- ObjectPropertyEditor: For object properties
- ArrayPropertyEditor: For array properties

Implementation considerations:
- Use React's context API for selected component state
- Implement a plugin system for custom property editors
- Use form validation libraries for property validation

### Styling & Theming

#### Theme Editor
The Theme Editor allows users to define global themes for their applications.

Key features:
1. Color palette definition
2. Typography settings
3. Spacing and sizing settings
4. Theme preview
5. Theme export and import

Implementation considerations:
- Base on Fluent UI's theming system
- Provide sensible defaults for common design patterns
- Implement theme inheritance for component-specific overrides

#### Style Manager
The Style Manager handles the application of styles to components.

Key features:
1. Component-specific style overrides
2. Style inheritance from themes
3. CSS class management
4. Responsive style settings

Implementation considerations:
- Use CSS-in-JS for style management
- Implement a cascading style system similar to CSS
- Provide a simple interface for common styling tasks

## 2. Blueprint System

### Blueprint Editor

#### Canvas
The Blueprint Canvas is where users create and edit their visual scripts.

Key features:
1. Node placement and connection
2. Node grouping and organization
3. Zoom and pan capabilities
4. Grid snapping
5. Mini-map for navigation

Implementation considerations:
- Use a custom rendering engine optimized for node graphs
- Implement efficient algorithms for connection routing
- Use WebGL for rendering complex graphs if necessary

#### Node Library
The Node Library provides access to all available node types.

Key features:
1. Categorized node types
2. Search and filtering
3. Favorites and recently used nodes
4. Custom node creation

Node categories:
- Events: Button clicked, Window loaded, etc.
- Logic: If/Else, Switch, Loop, etc.
- Data: Variables, Arrays, Objects, etc.
- Math: Arithmetic, Comparison, etc.
- String: Concatenation, Substring, etc.
- UI: Show/Hide, Update Text, etc.
- Database: Query, Insert, Update, Delete, etc.
- API: HTTP Request, Response Handling, etc.
- LLM: Agent Trigger, Response Processing, etc.

Implementation considerations:
- Use a registry pattern for node types
- Implement a plugin system for custom nodes
- Use metadata for node categorization and search

### Node System

#### Node Base
The Node Base provides the foundation for all node types.

```typescript
interface NodeDefinition {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  defaultData?: Record<string, any>;
  compute: (inputs: any, data: any) => any;
}

interface PortDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
}
```

#### Node Types

##### Event Nodes
Event Nodes trigger blueprint execution based on UI events.

Example event nodes:
- ButtonClickedNode: Triggered when a button is clicked
- WindowLoadedNode: Triggered when the application window loads
- TextChangedNode: Triggered when text input changes

```typescript
// Button Clicked Event Node
class ButtonClickedNode implements NodeDefinition {
  id = 'event-button-clicked';
  type = 'event';
  category = 'Events';
  name = 'Button Clicked';
  description = 'Triggered when a button is clicked';
  
  inputs = [
    {
      id: 'button',
      name: 'Button',
      type: 'component',
      description: 'The button to listen for clicks',
      required: true
    }
  ];
  
  outputs = [
    {
      id: 'trigger',
      name: 'Trigger',
      type: 'flow',
      description: 'Triggered when the button is clicked',
      required: false
    }
  ];
  
  compute(inputs: any, data: any) {
    // This is handled by the event system
    return { trigger: true };
  }
}
```

##### Logic Nodes
Logic Nodes control the flow of execution in blueprints.

Example logic nodes:
- IfElseNode: Branches execution based on a condition
- ForEachNode: Iterates over an array
- SequenceNode: Executes a sequence of operations

```typescript
// If/Else Node
class IfElseNode implements NodeDefinition {
  id = 'logic-if-else';
  type = 'logic';
  category = 'Logic';
  name = 'If/Else';
  description = 'Branches execution based on a condition';
  
  inputs = [
    {
      id: 'condition',
      name: 'Condition',
      type: 'boolean',
      description: 'The condition to evaluate',
      required: true
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true
    }
  ];
  
  outputs = [
    {
      id: 'true',
      name: 'True',
      type: 'flow',
      description: 'Executed if condition is true',
      required: false
    },
    {
      id: 'false',
      name: 'False',
      type: 'flow',
      description: 'Executed if condition is false',
      required: false
    }
  ];
  
  compute(inputs: any, data: any) {
    if (inputs.condition) {
      return { true: true };
    } else {
      return { false: true };
    }
  }
}
```

##### Data Nodes
Data Nodes handle data operations in blueprints.

Example data nodes:
- GetVariableNode: Gets the value of a variable
- SetVariableNode: Sets the value of a variable
- CreateObjectNode: Creates a new object
- CreateArrayNode: Creates a new array

```typescript
// Get Variable Node
class GetVariableNode implements NodeDefinition {
  id = 'data-get-variable';
  type = 'data';
  category = 'Data';
  name = 'Get Variable';
  description = 'Gets the value of a variable';
  
  inputs = [
    {
      id: 'name',
      name: 'Variable Name',
      type: 'string',
      description: 'The name of the variable',
      required: true
    }
  ];
  
  outputs = [
    {
      id: 'value',
      name: 'Value',
      type: 'any',
      description: 'The value of the variable',
      required: false
    }
  ];
  
  compute(inputs: any, data: any, context: any) {
    return { value: context.variables[inputs.name] };
  }
}
```

##### UI Nodes
UI Nodes manipulate the user interface in blueprints.

Example UI nodes:
- ShowHideNode: Shows or hides a component
- UpdateTextNode: Updates the text of a component
- EnableDisableNode: Enables or disables a component

```typescript
// Update Text Node
class UpdateTextNode implements NodeDefinition {
  id = 'ui-update-text';
  type = 'ui';
  category = 'UI';
  name = 'Update Text';
  description = 'Updates the text of a component';
  
  inputs = [
    {
      id: 'component',
      name: 'Component',
      type: 'component',
      description: 'The component to update',
      required: true
    },
    {
      id: 'text',
      name: 'Text',
      type: 'string',
      description: 'The new text value',
      required: true
    },
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow input',
      required: true
    }
  ];
  
  outputs = [
    {
      id: 'flow',
      name: 'Flow',
      type: 'flow',
      description: 'Execution flow output',
      required: false
    }
  ];
  
  compute(inputs: any, data: any, context: any) {
    context.updateComponent(inputs.component, { text: inputs.text });
    return { flow: true };
  }
}
```

### Blueprint Engine

The Blueprint Engine is responsible for executing blueprints.

Key components:
1. Graph Traversal: Traverses the node graph during execution
2. Data Flow: Manages data flow between nodes
3. Event Handling: Handles events that trigger blueprint execution
4. Error Handling: Manages errors during blueprint execution

Implementation considerations:
- Use an asynchronous execution model for non-blocking operations
- Implement a robust error handling system
- Use a dependency graph for efficient execution
- Implement debugging capabilities

```typescript
class BlueprintEngine {
  private nodes: Map<string, NodeInstance>;
  private connections: Connection[];
  private eventListeners: Map<string, Function>;
  
  constructor() {
    this.nodes = new Map();
    this.connections = [];
    this.eventListeners = new Map();
  }
  
  addNode(node: NodeInstance): void {
    this.nodes.set(node.id, node);
  }
  
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.connections = this.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
  }
  
  addConnection(connection: Connection): void {
    this.connections.push(connection);
  }
  
  removeConnection(connectionId: string): void {
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
  }
  
  addEventListener(eventType: string, callback: Function): void {
    this.eventListeners.set(eventType, callback);
  }
  
  removeEventListener(eventType: string): void {
    this.eventListeners.delete(eventType);
  }
  
  triggerEvent(eventType: string, eventData: any): void {
    const eventNodes = Array.from(this.nodes.values())
      .filter(node => node.type === 'event' && node.eventType === eventType);
    
    for (const node of eventNodes) {
      this.executeNode(node.id, eventData);
    }
  }
  
  async executeNode(nodeId: string, inputData: any = {}): Promise<any> {
    const node = this.nodes.get(nodeId);
    if (!node) return null;
    
    const nodeInputs = this.gatherNodeInputs(nodeId, inputData);
    const nodeOutputs = await node.compute(nodeInputs, node.data);
    
    this.propagateOutputs(nodeId, nodeOutputs);
    
    return nodeOutputs;
  }
  
  private gatherNodeInputs(nodeId: string, externalInputs: any = {}): any {
    const inputs = { ...externalInputs };
    
    // Find connections that target this node
    const incomingConnections = this.connections.filter(
      conn => conn.targetNodeId === nodeId
    );
    
    for (const conn of incomingConnections) {
      const sourceNode = this.nodes.get(conn.sourceNodeId);
      if (sourceNode && sourceNode.outputs[conn.sourcePortId]) {
        inputs[conn.targetPortId] = sourceNode.outputs[conn.sourcePortId];
      }
    }
    
    return inputs;
  }
  
  private propagateOutputs(nodeId: string, outputs: any): void {
    // Find connections that source from this node
    const outgoingConnections = this.connections.filter(
      conn => conn.sourceNodeId === nodeId
    );
    
    for (const conn of outgoingConnections) {
      if (outputs[conn.sourcePortId]) {
        this.executeNode(conn.targetNodeId, {
          [conn.targetPortId]: outputs[conn.sourcePortId]
        });
      }
    }
  }
}
```

## 3. Project Management

### Project Model

The Project Model represents the structure of an Anvil project.

```typescript
interface Project {
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

interface ComponentInstance {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  children: ComponentInstance[];
  styles: Record<string, any>;
  events: Record<string, string>; // Event name -> Blueprint ID
}

interface Blueprint {
  id: string;
  name: string;
  description: string;
  nodes: NodeInstance[];
  connections: Connection[];
}

interface NodeInstance {
  id: string;
  type: string;
  position: { x: number, y: number };
  data: Record<string, any>;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

interface Connection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

interface Variable {
  id: string;
  name: string;
  type: string;
  defaultValue: any;
  scope: 'global' | 'blueprint';
  blueprintId?: string; // For blueprint-scoped variables
}

interface Theme {
  id: string;
  name: string;
  colors: Record<string, string>;
  typography: Typography;
  spacing: Spacing;
}

interface Typography {
  fontFamily: string;
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, number>;
}

interface Spacing {
  unit: number;
  scale: Record<string, number>;
}

interface ProjectSettings {
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
```

### Project Service

The Project Service manages project operations.

Key features:
1. Project creation
2. Project loading and saving
3. Project export
4. Project settings management

Implementation considerations:
- Use a file-based storage system for projects
- Implement versioning for project files
- Use JSON for project serialization
- Implement backup and recovery mechanisms

```typescript
class ProjectService {
  private currentProject: Project | null = null;
  
  createProject(name: string, description: string): Project {
    const project: Project = {
      id: uuidv4(),
      name,
      description,
      version: '1.0.0',
      author: '',
      created: new Date(),
      modified: new Date(),
      components: [],
      blueprints: [],
      variables: [],
      theme: this.createDefaultTheme(),
      settings: this.createDefaultSettings(name, description)
    };
    
    this.currentProject = project;
    return project;
  }
  
  loadProject(filePath: string): Promise<Project> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        
        try {
          const project = JSON.parse(data) as Project;
          this.currentProject = project;
          resolve(project);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  saveProject(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.currentProject) {
        reject(new Error('No project is currently open'));
        return;
      }
      
      this.currentProject.modified = new Date();
      
      const projectData = JSON.stringify(this.currentProject, null, 2);
      
      fs.writeFile(filePath, projectData, 'utf8', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve();
      });
    });
  }
  
  exportProject(outputDir: string, platforms: ('win' | 'mac' | 'linux')[]): Promise<void> {
    // Implementation will be provided in the Application Generation phase
    return Promise.resolve();
  }
  
  private createDefaultTheme(): Theme {
    return {
      id: uuidv4(),
      name: 'Default Theme',
      colors: {
        primary: '#0078d4',
        secondary: '#2b88d8',
        background: '#ffffff',
        text: '#323130',
        error: '#a4262c'
      },
      typography: {
        fontFamily: '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
        fontSize: {
          small: '12px',
          medium: '14px',
          large: '16px',
          xLarge: '20px',
          xxLarge: '28px'
        },
        fontWeight: {
          regular: 400,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          small: 1.3,
          medium: 1.4,
          large: 1.5
        }
      },
      spacing: {
        unit: 8,
        scale: {
          s: 1,
          m: 2,
          l: 3,
          xl: 4
        }
      }
    };
  }
  
  private createDefaultSettings(name: string, description: string): ProjectSettings {
    return {
      name,
      description,
      version: '1.0.0',
      author: '',
      icon: '',
      window: {
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        resizable: true,
        frame: true,
        transparent: false
      },
      build: {
        outputDir: '',
        platforms: ['win', 'mac', 'linux']
      }
    };
  }
}
```

## 4. Application Generation

### Application Template

The Application Template provides the foundation for generated applications.

Key components:
1. Main Process Template: Template for the Electron main process
2. Renderer Process Template: Template for the Electron renderer process
3. Preload Script Template: Template for the Electron preload script
4. Package.json Template: Template for the application package.json

Implementation considerations:
- Use template literals for code generation
- Implement a plugin system for custom templates
- Use a file-based template system for flexibility

### Build Service

The Build Service handles the building and packaging of applications.

Key features:
1. Code generation from project model
2. Dependency management
3. Build configuration
4. Platform-specific packaging

Implementation considerations:
- Use Electron Forge for packaging
- Implement incremental builds for performance
- Use a worker process for build operations
- Implement build caching

## 5. State Management

### Application State

The Application State manages the state of the Anvil platform.

Key components:
1. Project State: Current project data
2. UI State: Current UI state (selected components, active panels, etc.)
3. Editor State: Current editor state (undo/redo history, clipboard, etc.)

Implementation considerations:
- Use React Context API for state management
- Implement a reducer pattern for state updates
- Use middleware for side effects
- Implement state persistence for recovery

```typescript
// Project Context
const ProjectContext = React.createContext<{
  project: Project | null;
  setProject: (project: Project) => void;
  updateProject: (updates: Partial<Project>) => void;
}>({
  project: null,
  setProject: () => {},
  updateProject: () => {}
});

// UI Context
const UIContext = React.createContext<{
  selectedComponentIds: string[];
  activePanel: string;
  setSelectedComponentIds: (ids: string[]) => void;
  setActivePanel: (panel: string) => void;
}>({
  selectedComponentIds: [],
  activePanel: 'components',
  setSelectedComponentIds: () => {},
  setActivePanel: () => {}
});

// Editor Context
const EditorContext = React.createContext<{
  undoStack: any[];
  redoStack: any[];
  clipboard: any;
  undo: () => void;
  redo: () => void;
  copy: () => void;
  paste: () => void;
  cut: () => void;
}>({
  undoStack: [],
  redoStack: [],
  clipboard: null,
  undo: () => {},
  redo: () => {},
  copy: () => {},
  paste: () => {},
  cut: () => {}
});
```

## 6. Error Handling

### Error Types

1. **User Errors**: Errors caused by invalid user actions
2. **System Errors**: Errors caused by system failures
3. **Build Errors**: Errors during application building
4. **Runtime Errors**: Errors during application runtime

### Error Handling Strategy

1. **Prevention**: Validate user inputs to prevent errors
2. **Detection**: Detect errors early in the process
3. **Recovery**: Provide recovery mechanisms where possible
4. **Reporting**: Report errors in a user-friendly way

Implementation considerations:
- Use a centralized error handling system
- Implement error boundaries for React components
- Use logging for error tracking
- Implement error recovery mechanisms

## 7. Security

### Credential Storage

Secure storage of database credentials and API keys.

Implementation considerations:
- Use encryption for credential storage
- Implement secure IPC for credential access
- Use platform-specific secure storage where available

### Electron Security

Implementation of Electron security best practices.

Key practices:
1. Context isolation
2. Secure IPC channels
3. Limited Node.js integration in renderers
4. Content Security Policy
5. HTTPS-only communication

## Conclusion

This detailed design of core components provides a solid foundation for implementing the Anvil platform according to the specified requirements. The design focuses on the MVP components (Visual GUI Builder and Blueprint System) while ensuring the architecture supports all required features.

The component designs adhere to the strict quality requirements, including modularity, testability, and security, while providing a solid foundation for all the required features. The focus on user experience and intuitive interfaces ensures that the platform will be accessible to the target audience of non-programmers.
