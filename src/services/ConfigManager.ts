import fs from 'fs';
import path from 'path';
import ElectronStore from 'electron-store';
import keytar from 'keytar';

/**
 * Interface for configuration value types
 */
export type ConfigValueType = string | number | boolean | object | null | undefined;

/**
 * Interface for configuration section
 */
export interface ConfigSection {
  [key: string]: ConfigValueType | ConfigSection;
}

/**
 * Interface for configuration data
 */
export interface ConfigData {
  [section: string]: ConfigSection;
}

/**
 * Configuration Manager class for centralized configuration management
 * 
 * @author Justin Lietz
 */
class ConfigManagerClass {
  private config: ConfigData = {};
  private configDir: string = path.join(process.cwd(), 'src', 'config');
  private defaultConfigPath: string = path.join(process.cwd(), 'default.config.json');
  private secureStore: ElectronStore;
  private readonly SERVICE_NAME = 'AnvilDesktopPlatform';
  private readonly SENSITIVE_KEY_PATTERNS = [
    'apiKey', 'api_key', 'key', 'token', 'secret', 'password', 'pwd', 'credential', 'auth'
  ];
  
  constructor() {
    // Initialize secure store with encryption
    this.secureStore = new ElectronStore({
      name: 'secure-config',
      encryptionKey: 'anvil-secure-storage-encryption-key', // This should be generated and stored securely in production
      clearInvalidConfig: true
    });
  }
  
  /**
   * Initialize the configuration manager
   * 
   * @param configDir - Optional custom configuration directory path
   * @param defaultConfigPath - Optional custom default configuration file path
   */
  initialize(configDir?: string, defaultConfigPath?: string): void {
    if (configDir) {
      this.configDir = configDir;
    }
    
    if (defaultConfigPath) {
      this.defaultConfigPath = defaultConfigPath;
    }
    
    // Ensure config directory exists
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
    
    // Load default configurations first
    this.loadDefaultConfigs();
    
    // Then load user configurations (which will override defaults)
    this.loadAllConfigs();
    
    // Load secure configurations
    this.loadSecureConfigs();
  }
  
  /**
   * Load default configurations from the external default config file
   */
  private loadDefaultConfigs(): void {
    try {
      if (fs.existsSync(this.defaultConfigPath)) {
        const defaultConfigData = fs.readFileSync(this.defaultConfigPath, 'utf8');
        const defaultConfig = JSON.parse(defaultConfigData);
        
        // Merge default config into the config object
        for (const section in defaultConfig) {
          this.config[section] = defaultConfig[section];
        }
      } else {
        console.warn(`Default configuration file not found at ${this.defaultConfigPath}`);
      }
    } catch (error) {
      console.error('Error loading default configurations:', error);
    }
  }
  
