import { Integration, Logger } from '@gaman/common';
import fs from 'fs/promises';
import path from 'path';
import esbuild from 'esbuild';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export const tailwindcss = (options?: {
	/**
	 * @default 'dist/client/_gaman/ui/styles'
	 */
	outDir?: string;
}): Integration => ({
	name: 'gaman:tailwindcss',

	hooks: {
		'gaman:build:single:before': async ({ config, filePath, mode }) => {
			if (path.extname(filePath) !== '.css') return;

			const outDir =
				options?.outDir ||
				path.join(config.build?.outdir || 'dist', 'client/_gaman/ui/styles');

			await fs.mkdir(outDir, { recursive: true });

			const fileName = path.basename(filePath);
			const outFile = path.join(outDir, fileName);

			try {
				const css = await fs.readFile(filePath, 'utf8');

				const result = await postcss([tailwind, autoprefixer]).process(css, {
					from: filePath,
					to: outFile,
					map: mode === 'development' ? { inline: true } : false,
				});

				const tempFile = outFile + '.temp.css';
				await fs.writeFile(tempFile, result.css);

				// Build final CSS pakai esbuild
				await esbuild.build({
					entryPoints: [tempFile],
					outfile: outFile,
					bundle: false,
					minify: mode === 'production',
					sourcemap: mode === 'development',
					loader: { '.css': 'css' },
				});

				await fs.unlink(tempFile);
				if (config?.verbose)
					Logger.debug(`Built Tailwind CSS → ${outFile}`);
			} catch (error) {
				Logger.error('Tailwind build error', (error as Error).message);
			}
		},
	},
});
