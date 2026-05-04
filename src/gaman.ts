import './global';

import {
	isExceptionHandler,
	isMiddlewareHandler,
	isComposeRouter,
	isRoutes,
	isResponseView,
} from './utils/is';
import { createContext } from './context';
import { Logger } from './utils/logger';
import { Michi } from '@gaman/michi';
import type {
	Context,
	GamanServerConfig,
	HttpServerConfig,
	RequestHandler,
	RouteMetadata,
	Routes,
	NextFunction,
	ResponseData,
	SecurityOptions,
} from './types';
import type {
	ExceptionHandler,
	MiddlewareHandler,
	Router,
} from './compose/index';
import { TextFormat } from './utils/textformat';

export class Gaman {
	private michi = new Michi<RouteMetadata>();
	private globalMiddlewares: MiddlewareHandler[] = [];
	private globalExceptionHandler: ExceptionHandler | null = null;
	private securityOptions: SecurityOptions = {};

	/**
	 * @ID
	 * Menangani class Response sebelum dikirim ke client
	 * GamanJS akan memakai class Responder sendiri untuk membuat response itu menjadi sederhada, seperti: Res.json Res.text dll
	 *
	 * @param result
	 * @param ctx
	 * @returns
	 */
	private async handleResponse(
		result: ResponseData,
		ctx: Context,
	): Promise<Response> {
		let finalResponse: Response;
		if (typeof result === 'undefined' || result === null) {
			finalResponse = new Response(null, { status: 204 });
		} else if (result instanceof Response) {
			finalResponse = result;
		} else if (isResponseView(result)) {
			/**
			 * ! jika ada view engine ini tidak akan di proses!
			 */
			Logger.warn(
				`${TextFormat.RED}View response detected, but no View Engine is registered. ` +
					`Please install and configure a view engine like @gaman/ejs, @gaman/nunjucks, @gaman/edge, or @gaman/vite to handle ".render()".`,
			);

			finalResponse = new Response(undefined, {
				status: 404,
			});
		} else if (
			(typeof result === 'object' || Array.isArray(result)) &&
			result !== null &&
			!Buffer.isBuffer(result) &&
			!(result instanceof Blob)
		) {
			finalResponse = Response.json(result, { status: 200 });
		} else if (typeof result === 'string') {
			const trimmed = result.trim();
			if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
				return new Response(new TextEncoder().encode(trimmed), {
					status: 200,
					headers: { 'Content-Type': 'text/html' },
				});
			} else {
				return new Response(new TextEncoder().encode(trimmed), {
					status: 200,
					headers: { 'Content-Type': 'text/plain' },
				});
			}
		} else if (Buffer.isBuffer(result) || result instanceof Blob) {
			finalResponse = new Response(result);
		} else {
			finalResponse = new Response(null, {
				status: 404,
			});
		}

		finalResponse.headers.set('X-Powered-By', 'GamanJS');

		const { securityOptions } = this;

		/**
		 * Default security headers will be applied to every responses.
		 * This can be overridden by user-defined headers.
		 */

		if (securityOptions.contentSecurityPolicy) {
			finalResponse.headers.set('Content-Security-Policy', securityOptions.contentSecurityPolicy);
		}
		if (securityOptions.xFrameOptions) {
			finalResponse.headers.set('X-Frame-Options', securityOptions.xFrameOptions);
		}
		if (securityOptions.hsts) {
			const directives = [`max-age=${securityOptions.hsts.maxAge}`];
			if (securityOptions.hsts.includeSubDomains) directives.push('includeSubDomains');
			if (securityOptions.hsts.preload) directives.push('preload');
			finalResponse.headers.set('Strict-Transport-Security', directives.join('; '));
		}
		if (securityOptions.noSniff) {
			finalResponse.headers.set('X-Content-Type-Options', 'nosniff');
		}
		if (securityOptions.referrerPolicy) {
			finalResponse.headers.set('Referrer-Policy', securityOptions.referrerPolicy);
		}
		if (securityOptions.xssFilter) {
			finalResponse.headers.set('X-XSS-Protection', '1; mode=block');
		}
		if (securityOptions.crossOriginOpenerPolicy) {
			finalResponse.headers.set('Cross-Origin-Opener-Policy', securityOptions.crossOriginOpenerPolicy);
		}
		if (securityOptions.crossOriginEmbedderPolicy) {
			finalResponse.headers.set('Cross-Origin-Embedder-Policy', securityOptions.crossOriginEmbedderPolicy);
		}
		if (securityOptions.crossOriginResourcePolicy) {
			finalResponse.headers.set('Cross-Origin-Resource-Policy', securityOptions.crossOriginResourcePolicy);
		}
		if (securityOptions.cacheControl) {
			finalResponse.headers.set('Cache-Control', securityOptions.cacheControl);
		}
		if (securityOptions.xPermittedCrossDomainPolicies) {
			finalResponse.headers.set('X-Permitted-Cross-Domain-Policies', securityOptions.xPermittedCrossDomainPolicies);
		}
		if (securityOptions.xDownloadOptions) {
			finalResponse.headers.set('X-Download-Options', securityOptions.xDownloadOptions);
		}

