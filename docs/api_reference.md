# Anvil Desktop Platform - API Reference

This API reference documents the core services and interfaces of the Anvil platform for developers who want to extend or integrate with the platform.

## ConfigManager

The `ConfigManager` provides a centralized configuration system.

### Methods

#### `initialize()`
Initializes the configuration system, loading configuration files.

```typescript
ConfigManager.initialize(): void
```

#### `get(section, key, defaultValue)`
Gets a configuration value, returning the default if not found.

```typescript
ConfigManager.get<T>(section: string, key: string, defaultValue: T): T
```

#### `set(section, key, value)`
Sets a configuration value.

```typescript
ConfigManager.set<T>(section: string, key: string, value: T): void
```

#### `save()`
Saves all configuration changes to disk.

```typescript
ConfigManager.save(): Promise<void>
```

## ProjectService

The `ProjectService` handles project management.

### Methods

#### `createProject(name)`
Creates a new project.

```typescript
ProjectService.createProject(name: string): Project
```

#### `loadProject(path)`
Loads a project from disk.

```typescript
ProjectService.loadProject(path: string): Promise<Project>
```

#### `saveProject(project, path)`
Saves a project to disk.

```typescript
ProjectService.saveProject(project: Project, path?: string): Promise<void>
```

#### `exportProject(project, options)`
Exports a project as a standalone application.

```typescript
ProjectService.exportProject(project: Project, options: ExportOptions): Promise<string>
```

## ComponentRegistry

The `ComponentRegistry` manages UI components.

### Methods

#### `registerComponent(component)`
Registers a component with the registry.

```typescript
ComponentRegistry.registerComponent(component: ComponentDefinition): void
```

#### `getComponent(id)`
Gets a component by ID.

```typescript
ComponentRegistry.getComponent(id: string): ComponentDefinition | null
```

#### `getAllComponents()`
Gets all registered components.

```typescript
ComponentRegistry.getAllComponents(): ComponentDefinition[]
```

#### `createComponentInstance(id, props)`
Creates an instance of a component.

```typescript
ComponentRegistry.createComponentInstance(id: string, props: any): React.ReactElement | null
```

## BlueprintRegistry

The `BlueprintRegistry` manages blueprint nodes.

### Methods

#### `registerNodeType(nodeType)`
Registers a node type with the registry.

```typescript
BlueprintRegistry.registerNodeType(nodeType: NodeDefinition): void
```

#### `getNodeType(id)`
Gets a node type by ID.

```typescript
BlueprintRegistry.getNodeType(id: string): NodeDefinition | null
```

#### `getAllNodeTypes()`
Gets all registered node types.

```typescript
BlueprintRegistry.getAllNodeTypes(): NodeDefinition[]
```

#### `createNodeInstance(id, data)`
Creates an instance of a node.

```typescript
BlueprintRegistry.createNodeInstance(id: string, data?: any): Node | null
```

## BlueprintEngine

The `BlueprintEngine` executes blueprint logic.

### Methods

#### `addNode(node)`
Adds a node to the engine.

```typescript
BlueprintEngine.addNode(node: Node): void
```

#### `removeNode(nodeId)`
Removes a node from the engine.

```typescript
BlueprintEngine.removeNode(nodeId: string): void
```

#### `addConnection(connection)`
Adds a connection between nodes.

```typescript
BlueprintEngine.addConnection(connection: Connection): void
```

#### `removeConnection(connectionId)`
Removes a connection.

```typescript
BlueprintEngine.removeConnection(connectionId: string): void
```

#### `executeNode(nodeId, externalInputs)`
Executes a node with the given inputs.

```typescript
BlueprintEngine.executeNode(nodeId: string, externalInputs?: any): Promise<any>
```

#### `addEventListener(eventType, callback)`
Adds an event listener.

```typescript
BlueprintEngine.addEventListener(eventType: string, callback: Function): void
```

#### `removeEventListener(eventType)`
Removes an event listener.

```typescript
BlueprintEngine.removeEventListener(eventType: string): void
```

#### `triggerEvent(eventType, data)`
Triggers an event.

```typescript
BlueprintEngine.triggerEvent(eventType: string, data?: any): void
```

## DataConnector

The `DataConnector` manages database connections.

### Methods

#### `createSQLiteConnection(name, path)`
Creates a SQLite database connection.

```typescript
DataConnector.createSQLiteConnection(name: string, path: string): string
```

#### `createPostgreSQLConnection(name, config)`
Creates a PostgreSQL database connection.

```typescript
DataConnector.createPostgreSQLConnection(name: string, config: PostgreSQLConfig): string
```

#### `registerConnection(config)`
Registers a database connection.

```typescript
DataConnector.registerConnection(config: DatabaseConfig): string
```

#### `removeConnection(connectionId)`
Removes a database connection.

```typescript
DataConnector.removeConnection(connectionId: string): boolean
```

#### `getConnection(connectionId)`
Gets a database connection by ID.

```typescript
DataConnector.getConnection(connectionId: string): DatabaseConfig | null
```

