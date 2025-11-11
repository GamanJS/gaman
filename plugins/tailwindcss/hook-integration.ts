import { IntegrationEvents, Logger } from '@gaman/common';
import fs from 'fs/promises';
import path from 'path';
import esbuild from 'esbuild';

export const hookIntegration: (
	options,
) => IntegrationEvents['gaman:build:single:before'] =
	(options) =>
	async ({ config, filePath, mode }) => {
		const ext = path.extname(filePath);
		if (!['.tsx', '.jsx'].includes(ext)) {
			return;
		}
		const styleDir = options?.styleDir || './src/ui/styles';
		const outDir = path.join(
			config.build?.outdir || 'dist',
			'client/_gaman/ui/styles',
		);
		await fs.mkdir(outDir, { recursive: true });

		let entries: Record<string, string> = {};
		async function scan(dir: string) {
			const files = await fs.readdir(dir, { withFileTypes: true });
			for (const file of files) {
				const filePath = path.join(dir, file.name);
				if (file.isDirectory()) {
					await scan(filePath);
				} else if (file.name.endsWith('.css')) {
					const name = path.basename(file.name);
					const outFile = path.join(outDir, name);
					entries[filePath] = outFile;
				}
			}
		}
		await scan(styleDir);

		const entryPoints = Object.keys(entries);

		if (entryPoints.length === 0) {
			if (config?.verbose) Logger.debug('No CSS files found.');
			return;
		}

		for (const entry of entryPoints) {
			const outFile = entries[entry];
			await esbuild.build({
				entryPoints: [entry],
				outfile: outFile,
				bundle: true,
				minify: mode === 'production',
				sourcemap: mode === 'development',
				loader: { '.css': 'css' },
				plugins: config?.build?.esbuildPlugins,
			});

			if (config?.verbose) Logger.debug(`Built CSS → ${outFile}`);
		}
	};
