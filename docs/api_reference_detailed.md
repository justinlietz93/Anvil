# Anvil Desktop Platform - API Reference

## Core Services

### ConfigManager
Central configuration management service that handles all application settings.

#### Methods
- `initialize()`: Initializes the configuration system
- `get(section, key, defaultValue)`: Asynchronously retrieves a configuration value
- `getSync(section, key, defaultValue)`: Synchronously retrieves a configuration value
- `set(section, key, value)`: Asynchronously sets a configuration value
- `setSync(section, key, value)`: Synchronously sets a configuration value
- `getSecure(section, key)`: Retrieves a secure configuration value
- `setSecure(section, key, value)`: Sets a secure configuration value
- `deleteSecure(section, key)`: Deletes a secure configuration value

### ProjectService
Manages project files, saving, loading, and project metadata.

#### Methods
- `createProject(name, template)`: Creates a new project
- `openProject(path)`: Opens an existing project
- `saveProject(project)`: Saves the current project
- `exportProject(format)`: Exports the project to a specified format
- `getRecentProjects()`: Retrieves a list of recently opened projects
- `validateProject(project)`: Validates project structure and integrity

### ComponentRegistry
Manages the registration and retrieval of UI components.

#### Methods
- `registerComponent(component)`: Registers a new component
- `getComponent(id)`: Retrieves a component by ID
- `getAllComponents()`: Retrieves all registered components
- `getComponentsByCategory(category)`: Retrieves components by category
- `unregisterComponent(id)`: Unregisters a component

### BlueprintRegistry
Manages the registration and retrieval of blueprint nodes.

#### Methods
- `registerNode(node)`: Registers a new blueprint node
- `getNode(id)`: Retrieves a node by ID
- `getAllNodes()`: Retrieves all registered nodes
- `getNodesByCategory(category)`: Retrieves nodes by category
- `unregisterNode(id)`: Unregisters a node

### BlueprintEngine
Executes blueprint logic and manages the runtime environment.

#### Methods
- `executeBlueprint(blueprint, inputs)`: Executes a blueprint with given inputs
- `validateBlueprint(blueprint)`: Validates blueprint structure and connections
- `getNodeInputs(nodeId)`: Retrieves inputs for a specific node
- `setNodeOutput(nodeId, output)`: Sets the output for a specific node
- `addEventListener(event, callback)`: Adds an event listener
- `removeEventListener(event, callback)`: Removes an event listener

### DataConnector
Manages database connections and query execution.

#### Methods
- `connect(config)`: Establishes a database connection
- `disconnect()`: Closes the current database connection
- `executeQuery(query, params)`: Executes a database query
- `getSchema()`: Retrieves the database schema
- `getTables()`: Retrieves a list of tables
- `getTableColumns(table)`: Retrieves columns for a specific table
- `testConnection(config)`: Tests a database connection

### LLMAgentIntegration
Manages integration with LLM providers and agent execution.

#### Methods
- `configureProvider(provider, config)`: Configures an LLM provider
- `executePrompt(prompt, options)`: Executes a prompt against the configured provider
- `getAvailableProviders()`: Retrieves available LLM providers
- `validateApiKey(provider, key)`: Validates an API key for a provider
- `createAgent(config)`: Creates a new LLM agent
- `executeAgentAction(agent, action, params)`: Executes an agent action

### PluginManager
Manages plugin registration, lifecycle, and security.

#### Methods
- `registerPlugin(metadata, code)`: Registers a new plugin
- `unregisterPlugin(id)`: Unregisters a plugin
- `enablePlugin(id)`: Enables a plugin
- `disablePlugin(id)`: Disables a plugin
- `getPlugin(id)`: Retrieves a plugin by ID
- `getAllPlugins()`: Retrieves all registered plugins
- `getAvailablePermissions()`: Retrieves available permissions
- `hasPermission(pluginId, permission)`: Checks if a plugin has a specific permission
- `addHook(hookName, callback)`: Adds a hook
- `removeHook(hookName, callback)`: Removes a hook
- `applyHook(hookName, ...args)`: Applies a hook
- `applyFilter(filterName, value, ...args)`: Applies a filter

### ApplicationGenerator
Generates standalone applications from Anvil projects.

#### Methods
- `generateApplication(config)`: Generates an application with the specified configuration
- `onProgressUpdate(callback)`: Registers a callback for progress updates

## UI Components

### MainEditor
Main editor component that integrates all other components.

#### Props
- `project`: Current project
- `onSave`: Callback for save action
- `onExport`: Callback for export action

### ComponentLibrary
Displays available UI components for drag-and-drop.

#### Props
- `components`: List of available components
- `onDragStart`: Callback for drag start
- `filter`: Optional filter for components

### Workspace
Canvas for designing UI layouts.

#### Props
- `components`: Current components in the workspace
- `selectedComponent`: Currently selected component
- `onSelect`: Callback for component selection
- `onMove`: Callback for component movement
- `onResize`: Callback for component resizing
- `onDelete`: Callback for component deletion

### PropertiesPanel
Displays and edits properties of the selected component.

#### Props
- `component`: Currently selected component
- `onChange`: Callback for property changes
- `availableProperties`: List of available properties

### BlueprintEditor
Visual editor for creating blueprint logic.

#### Props
- `blueprint`: Current blueprint
- `onChange`: Callback for blueprint changes
- `availableNodes`: List of available nodes
- `validationErrors`: List of validation errors

### DatabaseConnectionManager
Manages database connections and configuration.

#### Props
- `connections`: List of configured connections
- `onConnect`: Callback for connection action
- `onDisconnect`: Callback for disconnection action
- `onAdd`: Callback for adding a new connection
- `onEdit`: Callback for editing a connection
- `onDelete`: Callback for deleting a connection

### LLMProviderManager
Manages LLM provider configuration.

#### Props
- `providers`: List of configured providers
- `onConfigure`: Callback for provider configuration
- `onTest`: Callback for testing a provider
- `onSelect`: Callback for selecting a provider

### PluginManagerUI
UI for managing plugins.

#### Props
- `plugins`: List of installed plugins
- `onAdd`: Callback for adding a plugin
- `onRemove`: Callback for removing a plugin
- `onEnable`: Callback for enabling a plugin
- `onDisable`: Callback for disabling a plugin
- `onConfigure`: Callback for configuring a plugin

### SettingsPanel
UI for managing application settings.

#### Props
- `settings`: Current settings
- `onSave`: Callback for saving settings
- `onReset`: Callback for resetting settings to defaults

### ApplicationExport
UI for exporting applications.

#### Props
- `project`: Current project
- `onExport`: Callback for export action
- `buildTypes`: Available build types
- `platforms`: Available target platforms
