const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Define fallback constants for when webpack constants aren't available
// These are normally provided by electron-forge's webpack plugin
if (typeof MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY === 'undefined') {
  global.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = path.join(__dirname, 'preload.js');
}

if (typeof MAIN_WINDOW_WEBPACK_ENTRY === 'undefined') {
  global.MAIN_WINDOW_WEBPACK_ENTRY = `file://${path.join(__dirname, 'index.html')}`;
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: true, // Keep frame but hide menu
  });

  // Hide the default menu to avoid duplication
  Menu.setApplicationMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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

// IPC handlers for file operations
ipcMain.handle('project:save', async (event, projectData, filePath) => {
  const fs = require('fs');
  try {
    await fs.promises.writeFile(filePath, JSON.stringify(projectData, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('project:load', async (event, filePath) => {
  const fs = require('fs');
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return { success: true, data: JSON.parse(data) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handlers for application export
ipcMain.handle('application:export', async (event, projectData, outputDir, platforms) => {
  // This will be implemented in the Application Generation phase
  return { success: true, message: 'Export functionality will be implemented in a future update.' };
});
