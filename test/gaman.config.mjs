import { defineConfig } from '@gaman/core';
import { site, ReactEngine } from '@gaman/site';
import autoprefixer from 'autoprefixer';
import tailwindcss from '@tailwindcss/postcss';

export default defineConfig({
	verbose: true,
	build: {
		esbuildPlugins: [],
	},
	integrations: [
		site(ReactEngine, {
			postcss: [autoprefixer(), tailwindcss()],
		}),
	],
});
