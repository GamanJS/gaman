import { defineConfig } from '@gaman/core';
import { react } from '@gaman/react';
import { tailwindcss } from '@gaman/tailwindcss';

export default defineConfig({
	verbose: true,
	build: {
		esbuildPlugins: [tailwindcss()],
	},
	integrations: [react()],
});
