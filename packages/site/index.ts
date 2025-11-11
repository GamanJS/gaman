import { Integration, Priority } from '@gaman/common';
import { ViewEngineClassConstructor } from './view/index.js';
import { composeMiddleware } from '@gaman/core';
import { buildStyles } from './css/css-builder.js';
import { AcceptedPlugin } from 'postcss';
import { buildScripts } from './script/scipt-builder.js';
export * from './view/index.js';
export * from './view/react/index.js';

export interface SiteConfig {
	postcss?: AcceptedPlugin[];
}

export const site = (
	ViewEngineClass: ViewEngineClassConstructor,
	config?: SiteConfig,
): Integration => {
	const viewEngine = new ViewEngineClass();

	return {
		name: 'gaman:site',
		hooks: {
			'gaman:server:bootstrap': async (app) => {
				// ? register middleware
				if (viewEngine.middleware) {
					app.mount(
						composeMiddleware(async (ctx, next) => {
							if (viewEngine.middleware) {
								return await viewEngine.middleware(ctx, next);
							}
							return await next();
						})({
							priority: Priority.MONITOR,
						}),
					);
				}
			},
			'gaman:build:single:before': async (result) => {
				if (viewEngine.builder) {
					await viewEngine.builder(result);
				}
				if (result.filePath.includes('src/ui')) {
					await buildStyles(result, config);
					await buildScripts(result, config);
				}
			},
		},
	};
};
