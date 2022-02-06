const { Notification, ipcMain, app, nativeTheme, BrowserWindow, shell, dialog, globalShortcut, nativeImage, NativeImage, session } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

// -----------------
const fs = require('fs');
const os = require('os');
const { generateKeys, computeSharedKey, encryptMessage, decryptMessage } = require('../enc');
const { downloadFile } = require('./utils/file_api');

ipcMain.handle('alert', (event, ...args) => {
  dialog.showMessageBoxSync({ title: 'alert', message: process.platform })
})

function showNotification() {
  const notification = {
    title: 'Basic Notification',
    body: 'Notification from the Main process'
  }
  new Notification(notification).show()
}

// For Development Mode
app.setAppUserModelId('Telex');

// console.log(app.getPath('downloads'))
// app.addRecentDocument("./Users/Nicat/Downloads/rustup-init.exe")


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

console.log(process.execPath)
// * Windows Taskbar Tasks
app.setUserTasks([{
  program: path.join(app.getPath('downloads'), 'eye-icon.png'),// process.execPath,
  arguments: '--new-window',
  iconPath: path.join(__dirname, 'assets/images/telex-new.ico'),// process.execPath,
  iconIndex: 0,
  title: 'Task',
  description: 'description'
}])

const createWindow = (event, launchInfo) => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/images/telex-new.ico'), // './src/Assets/Images/icon.ico',
    backgroundColor: '#fff',
    center: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      devTools: isDev,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // * To Remove Menu Bar
  // mainWindow.removeMenu();

  // mainWindow.setProgressBar(0.5, { mode: 'normal' })

  // console.log({ event, launchInfo });
  // app.getGPUInfo('basic').then((value) => {
  //   return console.log(value.gpuDevice);
  // })

  // mainWindow.flashFrame(false);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // shell.openPath(app.getPath('documents'));

  // * To Open a dialog
  // dialog.showOpenDialog(mainWindow, {
  //   defaultPath: app.getPath('documents'),
  //   properties: ['multiSelections'],
  //   filters: [
  //     { name: 'Images', extensions: ['jpg', 'png'] }
  //   ]
  // }).then(result => {
  //   console.log(result);
  // }).catch(err => console.length(err));

  globalShortcut.unregisterAll();

  // To open the DevTools. (Ctrl + Shift + I)
  false && isDev && mainWindow.webContents.openDevTools();

  mainWindow.on('focus', () => mainWindow.webContents.send('ping', { isFocused: true }));

  mainWindow.on('blur', () => mainWindow.webContents.send('ping', { isFocused: false }));

  mainWindow.on('close', () => mainWindow.webContents.send('ping', { isFocused: false }))

  mainWindow.webContents.send('',)

  // showNotification();
};



// trial
// if (isDev) {
//   app.whenReady().then(() => {
//     fs.watch('.webpack/', (eventType, filename) => {
//       BrowserWindow.getAllWindows()[0].reload();
//     })
//   })
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// app.on('before-quit', () => mainWindow.webContents.send('ping', { isFocused: false }));

const reactDevToolsPath = path.join(
  os.homedir(),
  'AppData/Local/BraveSoftware/Brave-Browser/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.13.5_0'
);

const reduxDevToolsPath = path.join(
  os.homedir(),
  'AppData/Local/BraveSoftware/Brave-Browser/User Data/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.2_0'
);

app.whenReady().then(async () => {
  await session.defaultSession.loadExtension(reactDevToolsPath);
  await session.defaultSession.loadExtension(reduxDevToolsPath);
});


// * To receive a notification
ipcMain.on('notify', (_, message) => {
  const notification = {
    title: 'Notification',
    body: message
  }
  new Notification(notification).show()
})

// * To generate encryption keys
ipcMain.handle('generateKeys', (_) => {
  const result = generateKeys();
  fs.appendFile(path.join(app.getAppPath(), '.env'), `\nCRYPTO_PRIVATE_KEY=${result.privateKey}`, (err) => console.error('error: ', err));
  return result.publicKey;
})

// * To compute shared key
ipcMain.handle('computeSharedKey', (_, publicKey) => computeSharedKey(process.env.CRYPTO_PRIVATE_KEY, publicKey))

// * To encrypt message
ipcMain.handle('encryptMessage', (_, { message, sharedKey }) => encryptMessage(message, sharedKey))

// * To decrypt message
ipcMain.handle('decryptMessage', (_, { payload64, sharedKey }) => decryptMessage(payload64, sharedKey))

// * download files from links
ipcMain.handle('download', async (_, url, file_name) => await downloadFile({
  url, FolderToSave: path.join(app.getPath('downloads'), 'Telex Desktop'), file_name
}))

// * open a file
ipcMain.on('open-file', (_, path) => shell.openPath(path));


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



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
