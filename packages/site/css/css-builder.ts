import { FileBuildResult, Logger } from '@gaman/common';
import path from 'path';
import fs from 'fs/promises';
import esbuild from 'esbuild';
import postcss from 'postcss';
import { SiteConfig } from '../index.js';

export const buildStyles = async (
	{ config, filePath, mode }: FileBuildResult,
	ops?: SiteConfig,
) => {
	try {
		const ext = path.extname(filePath);
		if (!['.css', '.scss', '.sass'].includes(ext)) return;

		const stylesDir = 'src/ui';
		const outStylesDir = path.join(
			config.build?.outdir || 'dist',
			'client/_gaman/ui',
		);

		await fs.mkdir(outStylesDir, { recursive: true });

		const relPath = path.relative(stylesDir, filePath).replace(/\\/g, '/');
		const outFile = path
			.join(outStylesDir, relPath)
			.replace(/\.(scss|sass)$/, '.css');

		await fs.mkdir(path.dirname(outFile), { recursive: true });

		const plugins: esbuild.Plugin[] = [];

		/**
		 * @ID
		 * Jika ada sass maka bisa pake sass langsung aja buat file di folde src/ui/styles/home.scss
		 * maka akan di bundle otomtasi ke dist/client/_gaman/styles/home.css
		 */
		try {
			const sass = await import('sass');
			plugins.push({
				name: 'sass-loader',
				setup(build) {
					build.onLoad({ filter: /\.(scss|sass)$/ }, async (args) => {
						const result = sass.compile(args.path);
						return { contents: result.css, loader: 'css' };
					});
				},
			});
			if (config.verbose) Logger.debug('Using Sass compiler');
		} catch {
			if (config.verbose) Logger.debug('Sass not found, skipping Sass support');
		}

		/**
		 * @ID
		 * postcss akan jadi bundler default untuk styles
		 */
		try {
			plugins.push({
				name: 'postcss-loader',
				setup(build) {
					build.onLoad({ filter: /\.css$/ }, async (args) => {
						const css = await fs.readFile(args.path, 'utf8');
						const result = await postcss(ops?.postcss?.filter(Boolean)).process(
							css,
							{ from: args.path },
						);
						return { contents: result.css, loader: 'css' };
					});
				},
			});
			if (config.verbose) Logger.debug('Using PostCSS pipeline');
		} catch {
			if (config.verbose) Logger.debug('PostCSS not found, skipping');
		}

		await esbuild.build({
			entryPoints: [filePath],
			outfile: outFile,
			bundle: true,
			minify: mode === 'production',
			sourcemap: mode === 'development',
			loader: { '.css': 'css', '.scss': 'css', '.sass': 'css' },
			plugins,
		});

		if (config.verbose) Logger.debug(`Built style → ${outFile}`);
	} catch (err) {
		Logger.error(`Build failed: ${filePath}`);
		if (config.verbose) console.error(err);
	}
};