#### `getAllConnections()`
Gets all database connections.

```typescript
DataConnector.getAllConnections(): DatabaseConfig[]
```

#### `executeQuery(connectionId, query, params)`
Executes a query on a database connection.

```typescript
DataConnector.executeQuery(connectionId: string, query: string, params?: any[]): Promise<QueryResult>
```

## LLMAgentIntegration

The `LLMAgentIntegration` service handles AI integration.

### Methods

#### `createOpenAIProvider(name, apiKey, model)`
Creates an OpenAI provider.

```typescript
LLMAgentIntegration.createOpenAIProvider(name: string, apiKey: string, model: string): string
```

#### `createAnthropicProvider(name, apiKey, model)`
Creates an Anthropic provider.

```typescript
LLMAgentIntegration.createAnthropicProvider(name: string, apiKey: string, model: string): string
```

#### `createGoogleProvider(name, apiKey, model)`
Creates a Google AI provider.

```typescript
LLMAgentIntegration.createGoogleProvider(name: string, apiKey: string, model: string): string
```

#### `registerProvider(config)`
Registers an LLM provider.

```typescript
LLMAgentIntegration.registerProvider(config: LLMProviderConfig): string
```

#### `removeProvider(providerId)`
Removes an LLM provider.

```typescript
LLMAgentIntegration.removeProvider(providerId: string): boolean
```

#### `getProvider(providerId)`
Gets an LLM provider by ID.

```typescript
LLMAgentIntegration.getProvider(providerId: string): LLMProviderConfig | null
```

#### `getAllProviders()`
Gets all LLM providers.

```typescript
LLMAgentIntegration.getAllProviders(): LLMProviderConfig[]
```

#### `sendRequest(providerId, request)`
Sends a request to an LLM provider.

```typescript
LLMAgentIntegration.sendRequest(providerId: string, request: LLMRequest): Promise<LLMResponse>
```

## PluginManager

The `PluginManager` handles the plugin system.

### Methods

#### `registerPlugin(metadata, exports)`
Registers a plugin with the system.

```typescript
PluginManager.registerPlugin(metadata: PluginMetadata, exports: any): string
```

#### `unregisterPlugin(pluginId)`
Unregisters a plugin.

```typescript
PluginManager.unregisterPlugin(pluginId: string): boolean
```

#### `enablePlugin(pluginId)`
Enables a plugin.

```typescript
PluginManager.enablePlugin(pluginId: string): boolean
```

#### `disablePlugin(pluginId)`
Disables a plugin.

```typescript
PluginManager.disablePlugin(pluginId: string): boolean
```

#### `getPlugin(pluginId)`
Gets a plugin by ID.

```typescript
PluginManager.getPlugin(pluginId: string): Plugin | null
```

#### `getAllPlugins()`
Gets all registered plugins.

```typescript
PluginManager.getAllPlugins(): Plugin[]
```

## Type Definitions

### Project

```typescript
interface Project {
  id: string;
  name: string;
  version: string;
  components: ComponentInstance[];
  blueprints: Blueprint[];
  settings: ProjectSettings;
}
```

### ComponentDefinition

```typescript
interface ComponentDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  propertyMetadata: PropertyMetadata;
  render: (props: any) => React.ReactElement;
}
```

### ComponentInstance

```typescript
interface ComponentInstance {
  id: string;
  typeId: string;
  props: any;
  children: ComponentInstance[];
}
```

### NodeDefinition

```typescript
interface NodeDefinition {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  compute: (inputs: any, data: any) => Promise<any>;
}
```

### PortDefinition

```typescript
interface PortDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue: any;
}
```

### Node

```typescript
interface Node {
  id: string;
  typeId: string;
  data: any;
  position: { x: number, y: number };
  outputs: { [key: string]: any };
}
```

### Connection

```typescript
interface Connection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePortId: string;
  targetPortId: string;
}
```

### Blueprint

```typescript
interface Blueprint {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  connections: Connection[];
}
```

### DatabaseConfig

```typescript
interface DatabaseConfig {
  id: string;
  name: string;
  type: 'sqlite' | 'postgresql' | 'mysql' | 'sqlserver' | 'mongodb';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}
```

### QueryResult

```typescript
interface QueryResult {
  success: boolean;
  results?: any[];
  error?: string;
}
```

### LLMProviderConfig

```typescript
interface LLMProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  apiKey: string;
  model: string;
  apiEndpoint?: string;
}
```

### LLMRequest

```typescript
interface LLMRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  options?: any;
}
```

### LLMResponse

```typescript
interface LLMResponse {
  success: boolean;
  text?: string;
  error?: string;
}
```

### PluginMetadata

```typescript
interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
}
```

### Plugin

```typescript
interface Plugin {
  metadata: PluginMetadata;
  exports: any;
  isEnabled: boolean;
}
```

### ExportOptions

```typescript
interface ExportOptions {
  platform: 'windows' | 'macos' | 'linux' | 'all';
  outputDir: string;
  appName: string;
  appVersion: string;
  appIcon?: string;
  includeDevTools: boolean;
}
```
