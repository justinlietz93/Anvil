import { ConfigManager } from './ConfigManager';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as electron from 'electron';

// Mock electron-builder for development purposes
// This avoids the need for the actual dependency during development
const electronBuilder = {
  Platform: {
    WINDOWS: 'windows',
    MAC: 'mac',
    LINUX: 'linux'
  }
};

/**
 * Interface for application build configuration
 */
export interface BuildConfig {
  appName: string;
  appVersion: string;
  appDescription: string;
  appAuthor: string;
  appLicense: string;
  buildType: string;
  outputDir: string;
  includeDevTools: boolean;
  targetPlatforms: string[];
}

/**
 * Interface for build result
 */
export interface BuildResult {
  outputPath: string;
  buildType: string;
  platforms: string[];
  fileSize: string;
}

/**
 * Type for progress update callback
 */
export type ProgressCallback = (progress: number, status: string) => void;

/**
 * Application Generator service for generating applications
 * 
 * @author Justin Lietz
 */
class ApplicationGeneratorClass {
  private progressCallbacks: ProgressCallback[] = [];
  
  /**
   * Register a callback for progress updates
   * 
   * @param callback - The callback function
   */
  onProgressUpdate(callback: ProgressCallback): void {
    this.progressCallbacks.push(callback);
  }
  
  /**
   * Update progress
   * 
   * @param progress - The progress percentage (0-100)
   * @param status - The status message
   */
  private updateProgress(progress: number, status: string): void {
    for (const callback of this.progressCallbacks) {
      callback(progress, status);
    }
  }
  
