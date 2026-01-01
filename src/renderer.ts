/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import 'bootstrap';
import './index.css';
// Detect system color scheme
function updateTheme(): void {
	const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
}
updateTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

function zoomMode(mode: 1 | 2 | 3): void {
	switch (mode) {
		case 1:
			window.zoomAPI.zoomIn();
			break;
		case 2:
			window.zoomAPI.zoomOut();
			break;
		case 3:
			window.zoomAPI.resetZoom();
			break;
	}
}

function newWindow(filename: string): void {
	window.navigationAPI.newWindow(filename);
}

document.querySelectorAll<HTMLElement>('.zoom-in').forEach(btn => {
	btn.addEventListener('click', () => {
		zoomMode(1);
	});
});

document.querySelectorAll<HTMLElement>('.zoom-out').forEach(btn => {
	btn.addEventListener('click', () => {
		zoomMode(2);
	});
});

document.querySelectorAll<HTMLElement>('.reset-zoom').forEach(btn => {
	btn.addEventListener('click', () => {
		zoomMode(3);
	});
});

document.querySelectorAll<HTMLElement>('.how-to-cornell-btn').forEach(btn => {
	btn.addEventListener('click', (event) => {
		event.preventDefault();
		console.log("Click registered!");
		newWindow("cornell-tutorial.html");
	});
});