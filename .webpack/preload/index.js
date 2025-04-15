// Preload script
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Project operations
  saveProject: (projectData, filePath) => {
    return ipcRenderer.invoke('project:save', projectData, filePath);
  },
  loadProject: (filePath) => {
    return ipcRenderer.invoke('project:load', filePath);
  },
  
  // Application export
  exportApplication: (projectData, outputDir, platforms) => {
    return ipcRenderer.invoke('application:export', projectData, outputDir, platforms);
  },
  
  // System information
  getAppVersion: () => {
    return process.env.npm_package_version;
  },
  
  // Dialog operations
  showOpenDialog: (options) => {
    return ipcRenderer.invoke('dialog:showOpen', options);
  },
  showSaveDialog: (options) => {
    return ipcRenderer.invoke('dialog:showSave', options);
  }
});
