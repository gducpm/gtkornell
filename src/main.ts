import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import fs from 'fs/promises';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}


// Handle spawning new windows
ipcMain.on('new-window', (_event, filename: string) => {
	const newWindow = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		icon: path.join(__dirname, 'assets/icon.png'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
		show: false,
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		newWindow.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/${filename}`);
	} else {
		newWindow.loadFile(path.join(__dirname, `../renderer/${filename}`));
	}

	newWindow.setMenu(null);
	newWindow.maximize();
	newWindow.show();
});

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		icon: path.join(__dirname, 'assets/icon.png'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
		show: false,
	});

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
		);
	}

	mainWindow.setMenu(null);
	mainWindow.maximize();
	mainWindow.show();

	// Open the DevTools.
	//mainWindow.webContents.openDevTools();

};

ipcMain.handle('open-file-dialog', async (_event): Promise<string | null> => {
	const result = await dialog.showOpenDialog({
		title: 'Select a file',
		properties: ['openFile'],
		filters: [{ name: 'Kornell Files', extensions: ['kornell', 'md'] }]
	});

	if (result.canceled) return null;
	return result.filePaths[0];
});

ipcMain.handle('save-file-dialog', async (_event, defaultFileName: string = 'file.kornell'): Promise<string | null> => {
	const { canceled, filePath } = await dialog.showSaveDialog({
		title: 'Save your Kornell file',
		defaultPath: defaultFileName,
		filters: [{ name: 'Kornell Files', extensions: ['kornell', 'md'] }]
	});

	if (canceled) return null; // user pressed cancel
	return filePath;           // path to save the file
});

ipcMain.handle('open-file', async (_event, filePath: string): Promise<string | null> => {
	try {
		if (filePath == null) return null;
		const content = await fs.readFile(filePath, 'utf-8');
		return content;
	} catch (err) {
		console.error("Error loading file", filePath, "- File failed to load because", err);
		return null;
	}
});

ipcMain.handle('save-file', async (_event, filePath: string, data: string): Promise<boolean> => {
	try {
		if (filePath == null || data == null) return false;
		await fs.writeFile(filePath, data, 'utf-8');
		return true;
	} catch (err) {
		console.error("Error saving file", filePath, "- File failed to save because", err);
		return false;
	}
});

ipcMain.handle('open-external-link', async (_event, url: string) => {
	if (!url.startsWith('#')) {
		await shell.openExternal(url);
	}
});

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
