# Anvil Desktop Platform - Developer Documentation

## Architecture Overview

The Anvil platform is built on a modular architecture designed for extensibility and maintainability. This document provides technical details for developers who want to understand, modify, or extend the platform.

## Technology Stack

- **Core Framework**: Electron (Node.js + Chromium)
- **Frontend**: React with TypeScript
- **UI Components**: Fluent UI React
- **State Management**: React Context API
- **Testing**: Jest + React Testing Library
- **Build System**: Electron Forge

## Project Structure

```
anvil-project/
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── BlueprintEditor/    # Blueprint system components
│   │   ├── ComponentLibrary/   # UI component library
│   │   ├── DataConnectivity/   # Database connection components
│   │   ├── Extensibility/      # Plugin system components
│   │   ├── LLMIntegration/     # AI integration components
│   │   ├── PropertiesPanel/    # Property editing components
│   │   ├── Settings/           # Settings components
│   │   └── Workspace/          # Main workspace components
│   ├── contexts/           # React contexts for state management
│   ├── nodes/              # Blueprint node definitions
│   ├── services/           # Core services
│   └── config/             # Configuration files
├── docs/                   # Documentation
├── tests/                  # Test files
└── package.json            # Project dependencies
```

## Core Components

### Main Process (Electron)

The main process (`main.js`) is responsible for:
- Creating and managing application windows
- Handling native OS integration
- Managing file system access
- Coordinating IPC (Inter-Process Communication)

### Renderer Process (React)

The renderer process (`index.tsx` and React components) is responsible for:
- Rendering the user interface
- Handling user interactions
- Managing application state
- Communicating with the main process via IPC

### Preload Script

The preload script (`preload.js`) provides a secure bridge between the renderer process and the main process, exposing only the necessary APIs.

## Service Layer

### ConfigManager

The `ConfigManager` service provides a centralized configuration system:
- Loads and saves configuration from JSON files
- Provides type-safe access to configuration values
- Supports default values and configuration validation

```typescript
// Example usage
import { ConfigManager } from '../services/ConfigManager';

// Get a configuration value with a default
const theme = ConfigManager.get('ui', 'theme', 'light');

// Set a configuration value
ConfigManager.set('ui', 'theme', 'dark');
```

### ProjectService

The `ProjectService` handles project management:
- Creates, loads, and saves projects
- Manages project metadata
- Tracks project modifications

### ComponentRegistry

The `ComponentRegistry` manages UI components:
- Registers built-in and plugin components
- Provides component metadata
- Creates component instances

### BlueprintRegistry

The `BlueprintRegistry` manages blueprint nodes:
- Registers built-in and plugin nodes
- Provides node metadata
- Creates node instances

### BlueprintEngine

The `BlueprintEngine` executes blueprint logic:
- Manages nodes and connections
- Executes node logic
- Propagates data between nodes
- Handles events and triggers

### DataConnector

The `DataConnector` manages database connections:
- Supports multiple database types (SQLite, PostgreSQL, etc.)
- Provides a unified query interface
- Manages connection pooling and lifecycle

### LLMAgentIntegration

The `LLMAgentIntegration` service handles AI integration:
- Manages LLM provider configurations
- Provides a unified API for different providers
- Handles request/response formatting

### PluginManager

The `PluginManager` handles the plugin system:
- Loads and validates plugins
- Manages plugin lifecycle
- Provides a secure sandbox for plugin execution
- Exposes extension points for plugins

## State Management

The application uses React Context for state management:

### ProjectContext

Manages the current project state:
- Project metadata
- Component tree
- Blueprint graph
- Modification status

### UIContext

Manages UI state:
- Panel visibility
- Active editor mode
- Selected components
- Drag and drop operations

### EditorContext

Manages editor state:
- Undo/redo history
- Clipboard contents
- Selection state
- Grid and snap settings

## Blueprint System

The Blueprint system is a visual programming environment that allows users to create application logic without writing code.

### Node Structure

Each node has the following structure:

```typescript
interface NodeDefinition {
  id: string;           // Unique identifier
  type: string;         // Node type category
  category: string;     // UI category
  name: string;         // Display name
  description: string;  // Description
  inputs: PortDefinition[];  // Input ports
  outputs: PortDefinition[]; // Output ports
  compute: Function;    // Execution function
}
```

### Port Types

Ports can have various types:
- `flow`: Control flow
- `boolean`: True/false values
- `number`: Numeric values
- `string`: Text values
- `object`: Complex data structures
- `array`: Collections of items
- Custom types defined by plugins

### Node Execution

The execution model is based on data flow:
1. A node is triggered for execution
2. Input values are gathered from connected nodes
3. The node's compute function is called with the inputs
4. Output values are propagated to connected nodes
5. Connected nodes are scheduled for execution

