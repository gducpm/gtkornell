import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				editor: resolve(__dirname, 'editor.html'),
				cornell_tutorial: resolve(__dirname, 'cornell-tutorial.html'),
				legal_info: resolve(__dirname, 'legal-info.html'),
			},
		},
	},
});
