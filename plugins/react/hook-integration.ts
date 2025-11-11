import path from 'path';
import fs from 'fs/promises';
import esbuild from 'esbuild';
import { IntegrationEvents, Logger } from '@gaman/common';
import { pluginReactMount } from './react-mount-plugin.js';

/**
 * Builder utama untuk semua React views
 */
export const hookIntegration: IntegrationEvents['gaman:build:single:before'] =
	async ({ filePath, config, mode }) => {
		const ext = path.extname(filePath);
		if (!['.tsx', '.jsx'].includes(ext)) {
			return;
		}

		const viewsDir = config.build?.viewsdir || 'src/views';
		const outViewsDir = path.join(
			config.build?.outdir || 'dist',
			'client/_gaman/views',
		);

		await fs.mkdir(outViewsDir, { recursive: true });

		const relPath = path.relative(viewsDir, filePath).replace(/\\/g, '/');
		const outFile = path
			.join(outViewsDir, relPath)
			.replace(/\.(tsx|jsx)$/, '.js');
		await fs.mkdir(path.dirname(outFile), { recursive: true });

		await esbuild.build({
			entryPoints: [filePath],
			bundle: true,
			platform: 'browser',
			target: 'esnext',
			format: 'esm',
			packages: 'bundle',
			sourcemap: mode === 'development',
			minify: mode === 'production',
			jsx: 'automatic',
			outfile: outFile,
			define: {
				'process.env.NODE_ENV': `"${mode}"`,
			},
			plugins: [pluginReactMount(), ...(config?.build?.esbuildPlugins ?? [])],
			banner: {
				js: `
/*!
 * GamanJS View Build
 * ──────────────────────────────────────────────
 * File: ${path.basename(filePath)}
 * Built: ${new Date().toISOString()}
 * Mode: ${mode}
 * Framework: GamanJS
 * https://github.com/GamanJS/gaman
 */
`,
			},
		});
		if (config.verbose) Logger.debug(`Built view → ${outFile}`);
	};