  /**
   * Generate an application
   * 
   * @param config - The build configuration
   * @returns The build result
   */
  async generateApplication(config: BuildConfig): Promise<BuildResult> {
    try {
      this.updateProgress(0, 'Starting build process...');
      
      // Validate configuration
      this.validateConfig(config);
      
      // Create output directory if it doesn't exist
      const outputDir = path.resolve(config.outputDir);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate application based on build type
      let result: BuildResult;
      
      switch (config.buildType) {
        case 'electron':
          result = await this.generateElectronApp(config, outputDir);
          break;
        case 'web':
          result = await this.generateWebApp(config, outputDir);
          break;
        case 'pwa':
          result = await this.generatePWA(config, outputDir);
          break;
        default:
          throw new Error(`Unsupported build type: ${config.buildType}`);
      }
      
      this.updateProgress(100, 'Build completed successfully');
      
      return result;
    } catch (error) {
      this.updateProgress(0, `Build failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Validate build configuration
   * 
   * @param config - The build configuration to validate
   */
  private validateConfig(config: BuildConfig): void {
    if (!config.appName) {
      throw new Error('Application name is required');
    }
    
    if (!config.appVersion) {
      throw new Error('Application version is required');
    }
    
    if (!config.buildType) {
      throw new Error('Build type is required');
    }
    
    if (!config.outputDir) {
      throw new Error('Output directory is required');
    }
    
    if (!config.targetPlatforms || config.targetPlatforms.length === 0) {
      throw new Error('At least one target platform is required');
    }
  }
  
  /**
   * Generate an Electron application
   * 
   * @param config - The build configuration
   * @param outputDir - The output directory
   * @returns The build result
   */
  private async generateElectronApp(config: BuildConfig, outputDir: string): Promise<BuildResult> {
    this.updateProgress(10, 'Preparing Electron application...');
    
    // Create temporary directory for the application
    const tempDir = path.join(outputDir, `temp-${uuidv4()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    
    try {
      // Create package.json
      const packageJson = {
        name: config.appName.toLowerCase().replace(/\s+/g, '-'),
        version: config.appVersion,
        description: config.appDescription,
        author: config.appAuthor,
        license: config.appLicense,
        main: 'main.js',
        scripts: {
          start: 'electron .'
        },
        dependencies: {
          electron: '^20.0.0'
        },
        build: {
          appId: `com.anvil.${config.appName.toLowerCase().replace(/\s+/g, '-')}`,
          productName: config.appName,
          directories: {
            output: path.join(outputDir, 'electron-dist')
          },
          files: [
            '**/*',
            '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
            '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
            '!**/node_modules/*.d.ts',
            '!**/node_modules/.bin',
            '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
            '!.editorconfig',
            '!**/._*',
            '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
            '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
            '!**/{appveyor.yml,.travis.yml,circle.yml}',
            '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
          ],
          mac: {
            category: 'public.app-category.developer-tools',
            target: ['dmg', 'zip']
          },
          win: {
            target: ['nsis', 'portable']
          },
          linux: {
            target: ['AppImage', 'deb'],
            category: 'Development'
          }
        }
      };
      
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
      this.updateProgress(20, 'Creating application files...');
      
      // Create main.js
      const mainJs = `
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools if configured
  ${config.includeDevTools ? 'mainWindow.webContents.openDevTools();' : '// DevTools disabled'}
};

// This method will be called when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
      `;
      
      fs.writeFileSync(path.join(tempDir, 'main.js'), mainJs);
      
      // Create preload.js
      const preloadJs = `
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(\`\${dependency}-version\`, process.versions[dependency]);
  }
});
      `;
      
      fs.writeFileSync(path.join(tempDir, 'preload.js'), preloadJs);
      
      // Create index.html
      const indexHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'" />
    <meta http-equiv="X-Content-Security-Policy" content="default-src 'self'; script-src 'self'" />
    <title>${config.appName}</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="container">
      <h1>${config.appName}</h1>
      <p>${config.appDescription || 'An application built with Anvil'}</p>
      <div class="info">
        <p>Version: ${config.appVersion}</p>
        <p>Author: ${config.appAuthor || 'Unknown'}</p>
        <p>License: ${config.appLicense}</p>
      </div>
      <div class="tech-info">
        <p>We are using Node.js <span id="node-version"></span>, Chromium <span id="chrome-version"></span>, and Electron <span id="electron-version"></span>.</p>
      </div>
    </div>
    <script src="renderer.js"></script>
  </body>
</html>
      `;
      
      fs.writeFileSync(path.join(tempDir, 'index.html'), indexHtml);
      
      // Create styles.css
      const stylesCss = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  color: #333;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  margin-top: 50px;
}

h1 {
  color: #2c3e50;
  text-align: center;
}

p {
  line-height: 1.6;
}

.info {
  margin-top: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.tech-info {
  margin-top: 30px;
  padding: 15px;
  background-color: #e8f4fc;
  border-radius: 5px;
  font-size: 0.9em;
}
      `;
      
      fs.writeFileSync(path.join(tempDir, 'styles.css'), stylesCss);
      
      // Create renderer.js
      const rendererJs = `
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// 'nodeIntegration' is turned off.
console.log('Renderer process started');
      `;
      
      fs.writeFileSync(path.join(tempDir, 'renderer.js'), rendererJs);
      
      this.updateProgress(40, 'Building Electron application...');
      
      // Map target platforms to electron-builder targets
      const platformMap: Record<string, electronBuilder.Platform> = {
        win: electronBuilder.Platform.WINDOWS,
        mac: electronBuilder.Platform.MAC,
        linux: electronBuilder.Platform.LINUX
      };
      
      const targetPlatforms = config.targetPlatforms
        .filter(platform => platformMap[platform])
        .map(platform => platformMap[platform]);
      
      if (targetPlatforms.length === 0) {
        throw new Error('No valid target platforms specified');
      }
      
      // Build the application
      this.updateProgress(60, 'Packaging application for distribution...');
      
      // In a real implementation, we would use electron-builder to build the application
      // For this simulation, we'll just create a dummy output
      const distDir = path.join(outputDir, 'electron-dist');
      fs.mkdirSync(distDir, { recursive: true });
      
      // Create dummy output files for each platform
      const platformOutputs: string[] = [];
      
      for (const platform of config.targetPlatforms) {
        let extension = '';
        let platformName = '';
        
        switch (platform) {
          case 'win':
            extension = '.exe';
            platformName = 'Windows';
            break;
          case 'mac':
            extension = '.dmg';
            platformName = 'macOS';
            break;
          case 'linux':
            extension = '.AppImage';
            platformName = 'Linux';
            break;
        }
        
        const outputFile = path.join(distDir, `${config.appName.toLowerCase().replace(/\s+/g, '-')}-${config.appVersion}-${platform}${extension}`);
        fs.writeFileSync(outputFile, `Dummy ${platformName} build for ${config.appName}`);
        platformOutputs.push(platformName);
      }
      
      this.updateProgress(90, 'Finalizing build...');
      
      // Clean up temporary directory
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      // Calculate total size of output files
      const totalSize = this.calculateDirectorySize(distDir);
      const formattedSize = this.formatFileSize(totalSize);
      
      return {
        outputPath: distDir,
        buildType: 'Electron',
        platforms: platformOutputs,
        fileSize: formattedSize
      };
    } catch (error) {
      // Clean up temporary directory in case of error
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      
      throw error;
    }
  }
  
  /**
   * Generate a web application
   * 
   * @param config - The build configuration
   * @param outputDir - The output directory
   * @returns The build result
   */
  private async generateWebApp(config: BuildConfig, outputDir: string): Promise<BuildResult> {
    this.updateProgress(10, 'Preparing web application...');
    
    // Create web output directory
    const webDir = path.join(outputDir, 'web-dist');
    fs.mkdirSync(webDir, { recursive: true });
    
    try {
      this.updateProgress(30, 'Creating web application files...');
      
      // Create index.html
      const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.appName}</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="container">
      <h1>${config.appName}</h1>
      <p>${config.appDescription || 'A web application built with Anvil'}</p>
      <div class="info">
        <p>Version: ${config.appVersion}</p>
        <p>Author: ${config.appAuthor || 'Unknown'}</p>
        <p>License: ${config.appLicense}</p>
      </div>
      <div class="content">
        <p>Your application content goes here.</p>
      </div>
    </div>
    <script src="app.js"></script>
  </body>
</html>
      `;
      
      fs.writeFileSync(path.join(webDir, 'index.html'), indexHtml);
      
      // Create styles.css
      const stylesCss = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  color: #333;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  margin-top: 50px;
}

h1 {
  color: #2c3e50;
  text-align: center;
}

p {
  line-height: 1.6;
}

.info {
  margin-top: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.content {
  margin-top: 30px;
  padding: 15px;
  background-color: #e8f4fc;
  border-radius: 5px;
}
      `;
      
      fs.writeFileSync(path.join(webDir, 'styles.css'), stylesCss);
      
      // Create app.js
      const appJs = `
// Main application script
document.addEventListener('DOMContentLoaded', () => {
  console.log('Application initialized');
});
      `;
      
      fs.writeFileSync(path.join(webDir, 'app.js'), appJs);
      
      this.updateProgress(70, 'Finalizing web application...');
      
      // Calculate total size of output files
      const totalSize = this.calculateDirectorySize(webDir);
      const formattedSize = this.formatFileSize(totalSize);
      
      return {
        outputPath: webDir,
        buildType: 'Web',
        platforms: ['Browser'],
        fileSize: formattedSize
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Generate a Progressive Web App
   * 
   * @param config - The build configuration
   * @param outputDir - The output directory
   * @returns The build result
   */
  private async generatePWA(config: BuildConfig, outputDir: string): Promise<BuildResult> {
    this.updateProgress(10, 'Preparing Progressive Web App...');
    
    // Create PWA output directory
    const pwaDir = path.join(outputDir, 'pwa-dist');
    fs.mkdirSync(pwaDir, { recursive: true });
    
    try {
      this.updateProgress(30, 'Creating PWA files...');
      
      // Create index.html
      const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.appName}</title>
    <link rel="stylesheet" href="styles.css" />
    <link rel="manifest" href="manifest.json" />
    <meta name="theme-color" content="#2c3e50" />
    <link rel="apple-touch-icon" href="icons/icon-192x192.png" />
  </head>
  <body>
    <div class="container">
      <h1>${config.appName}</h1>
      <p>${config.appDescription || 'A Progressive Web App built with Anvil'}</p>
      <div class="info">
        <p>Version: ${config.appVersion}</p>
        <p>Author: ${config.appAuthor || 'Unknown'}</p>
        <p>License: ${config.appLicense}</p>
      </div>
      <div class="content">
        <p>Your application content goes here.</p>
      </div>
    </div>
    <script src="app.js"></script>
    <script>
      // Register service worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
              console.log('ServiceWorker registration failed: ', error);
            });
        });
      }
    </script>
  </body>
</html>
      `;
      
      fs.writeFileSync(path.join(pwaDir, 'index.html'), indexHtml);
      
      // Create styles.css
      const stylesCss = `
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  color: #333;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  margin-top: 50px;
}

h1 {
  color: #2c3e50;
  text-align: center;
}

p {
  line-height: 1.6;
}

.info {
  margin-top: 30px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.content {
  margin-top: 30px;
  padding: 15px;
  background-color: #e8f4fc;
  border-radius: 5px;
}

@media (max-width: 600px) {
  .container {
    margin-top: 20px;
    padding: 15px;
  }
}
      `;
      
      fs.writeFileSync(path.join(pwaDir, 'styles.css'), stylesCss);
      
      // Create app.js
      const appJs = `
// Main application script
document.addEventListener('DOMContentLoaded', () => {
  console.log('PWA initialized');
});
      `;
      
      fs.writeFileSync(path.join(pwaDir, 'app.js'), appJs);
      
      // Create manifest.json
      const manifestJson = {
        name: config.appName,
        short_name: config.appName,
        description: config.appDescription,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2c3e50',
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      };
      
      fs.writeFileSync(
        path.join(pwaDir, 'manifest.json'),
        JSON.stringify(manifestJson, null, 2)
      );
      
      // Create service-worker.js
      const serviceWorkerJs = `
const CACHE_NAME = '${config.appName.toLowerCase().replace(/\s+/g, '-')}-v${config.appVersion}';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
      `;
      
      fs.writeFileSync(path.join(pwaDir, 'service-worker.js'), serviceWorkerJs);
      
      // Create icons directory
      const iconsDir = path.join(pwaDir, 'icons');
      fs.mkdirSync(iconsDir, { recursive: true });
      
      // Create dummy icon files
      const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
      
      for (const size of iconSizes) {
        fs.writeFileSync(
          path.join(iconsDir, `icon-${size}x${size}.png`),
          `Dummy icon file for size ${size}x${size}`
        );
      }
      
      this.updateProgress(70, 'Finalizing Progressive Web App...');
      
      // Calculate total size of output files
      const totalSize = this.calculateDirectorySize(pwaDir);
      const formattedSize = this.formatFileSize(totalSize);
      
      return {
        outputPath: pwaDir,
        buildType: 'Progressive Web App',
        platforms: ['Browser', 'Mobile'],
        fileSize: formattedSize
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Calculate the total size of a directory
   * 
   * @param dirPath - The directory path
   * @returns The total size in bytes
   */
  private calculateDirectorySize(dirPath: string): number {
    let totalSize = 0;
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.calculateDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }
  
  /**
   * Format file size in a human-readable format
   * 
   * @param bytes - The size in bytes
   * @returns The formatted size string
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

// Export singleton instance
export const ApplicationGenerator = new ApplicationGeneratorClass();