## Plugin System

The plugin system allows extending Anvil with custom components and nodes.

### Plugin Structure

A plugin is a JavaScript module with the following structure:

```javascript
export default {
  metadata: {
    name: 'My Plugin',
    version: '1.0.0',
    description: 'Adds custom functionality',
    author: 'Developer Name'
  },
  
  // Register components and nodes
  register(registry) {
    // Register custom components
    registry.registerComponent('my-component', MyComponent);
    
    // Register custom nodes
    registry.registerNode('my-node', MyNodeDefinition);
  },
  
  // Called when the plugin is enabled
  onEnable() {
    // Initialization code
  },
  
  // Called when the plugin is disabled
  onDisable() {
    // Cleanup code
  }
};
```

### Security Sandbox

Plugins run in a restricted sandbox with limited access to:
- Anvil API (components, nodes, services)
- Limited Node.js APIs (no file system or network access by default)
- No access to Electron APIs

## Application Generation

The application generation process converts an Anvil project into a standalone application:

1. **Project Analysis**: Analyze the project structure and dependencies
2. **Code Generation**: Generate React components from the visual design
3. **Blueprint Compilation**: Convert blueprints to executable JavaScript
4. **Resource Collection**: Gather all required resources (images, fonts, etc.)
5. **Electron Packaging**: Package everything into an Electron application
6. **Platform Building**: Build for the target platforms (Windows, macOS, Linux)

## Extending Anvil

### Creating Custom Components

To create a custom component:

1. Create a React component that follows the Anvil component interface
2. Define the component's properties and their types
3. Implement the component's render method
4. Register the component with the ComponentRegistry

Example:

```typescript
import React from 'react';
import { ComponentProps } from '../types';

interface CustomComponentProps extends ComponentProps {
  title: string;
  color: string;
}

const CustomComponent: React.FC<CustomComponentProps> = (props) => {
  const { title, color, children } = props;
  
  return (
    <div style={{ color }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
};

// Define property metadata for the Properties Panel
CustomComponent.propertyMetadata = {
  title: {
    type: 'string',
    defaultValue: 'Title',
    description: 'The component title'
  },
  color: {
    type: 'color',
    defaultValue: '#000000',
    description: 'Text color'
  }
};

export default CustomComponent;
```

### Creating Custom Nodes

To create a custom blueprint node:

1. Define the node's metadata (ID, name, description, etc.)
2. Define the node's inputs and outputs
3. Implement the node's compute function
4. Register the node with the BlueprintRegistry

Example:

```typescript
import { NodeDefinition } from '../services/BlueprintRegistry';

const CustomNode: NodeDefinition = {
  id: 'custom-node',
  type: 'custom',
  category: 'Custom Nodes',
  name: 'Custom Operation',
  description: 'Performs a custom operation',
  
  inputs: [
    {
      id: 'input1',
      name: 'Input 1',
      type: 'number',
      description: 'First input value',
      required: true,
      defaultValue: 0
    },
    {
      id: 'input2',
      name: 'Input 2',
      type: 'number',
      description: 'Second input value',
      required: true,
      defaultValue: 0
    }
  ],
  
  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: 'number',
      description: 'Operation result'
    }
  ],
  
  compute: async (inputs, data) => {
    const { input1, input2 } = inputs;
    const result = input1 * input2 + 5; // Custom operation
    
    return {
      result
    };
  }
};

export default CustomNode;
```

### Creating a Plugin

To create a complete plugin:

1. Create a new Node.js project
2. Implement your custom components and nodes
3. Create a plugin entry point that follows the plugin structure
4. Build the plugin as a JavaScript module
5. Distribute the plugin file for users to install

## Testing

The Anvil platform uses Jest and React Testing Library for testing:

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test interactions between components
- **End-to-End Tests**: Test complete user workflows

Test files are located alongside the code they test with a `.test.ts` or `.test.tsx` extension.

Example test:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
  
  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Build Process

The build process uses Electron Forge to create distributable applications:

1. Transpile TypeScript to JavaScript
2. Bundle React components with Webpack
3. Package the application with Electron
4. Create installers for each target platform

## Contributing

To contribute to the Anvil platform:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Submit a pull request

## Code Style Guidelines

- Use TypeScript for type safety
- Follow the Airbnb JavaScript Style Guide
- Use functional components with hooks for React
- Keep files under 300 lines
- Write comprehensive tests
- Document public APIs with JSDoc comments

## Conclusion

This developer documentation provides an overview of the Anvil platform architecture and guidance for extending and modifying the platform. For more detailed information, refer to the inline code documentation and the API reference.
