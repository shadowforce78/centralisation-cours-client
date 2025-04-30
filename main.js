const { app, BrowserWindow } = require('electron')
const path = require('path')

// Keep a global reference of the window object to prevent it from being garbage collected
let mainWindow = null

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    })

    // Load the Vite development server URL
    const startUrl = 'http://localhost:5173'
    mainWindow.loadURL(startUrl)
        .catch(e => {
            console.error('Failed to load URL:', e)
        })

    // Open the DevTools in development
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object
        mainWindow = null
    })

    // Log when page has finished loading
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Page loaded successfully')
    })

    // Log errors when they happen
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error(`Failed to load: ${errorDescription} (${errorCode})`)
    })
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    console.log('Electron app is ready')
    createWindow()
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    console.log('All windows closed')
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// Log any uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error)
})
