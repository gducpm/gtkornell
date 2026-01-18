interface Window {
	zoomAPI: {
		zoomIn: () => void;
		zoomOut: () => void;
		resetZoom: () => void;
	};
	navigationAPI: {
	newWindow: (filename: string) => void;
	};
	fileAPI: {
		open: (filePath: string) => Promise<string | null>;
		save: (filePath: string, data: string) => Promise<boolean>;
		openFileDialog: () => Promise<string | null>;
		saveFileDialog: (defaultFileName: string = 'file.kornell') => Promise<string | null>;
	};
	openExternalAPI: {
		openExternal: (url: string) => Promise<void>;
	};
	OSAPI: {
		platform: string;
	};
}