  /**
   * Load all configuration files from the config directory
   */
  private loadAllConfigs(): void {
    try {
      const files = fs.readdirSync(this.configDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const configName = file.replace('.json', '');
          this.loadConfig(configName);
        }
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  }
  
  /**
   * Load a specific configuration file
   * 
   * @param configName - The name of the configuration to load (without extension)
   */
  loadConfig(configName: string): void {
    try {
      const configPath = path.join(this.configDir, `${configName}.json`);
      
      if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath, 'utf8');
        this.config[configName] = JSON.parse(configData);
      }
    } catch (error) {
      console.error(`Error loading configuration ${configName}:`, error);
    }
  }
  
  /**
   * Load secure configurations from secure storage
   */
  private loadSecureConfigs(): void {
    try {
      // Load from electron-store encrypted storage
      const secureConfig = this.secureStore.get('secureConfig') as ConfigData || {};
      
      // Merge secure config into the config object
      for (const section in secureConfig) {
        if (!this.config[section]) {
          this.config[section] = {};
        }
        
        for (const key in secureConfig[section]) {
          this.config[section][key] = secureConfig[section][key];
        }
      }
    } catch (error) {
      console.error('Error loading secure configurations:', error);
    }
  }
  
  /**
   * Save a configuration section to file
   * 
   * @param section - The section name
   */
  saveConfig(section: string): void {
    try {
      // Create a copy of the section to save
      const sectionToSave: ConfigSection = { ...this.config[section] || {} };
      const secureSection: ConfigSection = {};
      let hasSecureKeys = false;
      
      // Identify and remove sensitive keys from the regular config
      for (const key in sectionToSave) {
        if (this.isSensitiveKey(key)) {
          secureSection[key] = sectionToSave[key];
          delete sectionToSave[key];
          hasSecureKeys = true;
        }
      }
      
      // Save regular config to file
      const configPath = path.join(this.configDir, `${section}.json`);
      const configData = JSON.stringify(sectionToSave, null, 2);
      fs.writeFileSync(configPath, configData, 'utf8');
      
      // Save sensitive keys to secure storage
      if (hasSecureKeys) {
        this.saveSecureConfig(section, secureSection);
      }
    } catch (error) {
      console.error(`Error saving configuration ${section}:`, error);
    }
  }
  
  /**
   * Save sensitive configuration to secure storage
   * 
   * @param section - The section name
   * @param secureConfig - The secure configuration data
   */
  private saveSecureConfig(section: string, secureConfig: ConfigSection): void {
    try {
      // Get existing secure config
      const existingSecureConfig = this.secureStore.get('secureConfig') as ConfigData || {};
      
      // Update section in secure config
      existingSecureConfig[section] = {
        ...(existingSecureConfig[section] || {}),
        ...secureConfig
      };
      
      // Save to electron-store encrypted storage
      this.secureStore.set('secureConfig', existingSecureConfig);
      
      // For highly sensitive values like API keys, also save to OS keychain
      for (const key in secureConfig) {
        const value = secureConfig[key];
        if (typeof value === 'string' && this.isHighlySensitiveKey(key)) {
          const account = `${section}.${key}`;
          keytar.setPassword(this.SERVICE_NAME, account, value);
        }
      }
    } catch (error) {
      console.error(`Error saving secure configuration for ${section}:`, error);
    }
  }
  
  /**
   * Check if a key is sensitive and should be stored securely
   * 
   * @param key - The key to check
   * @returns True if the key is sensitive, false otherwise
   */
  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.SENSITIVE_KEY_PATTERNS.some(pattern => lowerKey.includes(pattern));
  }
  
  /**
   * Check if a key is highly sensitive and should be stored in the OS keychain
   * 
   * @param key - The key to check
   * @returns True if the key is highly sensitive, false otherwise
   */
  private isHighlySensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return lowerKey.includes('apikey') || 
           lowerKey.includes('api_key') || 
           lowerKey.includes('password') || 
           lowerKey.includes('secret');
  }
  
  /**
   * Get a configuration value
   * 
   * @param section - The configuration section
   * @param key - The configuration key
   * @param defaultValue - The default value to return if the key is not found
   * @returns The configuration value or the default value
   */
  async get<T extends ConfigValueType>(section: string, key: string, defaultValue?: T): Promise<T> {
    // Check if this is a highly sensitive key that should be retrieved from keychain
    if (this.isHighlySensitiveKey(key)) {
      try {
        const account = `${section}.${key}`;
        const value = await keytar.getPassword(this.SERVICE_NAME, account);
        if (value !== null) {
          return value as unknown as T;
        }
      } catch (error) {
        console.error(`Error retrieving secure value for ${section}.${key}:`, error);
      }
    }
    
    // Fall back to regular config
    if (!this.config[section]) {
      return defaultValue as T;
    }
    
    const value = this.config[section][key];
    
    if (value === undefined) {
      return defaultValue as T;
    }
    
    return value as T;
  }
  
  /**
   * Get a configuration value synchronously (for non-sensitive data)
   * 
   * @param section - The configuration section
   * @param key - The configuration key
   * @param defaultValue - The default value to return if the key is not found
   * @returns The configuration value or the default value
   */
  getSync<T extends ConfigValueType>(section: string, key: string, defaultValue?: T): T {
    if (!this.config[section]) {
      return defaultValue as T;
    }
    
    const value = this.config[section][key];
    
    if (value === undefined) {
      return defaultValue as T;
    }
    
    return value as T;
  }
  
  /**
   * Get a nested configuration value
   * 
   * @param section - The configuration section
   * @param keys - The nested keys path
   * @param defaultValue - The default value to return if the path is not found
   * @returns The configuration value or the default value
   */
  getNested<T extends ConfigValueType>(section: string, keys: string[], defaultValue?: T): T {
    if (!this.config[section]) {
      return defaultValue as T;
    }
    
    let current: any = this.config[section];
    
    for (const key of keys) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return defaultValue as T;
      }
      
      current = current[key];
    }
    
    if (current === undefined) {
      return defaultValue as T;
    }
    
    return current as T;
  }
  
  /**
   * Set a configuration value
   * 
   * @param section - The configuration section
   * @param key - The configuration key
   * @param value - The configuration value
   */
  async set<T extends ConfigValueType>(section: string, key: string, value: T): Promise<void> {
    if (!this.config[section]) {
      this.config[section] = {};
    }
    
    this.config[section][key] = value;
    
    // If this is a sensitive key, store it securely
    if (this.isSensitiveKey(key)) {
      const secureSection: ConfigSection = {};
      secureSection[key] = value;
      await this.saveSecureConfig(section, secureSection);
      
      // Don't include sensitive data in the regular config file
      // when saving the section
      const sectionCopy = { ...this.config[section] };
      delete sectionCopy[key];
      
      const configPath = path.join(this.configDir, `${section}.json`);
      const configData = JSON.stringify(sectionCopy, null, 2);
      fs.writeFileSync(configPath, configData, 'utf8');
    } else {
      // For non-sensitive keys, save the entire section
      this.saveConfig(section);
    }
  }
  
  /**
   * Set a nested configuration value
   * 
   * @param section - The configuration section
   * @param keys - The nested keys path
   * @param value - The configuration value
   */
  setNested<T extends ConfigValueType>(section: string, keys: string[], value: T): void {
    if (!this.config[section]) {
      this.config[section] = {};
    }
    
    let current: any = this.config[section];
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      
      current = current[key];
    }
    
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    
    // Check if the last key is sensitive
    if (this.isSensitiveKey(lastKey)) {
      // Create a deep path for the secure storage
      const secureSection: ConfigSection = {};
      let currentSecure = secureSection;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        currentSecure[key] = {};
        currentSecure = currentSecure[key] as ConfigSection;
      }
      
      currentSecure[lastKey] = value;
      this.saveSecureConfig(section, secureSection);
    } else {
      // For non-sensitive keys, save the entire section
      this.saveConfig(section);
    }
  }
  
  /**
   * Check if a configuration value exists
   * 
   * @param section - The configuration section
   * @param key - The configuration key
   * @returns True if the configuration value exists, false otherwise
   */
  has(section: string, key: string): boolean {
    return this.config[section] !== undefined && this.config[section][key] !== undefined;
  }
  
  /**
   * Get all configuration data
   * 
   * @returns The complete configuration data
   */
  getAll(): ConfigData {
    return this.config;
  }
  
  /**
   * Get a configuration section
   * 
   * @param section - The section name
   * @returns The configuration section or an empty object if not found
   */
  getSection(section: string): ConfigSection {
    return this.config[section] || {};
  }
  
  /**
   * Create default configuration files if they don't exist
   */
  createDefaultConfigs(): void {
    // Load default configurations from external file
    if (!fs.existsSync(this.defaultConfigPath)) {
      console.warn(`Default configuration file not found at ${this.defaultConfigPath}`);
      return;
    }
    
    try {
      const defaultConfigData = fs.readFileSync(this.defaultConfigPath, 'utf8');
      const defaultConfig = JSON.parse(defaultConfigData);
      
      // Create config files for each section if they don't exist
      for (const section in defaultConfig) {
        this.createDefaultConfig(section, defaultConfig[section]);
      }
    } catch (error) {
      console.error('Error creating default configurations:', error);
    }
  }
  
  /**
   * Create a default configuration file if it doesn't exist
   * 
   * @param name - The configuration name
   * @param defaultConfig - The default configuration data
   */
  private createDefaultConfig(name: string, defaultConfig: ConfigSection): void {
    const configPath = path.join(this.configDir, `${name}.json`);
    
    if (!fs.existsSync(configPath)) {
      try {
        // Filter out sensitive keys from the default config
        const filteredConfig: ConfigSection = {};
        const secureConfig: ConfigSection = {};
        let hasSecureKeys = false;
        
        for (const key in defaultConfig) {
          if (this.isSensitiveKey(key)) {
            secureConfig[key] = defaultConfig[key];
            hasSecureKeys = true;
          } else {
            filteredConfig[key] = defaultConfig[key];
          }
        }
        
        // Save non-sensitive config to file
        fs.writeFileSync(configPath, JSON.stringify(filteredConfig, null, 2), 'utf8');
        this.config[name] = defaultConfig; // Keep the full config in memory
        
        // Save sensitive config to secure storage
        if (hasSecureKeys) {
          this.saveSecureConfig(name, secureConfig);
        }
      } catch (error) {
        console.error(`Error creating default configuration ${name}:`, error);
      }
    }
  }
  
  /**
   * Delete a sensitive configuration value from secure storage
   * 
   * @param section - The configuration section
   * @param key - The configuration key
   */
  async deleteSensitiveValue(section: string, key: string): Promise<void> {
    try {
      // Remove from in-memory config
      if (this.config[section] && this.config[section][key] !== undefined) {
        delete this.config[section][key];
      }
      
      // Remove from electron-store
      const existingSecureConfig = this.secureStore.get('secureConfig') as ConfigData || {};
      if (existingSecureConfig[section] && existingSecureConfig[section][key] !== undefined) {
        delete existingSecureConfig[section][key];
        this.secureStore.set('secureConfig', existingSecureConfig);
      }
      
      // Remove from OS keychain if it's a highly sensitive key
      if (this.isHighlySensitiveKey(key)) {
        const account = `${section}.${key}`;
        await keytar.deletePassword(this.SERVICE_NAME, account);
      }
    } catch (error) {
      console.error(`Error deleting sensitive value ${section}.${key}:`, error);
    }
  }
}

// Export singleton instance
export const ConfigManager = new ConfigManagerClass();
