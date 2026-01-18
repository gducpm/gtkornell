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
import { Tooltip, Modal } from 'bootstrap';
import MarkdownIt from "markdown-it";
import { full as emojiFull } from "markdown-it-emoji";
import { buffer } from 'node:stream/consumers';


document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
	new Tooltip(el);
});

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
		newWindow("cornell-tutorial.html");
	});
});
document.querySelectorAll<HTMLElement>('.legal-info-btn').forEach(btn => {
	btn.addEventListener('click', (event) => {
		event.preventDefault();
		newWindow("legal-info.html");
	});
});


// --- Editor source textarea autoresize ---

// Select all auto-resizing textareas
const textareas: NodeListOf<HTMLTextAreaElement> = document.querySelectorAll('.kornell-source');

/**
 * Adjusts the height of a textarea to fit its content
 * @param textarea HTMLTextAreaElement
 */
function autoResize(textarea: HTMLTextAreaElement): void {
	textarea.style.height = 'auto'; // reset height
	textarea.style.height = `${textarea.scrollHeight}px`; // set to content height
}


// --- Kornell Editor buffer reporting ---

interface KornellMetadata {
	hideSource: boolean;
	hideNotes: boolean;
	kornellFormatVersion: number;
}

interface KornellBuffers {
	metadata: KornellMetadata;
	title: string;
	cues: string;
	notes: string;
	summary: string;
}

let buffers: KornellBuffers = {
	metadata: {
		hideSource: false,
		hideNotes: false,
		kornellFormatVersion: 1.0,
	},
	title: "",
	cues: "",
	notes: "",
	summary: "",
};

// Not included in metadata to ensure flexibility of the file
let kornellPath: string | null = null; // New Kornell
updatePathBreadcrumb();

function reportBuf(kornellSource: string, text: string): void {
	switch (kornellSource) {
		case "title":
			buffers.title = text;
			break;
		case "cues":
			buffers.cues = text;
			break;
		case "notes":
			buffers.notes = text;
			break;
		case "summary":
			buffers.summary = text;
			break;
		default:
			console.error("Unknown Kornell source: ", kornellSource);
	}
}

function updateBuf(): void {
	document.querySelector<HTMLTextAreaElement>('[data-kornell-source="title"]').value = buffers.title;
	document.querySelector<HTMLTextAreaElement>('[data-kornell-source="cues"]').value = buffers.cues;
	document.querySelector<HTMLTextAreaElement>('[data-kornell-source="notes"]').value = buffers.notes;
	document.querySelector<HTMLTextAreaElement>('[data-kornell-source="summary"]').value = buffers.summary;
}

// Attach input event listeners to all matching textareas
textareas.forEach((ta) => {
	ta.addEventListener('input', () => {
		autoResize(ta);
		reportBuf(ta.dataset.kornellSource, ta.value);
	});
	
	// If textarea has prefilled content
	autoResize(ta);
	reportBuf(ta.dataset.kornellSource, ta.value);
});

async function saveFile(): Promise<boolean> {
	if (!kornellPath) {
		kornellPath = await window.fileAPI.saveFileDialog();
	}
	if (kornellPath) {
		const success = await window.fileAPI.save(kornellPath, JSON.stringify(buffers, null, "\t"));
		if (success) {
			return true;
		}
	}
	return false;
}
async function saveFileAs(): Promise<boolean> {
	const newPath = await window.fileAPI.saveFileDialog();
	if (newPath) {
		const success = await window.fileAPI.save(newPath, JSON.stringify(buffers, null, "\t"));
		if (success) {
			kornellPath = newPath;
			updatePathBreadcrumb();
			return true;
		}
	}
	return false;
}

async function openFile(): Promise<boolean> {
	kornellPath = await window.fileAPI.openFileDialog();
	if (kornellPath) {
		updatePathBreadcrumb();
		const kornellJson = await window.fileAPI.open(kornellPath);
		buffers = JSON.parse(kornellJson);
		updateBuf();
		return true;
	}
	return false;
}
document.querySelectorAll<HTMLElement>('.savebtn').forEach(btn => {
	btn.addEventListener('click', (event) => {
		saveFile();
	});
});
document.querySelectorAll<HTMLElement>('.openbtn').forEach(btn => {
	btn.addEventListener('click', (event) => {
		openFile();
	});
});

