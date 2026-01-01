// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, webFrame } from 'electron';

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
