// desktop/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

const isDev = process.env.ELECTRON_DEV || false;
console.log("isDev=", process.env.ELECTRON_DEV);
let backendPath = '';

if (isDev) {
  backendPath = path.resolve('..', 'backend', 'server.js');
} else {
  backendPath = path.join(process.resourcesPath, 'backend', 'server.js');
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    minWidth: 1000,
    height: 600,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // win.loadFile(path.join(__dirname, '../frontend/dist/index.html')); // Load the built frontend
  win.loadURL('http://localhost:3000'); 
}

app.whenReady().then(() => {
  // Start the backend server
  /*
  exec('node ../../backend/server.js', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error starting backend: ${stderr}`);
      return;
    }
    console.log(`Backend started: ${stdout}`);
  });
  */

  // let backendPath = path.resolve('..', 'backend', 'app.js');
  app.server = require(backendPath);

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});