function updatePathBreadcrumb(): void {
	document.querySelectorAll<HTMLElement>('.kornell-path-breadcrumb').forEach(bread => {
		if (kornellPath == null) {
			bread.innerHTML = `<li class="breadcrumb-item">New Kornell</li>`;
			return;
		}
		// Make sure path can be readable on Windows and separate by each "/"
		const path_segments: string[] = kornellPath.replace(/\\/g, "/").split("/").filter(Boolean); 
		// Escape unsafe HTML to avoid any form of XSS
		const items = path_segments.map((seg) => `<li class="breadcrumb-item">${escapeHTML(seg)}</li>`).join("\n");
		bread.innerHTML = items;
	});
}

function escapeHTML(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Add a global keydown listener
window.addEventListener('keydown', (event: KeyboardEvent) => {
    const { key, ctrlKey, shiftKey, metaKey } = event;

    // Detect Cmd on macOS, Ctrl on Windows/Linux
    const isCmdOrCtrl = ctrlKey || metaKey;

    // Ctrl+S / Cmd+S -> Save
    if (isCmdOrCtrl && !shiftKey && key.toLowerCase() === 's') {
		// My chromium does NOT save page on Ctrl+S, but just in case, disable the behavior and handle our own saving
        event.preventDefault(); // prevent browser "save page" default
        saveFile();
    }

    // Ctrl+Shift+S / Cmd+Shift+S -> Save As
    if (isCmdOrCtrl && shiftKey && key.toLowerCase() === 's') {
        event.preventDefault();
        saveFileAs();
    }

	// Zoom keys are handled by the Chromium engine
});

const mrend = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	breaks: true,
});
mrend.use(emojiFull);
document.querySelectorAll<HTMLElement>('.hide-sources-btn').forEach(btn => {
	btn.addEventListener('click', () => {
		buffers.metadata.hideSource = !buffers.metadata.hideSource;
		if (buffers.metadata.hideSource) {
			document.querySelectorAll<HTMLElement>('.kornell-source').forEach(ta => {
				ta.style.display = "none";
			});
			document.querySelector<HTMLElement>('[data-kornell-render="title"]').style.display = "block";
			document.querySelector<HTMLElement>('[data-kornell-render="cues"]').style.display = "block";
			if (!buffers.metadata.hideNotes) document.querySelector<HTMLElement>('[data-kornell-render="notes"]').style.display = "block";
			document.querySelector<HTMLElement>('[data-kornell-render="summary"]').style.display = "block";
			document.querySelector<HTMLElement>('[data-kornell-render="title"]').innerHTML = 
				mrend.render(buffers.title);
			document.querySelector<HTMLElement>('[data-kornell-render="cues"]').innerHTML = 
				mrend.render(buffers.cues);
			if (!buffers.metadata.hideNotes) document.querySelector<HTMLElement>('[data-kornell-render="notes"]').innerHTML = 
				mrend.render(buffers.notes);
			document.querySelector<HTMLElement>('[data-kornell-render="summary"]').innerHTML = 
				mrend.render(buffers.summary);
		} else {
			document.querySelectorAll<HTMLElement>('.kornell-source').forEach(ta => {
				if (ta.dataset.kornellSource != "notes" || !buffers.metadata.hideNotes) {
					ta.style.display = "block";
				}
			});
			document.querySelector<HTMLElement>('[data-kornell-render="title"]').style.display = "none";
			document.querySelector<HTMLElement>('[data-kornell-render="cues"]').style.display = "none";
			document.querySelector<HTMLElement>('[data-kornell-render="notes"]').style.display = "none";
			document.querySelector<HTMLElement>('[data-kornell-render="summary"]').style.display = "none";
			document.querySelector<HTMLElement>('[data-kornell-render="title"]').innerHTML = ""
			document.querySelector<HTMLElement>('[data-kornell-render="cues"]').innerHTML = ""
			document.querySelector<HTMLElement>('[data-kornell-render="notes"]').innerHTML = ""
			document.querySelector<HTMLElement>('[data-kornell-render="summary"]').innerHTML = ""
		}
	});
});

