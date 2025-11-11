import { FileBuildResult, Logger } from '@gaman/common';
import path from 'path';
import fs from 'fs/promises';
import esbuild from 'esbuild';
import { SiteConfig } from '../index.js';

export const buildScripts = async (
	{ config, filePath, mode }: FileBuildResult,
	_ops?: SiteConfig,
) => {
	try {
		const ext = path.extname(filePath);
		if (!['.js', '.ts'].includes(ext)) return;

		const scriptsDir = 'src/ui';
		const outScriptsDir = path.join(
			config.build?.outdir || 'dist',
			'client/_gaman/ui',
		);

		await fs.mkdir(outScriptsDir, { recursive: true });

		const relPath = path.relative(scriptsDir, filePath).replace(/\\/g, '/');
		const outFile = path
			.join(outScriptsDir, relPath)
			.replace(/\.(ts)$/, '.js');

		await fs.mkdir(path.dirname(outFile), { recursive: true });

		await esbuild.build({
			entryPoints: [filePath],
			outfile: outFile,
			bundle: true,
			minify: mode === 'production',
			sourcemap: mode === 'development',
			target: ['esnext'],
			format: 'esm',
			platform: 'browser',
			loader: { '.ts': 'ts', '.js': 'js' },
		});

		if (config.verbose) Logger.debug(`Built client script → ${outFile}`);
	} catch (err) {
		Logger.error(`Build failed: ${filePath}`);
		if (config.verbose) console.error(err);
	}
};