		if (ctx && typeof ctx.headers.getSetHeaders === 'function') {
			for (const [key, value] of ctx.headers.getSetHeaders()) {
				if (value) {
					finalResponse.headers.set(
						key,
						Array.isArray(value) ? value.join(', ') : value,
					);
				}
			}
		}
		const cookieHeaders = ctx.cookies.toSetCookieHeaders();
		for (const cookieStr of cookieHeaders) {
			finalResponse.headers.append('Set-Cookie', cookieStr);
		}

		return finalResponse;

		// try {

		// 	finalResponse.headers.set('X-Powered-By', 'GamanJS');

		// 	// Logger.setStatus(finalResponse.status);
		// } catch (err: any) {
		// 	const handler =
		// 		exceptionHandler || this.globalExceptionHandler;

		// 	if (handler) {
		// 		try {
		// 			const exceptionRes = await handler(err, ctx);
		// 			finalResponse = await this.handleResponse(exceptionRes, ctx);
		// 			return finalResponse;
		// 		} catch (fatal) {
		// 			finalResponse = new Response('Fatal Server Error', { status: 500 });
		// 			return finalResponse;
		// 		}
		// 	}

		// 	console.error(err);
		// 	finalResponse = await this.handleResponse(
		// 		new Response('Internal Server Error', { status: 500 }),
		// 		ctx,
		// 	);
		// } finally {
		// 	// if (Logger.shouldLog('info')) {
		// 	// 	if (!IGNORED_LOG_FOR_PATH_REGEX.test(ctx?.path || '/') && startTime) {
		// 	// 		const endTime = performance.now();
		// 	// 		const statusColor = Logger.getStatusColor(finalResponse ? finalResponse.status : 500);
		// 	// 		const statusText = Logger.getStatusText(finalResponse ? finalResponse.status : 500);
		// 	// 		const statusStr = finalResponse ? finalResponse.status : 500;
		// 	// 		Logger.info(
		// 	// 			`§8[§6${ctx?.request.id}§8] §8[§d${ctx?.request.method}§8] §f${ctx?.path || '/'} §8[${statusColor}${statusStr} ${statusText}§8] §rRequest processed in §a(${(endTime - startTime).toFixed(1)}ms)§r`,
		// 	// 		);
		// 	// 	}
		// 	// }
		// }
		// return finalResponse;
	}

	private async dispatch(ctx: Context, pipeline: any[]): Promise<ResponseData> {
		let idx = 0;
		let handlers: Array<MiddlewareHandler> | Array<RequestHandler> = pipeline;
		let hasFindedRouter = false;
		let routeExceptionHandler: ExceptionHandler | null = null;
		const next: NextFunction = async () => {
			try {
				let fn = handlers[idx++];

				/**
				 * ? jika next nya kosong dan `hasFindedRouter` juga false maka saatnya nyari route
				 * ? Karna sebelumnya kan jalanin `Global Hook Middlewares`
				 */
				if (!fn && !hasFindedRouter) {
					hasFindedRouter = true;
					const match = this.michi.find(ctx.request.method, ctx.path);
					if (!match) return new Response(undefined, { status: 404 });
					ctx.params = match.params;
					routeExceptionHandler = match.data.exceptionHandler;

					// ? change handlers to route pipeline
					handlers = match.data.pipeline;
					idx = 0;
					fn = handlers[idx++];
				}

				if (typeof fn !== 'function')
					return new Response(undefined, { status: 404 });
				return await fn(ctx, next);
			} catch (error) {
				if (routeExceptionHandler)
					return await routeExceptionHandler(error, ctx);
				throw error;
			}
		};
		return next();
	}

	/**
	 * Internal logic to start the Bun HTTP server
	 * Handles both shorthand (number) and full configuration objects.
	 */
	private listenHttp(http: number | HttpServerConfig) {
		const isNumber = typeof http === 'number';
		const port = isNumber ? http : http.port;
		const hostname = isNumber ? 'localhost' : http.host || 'localhost';
		const maxRequestBodySize = isNumber ? undefined : http.maxRequestBodySize;
		const development = isNumber ? undefined : http.development;
		const reusePort = isNumber ? undefined : http.reusePort;

		const fetch = async (req: Request) => {
			// const startTime = performance.now();

			/** mini parse pathname */
			const urlStr = req.url;
			const pathStart = urlStr.indexOf('/', 8);
			const pathEnd = urlStr.indexOf('?', pathStart);
			const pathname = urlStr.substring(
				pathStart,
				pathEnd === -1 ? undefined : pathEnd,
			);
			const ctx = createContext(req, pathname);

			try {
				const res = await this.dispatch(ctx, this.globalMiddlewares);
				return await this.handleResponse(res, ctx);
			} catch (error: any) {
				if (this.globalExceptionHandler) {
					const errorRes = await this.globalExceptionHandler(error, ctx);
					return await this.handleResponse(errorRes, ctx);
				}

				throw error;
			}
		};
		Bun.serve({
			port,
			hostname,
			maxRequestBodySize,
			development,
			reusePort,
			fetch,
		});
	}

	public async mount(
		s:
			| ExceptionHandler
			| MiddlewareHandler
			| Router
			| Routes
			| Promise<ExceptionHandler | MiddlewareHandler | Router | Routes>,
	) {
		if (s instanceof Promise) s = await s;
		if (isExceptionHandler(s)) this.globalExceptionHandler = s;
		if (isMiddlewareHandler(s)) {
			this.globalMiddlewares.push(s);
		}
		// * register ke michi
		let routes: Routes = [];
		if (isComposeRouter(s)) routes = s();
		if (isRoutes(s)) routes = s;
		for (const rot of routes) {
			for (const method of rot.methods) {
				if (rot.handler !== null) {
					this.michi.add(method, rot.path, {
						id: `${method}:${rot.path}`,
						exceptionHandler: rot.exceptionHandler,
						pipeline: rot.pipes,
					});
				}
			}
		}
	}

	public setSecurity(options: SecurityOptions) {
		this.securityOptions = options;
	}

	public mountServer(config?: GamanServerConfig, security?: SecurityOptions) {
		if (security) {
			this.setSecurity(security);
		}

		Logger.log(`${TextFormat.BOLD}${TextFormat.LIGHT_PURPLE}GamanJS Framework`);
		Logger.info(
			`${TextFormat.ITALIC}A Lean Framework for Enterprise Scalability.`,
		);
		Logger.log(`${TextFormat.GRAY} —————————————————————————————————————— `);

		if (typeof config?.http !== 'undefined') {
			const httpConfig: HttpServerConfig =
				typeof config.http === 'number'
					? { port: config.http }
					: (config.http as HttpServerConfig);

			const host = httpConfig.host || 'localhost';
			const port = httpConfig.port || 3431;

			Logger.info(
				`${TextFormat.LIGHT_BLUE}HTTP${TextFormat.RESET}  : Listening at ${TextFormat.LIGHT_GREEN}http://${host}:${port}`,
			);

			const defaultFetch = fetch;
			// @ts-ignore
			globalThis.fetch = (input, init) => {
				const baseUrl = 'http://localhost:' + port;

				if (typeof input === 'string' && !input.startsWith('http')) {
					const formattedPath = input.startsWith('/') ? input : `/${input}`;
					input = `${baseUrl}${formattedPath}`;
				}
				return defaultFetch(input, init);
			};

			this.listenHttp(config.http);
		}
		// this.listenIPC();

		Logger.log(`${TextFormat.GRAY} —————————————————————————————————————— `);
		Logger.log(`Orchestration complete. Ready for requests.`);
	}
}