document.querySelectorAll<HTMLElement>('.hide-notes-btn').forEach(btn => {
	btn.addEventListener("click", () => {
		buffers.metadata.hideNotes = !buffers.metadata.hideNotes;
		if (buffers.metadata.hideNotes) {
				document.querySelector<HTMLElement>('[data-kornell-render="notes"]').style.display = "none";
				document.querySelector<HTMLElement>('[data-kornell-source="notes"]').style.display = "none";
		} else {
			if (buffers.metadata.hideSource) {
				document.querySelector<HTMLElement>('[data-kornell-render="notes"]').style.display = "block";
				document.querySelector<HTMLElement>('[data-kornell-render="notes"]').innerHTML = 
					mrend.render(buffers.notes);
			} else {
				document.querySelector<HTMLElement>('[data-kornell-source="notes"]').style.display = "block";
			}
		}
	});
});

document.querySelectorAll<HTMLElement>('.kornell-render').forEach((div) => {
	div.addEventListener("click", (event) => {
		const target = event.target as HTMLElement;
		const hyperlink = target.closest("a");
		if (!hyperlink) return;

		const href = hyperlink.getAttribute("href");
		if (!href) return;

		if (href.startsWith('#')) return;
		
		event.preventDefault();

		const openExternalModalEl: HTMLElement = createModal(
			escapeHTML(href), 
			
			`<p><strong>You are going to open this hyperlink externally.</strong><br>` +
			`Generally, externally opened links are not dangerous, but links starting with ` +
			`<code>file://</code>, <code>javascript://</code> or <code>data://</code> might ` +
			`want to run malicious code on your machine.<br>` +
			`You have been warned.</p>`, 
			
			`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
			<button type="button" class="btn btn-danger open-external-btn">Open</button>`,
			
			`lg`, true, true, true, true)
		const openExternalModal: Modal = new Modal(openExternalModalEl);
		openExternalModal.show();
		openExternalModalEl.addEventListener('hidden.bs.modal', () => {
			openExternalModal.dispose();
			openExternalModalEl.remove();
		});
		openExternalModalEl.querySelector<HTMLElement>(".open-external-btn").addEventListener("click", (event) => {
			window.openExternalAPI.openExternal(href);
			openExternalModal.hide();
		});
	})
});

type ModalSize = `sm`|`lg`|`xl`|`fullscreen-sm-down`|`fullscreen-md-down`|`fullscreen-lg-down`|`fullscreen-xl-down`|`fullscreen-xxl-down`;

function createModal(title: string, body: string, footer: string, modalSize: ModalSize | null = null, fade: boolean = true, verticallyCentered: boolean = false, staticBackdrop: boolean = true, scrollable: boolean = false): HTMLElement {
	const modalSizeString = (modalSize) ? ` modal-${modalSize}`: ``; // null means default size
	const fadeString = (fade) ? ` fade` : ``;
	const verticallyCenteredString = (verticallyCentered) ? ` modal-dialog-centered` : ``;
	const staticBackdropString: string = (staticBackdrop) ? `data-bs-backdrop="static"` : ``;
	const scrollableString: string = (scrollable) ? ` modal-dialog-scrollable` : ``;
	const modalHTML: string = `
	<div class="modal${fadeString}" ${staticBackdropString}>
		<div class="modal-dialog${scrollableString}${modalSizeString}${verticallyCenteredString}">
			<div class="modal-content">
				<div class="modal-header">
					<h1 class="modal-title fs-5">${title}</h1>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body">
					${body}
				</div>
				<div class="modal-footer">
					<!--Example footer: 
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
					<button type="button" class="btn btn-primary">Save changes</button>
					-->
					${footer}
				</div>
			</div>
		</div>
	</div>`;
	return htmlToElement(modalHTML);
}

function htmlToElement(html: string): HTMLElement {
	const template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstElementChild as HTMLElement;
}

document.querySelectorAll<HTMLElement>(".p-os").forEach(p => {
	p.querySelector<HTMLElement>(".span-os").innerText = window.OSAPI.platform == "linux" ? "GNU/Linux" : window.OSAPI.platform == "win32" ? "Microsoft Windows" : window.OSAPI.platform == "darwin" ? "MacOS" : "an undetected or unknown operating system";
	p.querySelector<HTMLElement>(".ic-os").classList.add(window.OSAPI.platform == "linux" ? "bi-tux" : window.OSAPI.platform == "win32" ? "bi-windows" : window.OSAPI.platform == "darwin" ? "bi-apple" : "bi-question-circle-fill");
});