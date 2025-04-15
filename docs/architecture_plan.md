# Anvil Platform Architecture Plan

## Overview

Anvil is a no-code desktop platform that enables users to visually create modern, professional-looking, cross-platform desktop applications based on the Electron framework. This document outlines the architectural design for implementing the Anvil platform according to the specified requirements.

## Core Architecture Principles

1. **Modularity**: Strict separation of concerns with no file exceeding 300 lines
2. **Extensibility**: Clear APIs for plugins and extensions
3. **Performance**: Optimized for both the Anvil platform and generated applications
4. **Usability**: Intuitive interface for non-programmers
5. **Security**: Best practices for credential storage and Electron security
6. **Testability**: Design for >=90% test coverage

## Technology Stack

- **Core Framework**: Electron (latest LTS)
- **Backend**: Node.js (latest LTS)
- **Frontend**: React (latest stable)
- **UI Component Library**: Fluent UI React
- **State Management**: React Context API + Hooks (with potential for Zustand for complex state)
- **Testing**: Jest + React Testing Library
- **Build System**: Webpack + Electron Forge
- **Database**: SQLite (embedded for local storage)

## High-Level Architecture

The Anvil platform will follow a layered architecture with clear separation between:

1. **Presentation Layer**: The Anvil IDE interface
2. **Application Layer**: Core business logic and services
3. **Domain Layer**: Models and entities
4. **Infrastructure Layer**: External integrations and persistence

### System Components

```
Anvil Platform
├── Main Process (Electron)
│   ├── Application Lifecycle Management
│   ├── Window Management
│   ├── IPC Communication
│   ├── File System Access
│   └── Build/Export Service
├── Renderer Process (React)
│   ├── IDE UI Components
│   │   ├── Workspace
│   │   ├── Component Library Panel
│   │   ├── Properties Panel
│   │   ├── Blueprint Editor
│   │   └── Preview Window
│   ├── State Management
│   │   ├── Project State
│   │   ├── UI State
│   │   └── Application State
│   └── Services
│       ├── Component Registry
│       ├── Blueprint Engine
│       ├── Data Connector Service
│       ├── LLM Integration Service
│       └── Plugin Manager
└── Shared
    ├── Models
    ├── Utilities
    └── Constants
```

## Detailed Component Design

### 1. Main Process Components

#### Application Lifecycle Management
- Handles application startup, shutdown, and updates
- Manages application settings and configuration

#### Window Management
- Creates and manages application windows
- Handles window state persistence

#### IPC Communication
- Facilitates communication between main and renderer processes
- Implements secure IPC channels with proper validation

#### File System Access
- Provides safe access to the file system
- Manages project files and assets

#### Build/Export Service
- Compiles user projects into standalone Electron applications
- Packages applications for different platforms

### 2. Renderer Process Components

#### IDE UI Components

##### Workspace
- Main editing area for the application
- Implements drag-and-drop functionality
- Manages component layout and hierarchy

##### Component Library Panel
- Displays available UI components
- Organizes components by category
- Provides search and filtering capabilities

##### Properties Panel
- Shows properties of selected components
- Allows editing of component properties
- Provides validation for property values

##### Blueprint Editor
- Visual node-based programming interface
- Implements node connection and data flow
- Provides debugging capabilities

##### Preview Window
- Real-time preview of the application
- Simulates application behavior

#### State Management

##### Project State
- Manages the current project structure
- Handles project saving and loading
- Tracks project modifications

##### UI State
- Manages IDE interface state
- Handles panel visibility and layout
- Tracks selection state

##### Application State
- Manages the state of the application being built
- Handles application settings and configuration

#### Services

##### Component Registry
- Registers and manages available UI components
- Provides component metadata and rendering information

##### Blueprint Engine
- Executes visual programming logic
- Manages node types and connections
- Handles event propagation

##### Data Connector Service
- Manages database connections
- Provides data access and manipulation capabilities
- Implements visual query building

##### LLM Integration Service
- Manages LLM agent configurations
- Handles API communication with LLM providers
- Processes LLM responses

##### Plugin Manager
- Loads and manages plugins
- Enforces plugin API contracts
- Handles plugin lifecycle

