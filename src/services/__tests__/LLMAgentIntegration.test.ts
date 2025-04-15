import { LLMAgentIntegration, LLMProviderConfig, LLMResponse } from '../LLMAgentIntegration';
import { ConfigManager } from '../ConfigManager';

// Mock the ConfigManager
jest.mock('../ConfigManager', () => ({
  ConfigManager: {
    initialize: jest.fn(),
    get: jest.fn().mockImplementation((section, key, defaultValue) => {
      if (section === 'llm' && key === 'providers.openai.defaultModel') {
        return 'gpt-4';
      }
      if (section === 'llm' && key === 'providers.openai.apiEndpoint') {
        return 'https://api.openai.com/v1';
      }
      if (section === 'llm' && key === 'providers.anthropic.defaultModel') {
        return 'claude-3-opus';
      }
      if (section === 'llm' && key === 'providers.anthropic.apiEndpoint') {
        return 'https://api.anthropic.com';
      }
      if (section === 'llm' && key === 'providers.google.defaultModel') {
        return 'gemini-pro';
      }
      if (section === 'llm' && key === 'providers.google.apiEndpoint') {
        return 'https://generativelanguage.googleapis.com';
      }
      return defaultValue;
    })
  }
}));

describe('LLMAgentIntegration', () => {
  beforeEach(() => {
    // Reset the LLMAgentIntegration before each test
    jest.clearAllMocks();
    // Clear all providers
    (LLMAgentIntegration as any).providers = new Map();
  });

  test('should initialize and load configurations', () => {
    LLMAgentIntegration.initialize();
    expect(ConfigManager.initialize).toHaveBeenCalled();
  });

  test('should register an LLM provider', () => {
    const providerId = LLMAgentIntegration.registerProvider({
      name: 'Test Provider',
      type: 'openai',
      apiKey: 'test-api-key',
      model: 'gpt-4',
      apiEndpoint: 'https://api.openai.com/v1'
    });

    expect(providerId).toBeDefined();
    expect(typeof providerId).toBe('string');
    
    const provider = LLMAgentIntegration.getProvider(providerId);
    expect(provider).toBeDefined();
    expect(provider?.name).toBe('Test Provider');
    expect(provider?.type).toBe('openai');
    expect(provider?.apiKey).toBe('test-api-key');
    expect(provider?.model).toBe('gpt-4');
    expect(provider?.apiEndpoint).toBe('https://api.openai.com/v1');
  });

  test('should get all LLM providers', () => {
    const id1 = LLMAgentIntegration.registerProvider({
      name: 'Provider 1',
      type: 'openai',
      apiKey: 'key1',
      model: 'gpt-4'
    });

    const id2 = LLMAgentIntegration.registerProvider({
      name: 'Provider 2',
      type: 'anthropic',
      apiKey: 'key2',
      model: 'claude-3-opus'
    });

    const providers = LLMAgentIntegration.getAllProviders();
    expect(providers.length).toBe(2);
    expect(providers[0].name).toBe('Provider 1');
    expect(providers[1].name).toBe('Provider 2');
  });

  test('should update an LLM provider', () => {
    const providerId = LLMAgentIntegration.registerProvider({
      name: 'Original Name',
      type: 'openai',
      apiKey: 'original-key',
      model: 'gpt-3.5-turbo'
    });

    const updated = LLMAgentIntegration.updateProvider(providerId, {
      name: 'Updated Name',
      apiKey: 'updated-key',
      model: 'gpt-4'
    });

    expect(updated).toBe(true);
    
    const provider = LLMAgentIntegration.getProvider(providerId);
    expect(provider?.name).toBe('Updated Name');
    expect(provider?.apiKey).toBe('updated-key');
    expect(provider?.model).toBe('gpt-4');
    expect(provider?.type).toBe('openai'); // Type should remain unchanged
  });

  test('should remove an LLM provider', () => {
    const providerId = LLMAgentIntegration.registerProvider({
      name: 'Test Provider',
      type: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4'
    });

    expect(LLMAgentIntegration.getProvider(providerId)).toBeDefined();
    
    const removed = LLMAgentIntegration.removeProvider(providerId);
    expect(removed).toBe(true);
    expect(LLMAgentIntegration.getProvider(providerId)).toBeUndefined();
  });

  test('should create an OpenAI provider with default model and endpoint from config', () => {
    const providerId = LLMAgentIntegration.createOpenAIProvider('OpenAI Test', 'test-key');
    
    const provider = LLMAgentIntegration.getProvider(providerId);
    expect(provider?.name).toBe('OpenAI Test');
    expect(provider?.type).toBe('openai');
    expect(provider?.apiKey).toBe('test-key');
    expect(provider?.model).toBe('gpt-4'); // From mocked ConfigManager
    expect(provider?.apiEndpoint).toBe('https://api.openai.com/v1'); // From mocked ConfigManager
  });

  test('should create an Anthropic provider with default model and endpoint from config', () => {
    const providerId = LLMAgentIntegration.createAnthropicProvider('Anthropic Test', 'test-key');
    
    const provider = LLMAgentIntegration.getProvider(providerId);
    expect(provider?.name).toBe('Anthropic Test');
    expect(provider?.type).toBe('anthropic');
    expect(provider?.apiKey).toBe('test-key');
    expect(provider?.model).toBe('claude-3-opus'); // From mocked ConfigManager
    expect(provider?.apiEndpoint).toBe('https://api.anthropic.com'); // From mocked ConfigManager
  });

  test('should create a Google provider with default model and endpoint from config', () => {
    const providerId = LLMAgentIntegration.createGoogleProvider('Google Test', 'test-key');
    
    const provider = LLMAgentIntegration.getProvider(providerId);
    expect(provider?.name).toBe('Google Test');
    expect(provider?.type).toBe('google');
    expect(provider?.apiKey).toBe('test-key');
    expect(provider?.model).toBe('gemini-pro'); // From mocked ConfigManager
    expect(provider?.apiEndpoint).toBe('https://generativelanguage.googleapis.com'); // From mocked ConfigManager
  });

  test('should send a request successfully', async () => {
    const providerId = LLMAgentIntegration.registerProvider({
      name: 'Test Provider',
      type: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4'
    });

    const result = await LLMAgentIntegration.sendRequest(providerId, {
      prompt: 'Test prompt'
    });
    
    expect(result.success).toBe(true);
    expect(result.text).toBeDefined();
    expect(result.usage).toBeDefined();
    expect(result.usage?.promptTokens).toBeDefined();
    expect(result.usage?.completionTokens).toBeDefined();
    expect(result.usage?.totalTokens).toBeDefined();
  });

  test('should handle request with invalid provider ID', async () => {
    const result = await LLMAgentIntegration.sendRequest('invalid-id', {
      prompt: 'Test prompt'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Provider not found');
  });
});
