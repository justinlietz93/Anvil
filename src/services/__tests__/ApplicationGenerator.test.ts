import { ConfigManager } from '../../services/ConfigManager';
import { ApplicationGenerator } from '../../services/ApplicationGenerator';

describe('ApplicationGenerator', () => {
  // Mock fs and path modules
  jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
    statSync: jest.fn(),
    readdirSync: jest.fn(),
    rmSync: jest.fn()
  }));
  
  jest.mock('path', () => ({
    resolve: jest.fn(path => path),
    join: jest.fn((dir, file) => `${dir}/${file}`)
  }));
  
  // Mock ConfigManager
  jest.mock('../../services/ConfigManager', () => ({
    ConfigManager: {
      initialize: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      getSync: jest.fn(),
      setSync: jest.fn()
    }
  }));
  
  // Import mocked modules
  const fs = require('fs');
  const path = require('path');
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock implementations
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    fs.statSync.mockReturnValue({ size: 1024, isDirectory: () => false });
    fs.readdirSync.mockReturnValue([]);
    path.resolve.mockImplementation(path => path);
    path.join.mockImplementation((dir, file) => `${dir}/${file}`);
  });
  
  describe('generateApplication', () => {
    test('validates configuration before building', async () => {
      // Create a spy on the validateConfig method
      const validateSpy = jest.spyOn(ApplicationGenerator as any, 'validateConfig');
      
      // Setup valid config
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Call generateApplication
      await ApplicationGenerator.generateApplication(config);
      
      // Check if validateConfig was called with the config
      expect(validateSpy).toHaveBeenCalledWith(config);
      
      // Restore the spy
      validateSpy.mockRestore();
    });
    
    test('throws error for invalid configuration', async () => {
      // Setup invalid config (missing appName)
      const config = {
        appName: '',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Expect generateApplication to throw an error
      await expect(ApplicationGenerator.generateApplication(config)).rejects.toThrow('Application name is required');
    });
    
    test('creates output directory if it does not exist', async () => {
      // Setup valid config
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Setup fs.existsSync to return false (directory does not exist)
      fs.existsSync.mockReturnValue(false);
      
      // Call generateApplication
      await ApplicationGenerator.generateApplication(config);
      
      // Check if mkdirSync was called with the output directory
      expect(fs.mkdirSync).toHaveBeenCalledWith('./dist', { recursive: true });
    });
    
    test('does not create output directory if it already exists', async () => {
      // Setup valid config
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Setup fs.existsSync to return true (directory exists)
      fs.existsSync.mockReturnValue(true);
      
      // Call generateApplication
      await ApplicationGenerator.generateApplication(config);
      
      // Check if mkdirSync was not called
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
    
    test('calls appropriate generator based on build type', async () => {
      // Create spies on the generator methods
      const electronSpy = jest.spyOn(ApplicationGenerator as any, 'generateElectronApp').mockResolvedValue({});
      const webSpy = jest.spyOn(ApplicationGenerator as any, 'generateWebApp').mockResolvedValue({});
      const pwaSpy = jest.spyOn(ApplicationGenerator as any, 'generatePWA').mockResolvedValue({});
      
      // Setup configs for different build types
      const electronConfig = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      const webConfig = { ...electronConfig, buildType: 'web' };
      const pwaConfig = { ...electronConfig, buildType: 'pwa' };
      
      // Call generateApplication for each build type
      await ApplicationGenerator.generateApplication(electronConfig);
      await ApplicationGenerator.generateApplication(webConfig);
      await ApplicationGenerator.generateApplication(pwaConfig);
      
      // Check if the appropriate generator was called for each build type
      expect(electronSpy).toHaveBeenCalledWith(electronConfig, './dist');
      expect(webSpy).toHaveBeenCalledWith(webConfig, './dist');
      expect(pwaSpy).toHaveBeenCalledWith(pwaConfig, './dist');
      
      // Restore the spies
      electronSpy.mockRestore();
      webSpy.mockRestore();
      pwaSpy.mockRestore();
    });
    
    test('throws error for unsupported build type', async () => {
      // Setup config with unsupported build type
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'unsupported',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Expect generateApplication to throw an error
      await expect(ApplicationGenerator.generateApplication(config)).rejects.toThrow('Unsupported build type: unsupported');
    });
    
    test('updates progress during build process', async () => {
      // Create a spy on the updateProgress method
      const updateProgressSpy = jest.spyOn(ApplicationGenerator as any, 'updateProgress');
      
      // Setup valid config
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Call generateApplication
      await ApplicationGenerator.generateApplication(config);
      
      // Check if updateProgress was called at least twice (start and end)
      expect(updateProgressSpy).toHaveBeenCalledTimes(expect.any(Number));
      expect(updateProgressSpy).toHaveBeenCalledWith(0, 'Starting build process...');
      expect(updateProgressSpy).toHaveBeenCalledWith(100, 'Build completed successfully');
      
      // Restore the spy
      updateProgressSpy.mockRestore();
    });
  });
  
  describe('generateElectronApp', () => {
    test('creates necessary files for Electron app', async () => {
      // Setup valid config
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Mock fs.readdirSync to return some files
      fs.readdirSync.mockReturnValue(['file1.txt', 'file2.txt']);
      
      // Mock fs.statSync to return file size
      fs.statSync.mockReturnValue({ size: 1024, isDirectory: () => false });
      
      // Call generateElectronApp directly
      const result = await (ApplicationGenerator as any).generateElectronApp(config, './dist');
      
      // Check if necessary files were created
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('package.json'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('main.js'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('preload.js'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('index.html'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('styles.css'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('renderer.js'), expect.any(String));
      
      // Check if result has expected properties
      expect(result).toHaveProperty('outputPath');
      expect(result).toHaveProperty('buildType', 'Electron');
      expect(result).toHaveProperty('platforms');
      expect(result).toHaveProperty('fileSize');
    });
    
    test('includes DevTools in main.js when configured', async () => {
      // Setup config with includeDevTools set to true
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: true,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Call generateElectronApp directly
      await (ApplicationGenerator as any).generateElectronApp(config, './dist');
      
      // Check if main.js includes DevTools
      const mainJsCalls = fs.writeFileSync.mock.calls.filter(call => 
        call[0].includes('main.js')
      );
      
      expect(mainJsCalls.length).toBe(1);
      expect(mainJsCalls[0][1]).toContain('mainWindow.webContents.openDevTools()');
    });
    
    test('excludes DevTools in main.js when not configured', async () => {
      // Setup config with includeDevTools set to false
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Call generateElectronApp directly
      await (ApplicationGenerator as any).generateElectronApp(config, './dist');
      
      // Check if main.js excludes DevTools
      const mainJsCalls = fs.writeFileSync.mock.calls.filter(call => 
        call[0].includes('main.js')
      );
      
      expect(mainJsCalls.length).toBe(1);
      expect(mainJsCalls[0][1]).not.toContain('mainWindow.webContents.openDevTools()');
      expect(mainJsCalls[0][1]).toContain('// DevTools disabled');
    });
    
    test('creates output files for each target platform', async () => {
      // Setup config with multiple target platforms
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Call generateElectronApp directly
      const result = await (ApplicationGenerator as any).generateElectronApp(config, './dist');
      
      // Check if output files were created for each platform
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('win.exe'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('mac.dmg'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('linux.AppImage'), expect.any(String));
      
      // Check if result includes all platforms
      expect(result.platforms).toContain('Windows');
      expect(result.platforms).toContain('macOS');
      expect(result.platforms).toContain('Linux');
    });
    
    test('cleans up temporary directory after build', async () => {
      // Setup valid config
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'electron',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Call generateElectronApp directly
      await (ApplicationGenerator as any).generateElectronApp(config, './dist');
      
      // Check if temporary directory was cleaned up
      expect(fs.rmSync).toHaveBeenCalledWith(expect.stringContaining('temp-'), { recursive: true, force: true });
    });
  });
  
  describe('generateWebApp', () => {
    test('creates necessary files for Web app', async () => {
      // Setup valid config
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'web',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Mock fs.readdirSync to return some files
      fs.readdirSync.mockReturnValue(['file1.txt', 'file2.txt']);
      
      // Mock fs.statSync to return file size
      fs.statSync.mockReturnValue({ size: 1024, isDirectory: () => false });
      
      // Call generateWebApp directly
      const result = await (ApplicationGenerator as any).generateWebApp(config, './dist');
      
      // Check if necessary files were created
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('index.html'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('styles.css'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('app.js'), expect.any(String));
      
      // Check if result has expected properties
      expect(result).toHaveProperty('outputPath');
      expect(result).toHaveProperty('buildType', 'Web');
      expect(result).toHaveProperty('platforms', ['Browser']);
      expect(result).toHaveProperty('fileSize');
    });
  });
  
  describe('generatePWA', () => {
    test('creates necessary files for PWA', async () => {
      // Setup valid config
      const config = {
        appName: 'Test App',
        appVersion: '1.0.0',
        appDescription: 'A test app',
        appAuthor: 'Test Author',
        appLicense: 'MIT',
        buildType: 'pwa',
        outputDir: './dist',
        includeDevTools: false,
        targetPlatforms: ['win', 'mac', 'linux']
      };
      
      // Mock fs.readdirSync to return some files
      fs.readdirSync.mockReturnValue(['file1.txt', 'file2.txt']);
      
      // Mock fs.statSync to return file size
      fs.statSync.mockReturnValue({ size: 1024, isDirectory: () => false });
      
      // Call generatePWA directly
      const result = await (ApplicationGenerator as any).generatePWA(config, './dist');
      
      // Check if necessary files were created
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('index.html'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('styles.css'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('app.js'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('manifest.json'), expect.any(String));
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining('service-worker.js'), expect.any(String));
      
      // Check if icons were created
      const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
      for (const size of iconSizes) {
        expect(fs.writeFileSync).toHaveBeenCalledWith(expect.stringContaining(`icon-${size}x${size}.png`), expect.any(String));
      }
      
      // Check if result has expected properties
      expect(result).toHaveProperty('outputPath');
      expect(result).toHaveProperty('buildType', 'Progressive Web App');
      expect(result).toHaveProperty('platforms', ['Browser', 'Mobile']);
      expect(result).toHaveProperty('fileSize');
    });
  });
  
  describe('onProgressUpdate', () => {
    test('registers progress callback', () => {
      // Create a mock callback
      const callback = jest.fn();
      
      // Register the callback
      ApplicationGenerator.onProgressUpdate(callback);
      
      // Call updateProgress
      (ApplicationGenerator as any).updateProgress(50, 'Test progress');
      
      // Check if callback was called with the correct arguments
      expect(callback).toHaveBeenCalledWith(50, 'Test progress');
    });
    
    test('supports multiple progress callbacks', () => {
      // Create mock callbacks
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      // Register the callbacks
      ApplicationGenerator.onProgressUpdate(callback1);
      ApplicationGenerator.onProgressUpdate(callback2);
      
      // Call updateProgress
      (ApplicationGenerator as any).updateProgress(50, 'Test progress');
      
      // Check if both callbacks were called with the correct arguments
      expect(callback1).toHaveBeenCalledWith(50, 'Test progress');
      expect(callback2).toHaveBeenCalledWith(50, 'Test progress');
    });
  });
  
  describe('utility methods', () => {
    test('calculateDirectorySize calculates total size correctly', () => {
      // Mock fs.readdirSync to return some files and directories
      fs.readdirSync.mockReturnValueOnce(['file1.txt', 'file2.txt', 'subdir']);
      fs.readdirSync.mockReturnValueOnce(['file3.txt']);
      
      // Mock fs.statSync to return file sizes and directory flag
      fs.statSync.mockImplementation((path) => {
        if (path.includes('subdir')) {
          return { size: 0, isDirectory: () => true };
        } else if (path.includes('file1.txt')) {
          return { size: 1024, isDirectory: () => false };
        } else if (path.includes('file2.txt')) {
          return { size: 2048, isDirectory: () => false };
        } else if (path.includes('file3.txt')) {
          return { size: 4096, isDirectory: () => false };
        }
        return { size: 0, isDirectory: () => false };
      });
      
      // Call calculateDirectorySize
      const size = (ApplicationGenerator as any).calculateDirectorySize('./test-dir');
      
      // Check if the total size is correct (1024 + 2048 + 4096 = 7168)
      expect(size).toBe(7168);
    });
    
    test('formatFileSize formats sizes correctly', () => {
      // Test various sizes
      expect((ApplicationGenerator as any).formatFileSize(500)).toBe('500.00 B');
      expect((ApplicationGenerator as any).formatFileSize(1500)).toBe('1.46 KB');
      expect((ApplicationGenerator as any).formatFileSize(1500000)).toBe('1.43 MB');
      expect((ApplicationGenerator as any).formatFileSize(1500000000)).toBe('1.40 GB');
      expect((ApplicationGenerator as any).formatFileSize(1500000000000)).toBe('1.36 TB');
    });
  });
});
