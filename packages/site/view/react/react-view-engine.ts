import { Context, FileBuildResult, Logger } from '@gaman/common';
import { Response } from '@gaman/core';
import { ViewEngineInstance } from '../index.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { pluginReactMount } from './react-mount-plugin.js';
import esbuild from 'esbuild';
import fs from 'fs/promises';

export class ReactEngine implements ViewEngineInstance {
	async middleware(
		_: Context,
		next: () => Response | Promise<Response>,
	): Promise<Response> {
		const res = await next();

		const view = res.view;
		if (!view) return res;

		const data = view.getData();

		let html = '';
		try {
			const htmlPath = path.resolve('src/ui/index.gn');
			html = await readFile(htmlPath, 'utf-8');
		} catch {
			Logger.error('src/ui/index.gn not found!');
			return res;
		}
		const jsonData = JSON.stringify(data ?? {});
		const safeJson = jsonData
			.replace(/</g, '\\u003C')
			.replace(/>/g, '\\u003E')
			.replace(/&/g, '\\u0026')
			.replace(/'/g, '\\u0027');

		const injectScript = `
<script id="__GAMAN_DATA__" type="application/json">
${safeJson}
</script>
<script type="module" src="/_gaman/ui/views/${view.getName()}.js"></script>
`;

		html = html.replace('</body>', `${injectScript}\n</body>`);

		html = html.replace(/@ui\(['"`](.*?)['"`]\)/g, (_, p1) => {
			return `/_gaman/ui/${p1}`;
		});

		html = html.replace(
			/@data\s*\(\s*["'`](.*?)["'`]\s*(?:,\s*["'`](.*?)["'`]\s*)?\)/g,
			(_, key, def) => data[key] ?? def ?? '',
		);

		return Res.html(html);
	}

	async builder({ config, filePath, mode }: FileBuildResult) {
		const ext = path.extname(filePath);
		if (!['.tsx', '.jsx'].includes(ext)) {
			return;
		}
		try {
			const viewsDir = 'src/ui/views';
			const outViewsDir = path.join(
				config.build?.outdir || 'dist',
				'client/_gaman/ui/views',
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
				plugins: [pluginReactMount()],
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
		} catch (err) {
			Logger.error(`Build failed: ${filePath}`);
			if (config.verbose) console.error(err);
		}
	}
}
