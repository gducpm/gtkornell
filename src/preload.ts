// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, webFrame } from 'electron';

console.log('[Preload] Preload script starting...');

contextBridge.exposeInMainWorld('zoomAPI', {
	zoomIn: (): void => {
	const current = webFrame.getZoomFactor();
	webFrame.setZoomFactor(current + 0.1);
	},
	zoomOut: (): void => {
	const current = webFrame.getZoomFactor();
	webFrame.setZoomFactor(Math.max(0.1, current - 0.1));
	},
	resetZoom: (): void => {
	webFrame.setZoomFactor(1);
	}
});

contextBridge.exposeInMainWorld('navigationAPI', {
	newWindow: (filename: string) => ipcRenderer.send('new-window', filename)
});

contextBridge.exposeInMainWorld('fileAPI', {
	open: (filePath: string): Promise<string | null> => ipcRenderer.invoke('open-file', filePath) as Promise<string | null>,
	save: (filePath: string, data: string): Promise<boolean> => ipcRenderer.invoke('save-file', filePath, data) as Promise<boolean>,
	openFileDialog: (): Promise<string | null> => ipcRenderer.invoke('open-file-dialog') as Promise<string | null>,
	saveFileDialog: (defaultFileName: string = 'file.kornell'): Promise<string | null> => ipcRenderer.invoke('save-file-dialog', defaultFileName) as Promise<string | null>,
});

contextBridge.exposeInMainWorld("openExternalAPI", {
	openExternal: (url: string): Promise<void> => ipcRenderer.invoke('open-external-link', url),
});

contextBridge.exposeInMainWorld("OSAPI", {
	platform: process.platform
});

console.log('[Preload] Preload script finished.');