### 3. Shared Components

#### Models
- Project model
- Component model
- Blueprint model
- Data model

#### Utilities
- Common utility functions
- Error handling
- Logging

#### Constants
- Application constants
- Error codes
- Event types

## Data Flow Architecture

### Component Interaction Flow
1. User drags component from library to workspace
2. Component is instantiated with default properties
3. Component is rendered in workspace
4. Properties panel updates to show component properties
5. User edits properties
6. Component updates in real-time

### Blueprint Execution Flow
1. Event triggers blueprint execution
2. Blueprint engine traverses node graph
3. Node inputs and outputs are processed
4. Data flows through connections
5. UI updates based on blueprint execution results

### Data Persistence Flow
1. User creates/modifies project
2. Changes are tracked in memory
3. User saves project
4. Project is serialized to JSON
5. JSON is saved to disk

## Plugin Architecture

The plugin system will use a well-defined API to allow extensions in these categories:

1. **UI Components**: Custom components that integrate with the component registry
2. **Blueprint Nodes**: Custom nodes that extend the blueprint system
3. **Data Connectors**: Custom connectors for different data sources
4. **LLM Integrations**: Pre-configured LLM agent integrations
5. **Themes**: Custom visual themes for applications

Plugins will be packaged as NPM modules with a specific structure and manifest file that defines their capabilities and integration points.

## Security Architecture

1. **Credential Storage**: Secure storage of database credentials and API keys
2. **Electron Security**: Implementation of Electron security best practices
   - Context isolation
   - Secure IPC channels
   - Limited Node.js integration in renderers
3. **Input Validation**: Thorough validation of all user inputs
4. **Plugin Sandboxing**: Isolation of plugin code execution

## Error Handling Strategy

1. **Platform Errors**: Comprehensive error handling within the Anvil platform
   - User-friendly error messages
   - Detailed logging for debugging
   - Recovery mechanisms where possible
2. **Generated Application Errors**: Blueprint nodes for error handling in generated applications
   - Try/Catch nodes
   - Error logging nodes
   - User notification nodes

## Testing Strategy

To achieve the required 90% test coverage:

1. **Unit Tests**:
   - Individual components, functions, and classes
   - Isolated testing of React components
   - Mock external dependencies

2. **Integration Tests**:
   - Component interactions
   - Service integrations
   - State management

3. **End-to-End Tests**:
   - Complete workflows
   - Application generation and export

## Implementation Phases

### Phase 1: Core Infrastructure
- Project setup and configuration
- Main process implementation
- Basic renderer process structure
- IPC communication setup

### Phase 2: Visual GUI Builder (MVP)
- Component library implementation
- Workspace implementation
- Properties panel implementation
- Component drag-and-drop
- Component property editing

### Phase 3: Blueprint System (MVP)
- Blueprint editor implementation
- Node types implementation
- Connection system
- Data flow implementation
- Event handling

### Phase 4: Application Generation
- Project serialization
- Electron application template
- Build and packaging system
- Export workflow

### Phase 5: Data Connectivity
- Database connector implementation
- Visual query builder
- Data binding to UI components

### Phase 6: LLM Integration
- LLM agent configuration interface
- API integration
- Response handling

### Phase 7: Extensibility & Marketplace
- Plugin API implementation
- Plugin loading system
- Plugin marketplace interface

### Phase 8: Testing & Documentation
- Comprehensive test suite implementation
- Documentation generation
- User guides and tutorials

## Performance Considerations

1. **Anvil Platform Performance**:
   - Efficient rendering of complex UI
   - Optimized state management
   - Background processing for intensive tasks

2. **Generated Application Performance**:
   - Optimized Electron configuration
   - Efficient React rendering
   - Minimal resource usage

## Conclusion

This architecture plan provides a comprehensive framework for implementing the Anvil platform according to the specified requirements. The modular design ensures maintainability and extensibility, while the phased implementation approach prioritizes the MVP components (Visual GUI Builder and Blueprint System) as specified.

The architecture adheres to the strict quality requirements, including file size limits, modularity, and testability, while providing a solid foundation for all the required features. The focus on user experience and intuitive interfaces ensures that the platform will be accessible to the target audience of non-programmers.
