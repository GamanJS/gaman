import { describe, expect, it } from 'bun:test';
import { Gaman } from './gaman';
import { composeMiddleware, composeRouter, composeException } from './compose';

describe('Gaman App Instance', () => {
	it('should successfully mount a global middleware', () => {
		const app = new Gaman();
		const middleware = composeMiddleware((ctx, next) => next());
		
		app.mount(middleware);
		
		// @ts-ignore: testing internal state
		expect(app.globalMiddlewares.length).toBe(1);
		// @ts-ignore
		expect(app.globalMiddlewares[0]).toBe(middleware);
	});

	it('should successfully mount a global exception handler', () => {
		const app = new Gaman();
		const exceptionData = composeException((err, ctx) => new Response('Error'));
		
		app.mount(exceptionData);
		
		// @ts-ignore: testing internal state
		expect(app.globalExceptionHandler).toBe(exceptionData);
	});

	it('should successfully mount routes to michi router', () => {
		const app = new Gaman();
		const routes = composeRouter((r) => {
			r.get('/test', () => 'hello');
		});

		app.mount(routes);

		// @ts-ignore: michi internal find
		const match = app.michi.find('GET', '/test');
		expect(match).not.toBeNull();
		expect(match?.data.id).toBe('GET:/test');
	});

	it('should gracefully handle multiple mounts', () => {
		const app = new Gaman();
		const middleware = composeMiddleware((ctx, next) => next());
		const routes = composeRouter((r) => r.post('/submit', () => 'ok'));

		app.mount(middleware);
		app.mount(routes);

		// @ts-ignore
		expect(app.globalMiddlewares.length).toBe(1);
		// @ts-ignore
		expect(app.michi.find('POST', '/submit')).not.toBeNull();
	});
});

describe('Gaman default security headers', () => {
	it('should store security options', () => {
		const app = new Gaman();
		
		app.setSecurity({
			xFrameOptions: 'DENY',
			noSniff: true,
		});

		// @ts-ignore: testing internal state
		expect(app.securityOptions.xFrameOptions).toBe('DENY');
		// @ts-ignore
		expect(app.securityOptions.noSniff).toBe(true);
	});

	it('should store full security options', () => {
		const app = new Gaman();
		app.setSecurity({
			contentSecurityPolicy: "default-src 'self'",
			xFrameOptions: 'SAMEORIGIN',
			hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
			noSniff: true,
			referrerPolicy: 'strict-origin-when-cross-origin',
			xssFilter: true,
			crossOriginOpenerPolicy: 'same-origin',
			crossOriginEmbedderPolicy: 'require-corp',
			crossOriginResourcePolicy: 'same-origin',
			cacheControl: 'no-store, private',
			xPermittedCrossDomainPolicies: 'none',
			xDownloadOptions: 'noopen',
		});

		// @ts-ignore
		const opts = app.securityOptions;
		expect(opts.contentSecurityPolicy).toBe("default-src 'self'");
		expect(opts.xFrameOptions).toBe('SAMEORIGIN');
		expect(opts.hsts?.maxAge).toBe(31536000);
		expect(opts.hsts?.includeSubDomains).toBe(true);
		expect(opts.hsts?.preload).toBe(true);
		expect(opts.noSniff).toBe(true);
		expect(opts.referrerPolicy).toBe('strict-origin-when-cross-origin');
		expect(opts.xssFilter).toBe(true);
		expect(opts.crossOriginOpenerPolicy).toBe('same-origin');
		expect(opts.crossOriginEmbedderPolicy).toBe('require-corp');
		expect(opts.crossOriginResourcePolicy).toBe('same-origin');
		expect(opts.cacheControl).toBe('no-store, private');
		expect(opts.xPermittedCrossDomainPolicies).toBe('none');
		expect(opts.xDownloadOptions).toBe('noopen');
	});

	it('should replace security options when called multiple times', () => {
		const app = new Gaman();
		app.setSecurity({ xFrameOptions: 'DENY' });
		app.setSecurity({ noSniff: true, xssFilter: true });

		// @ts-ignore
		expect(app.securityOptions.xFrameOptions).toBeUndefined();
		// @ts-ignore
		expect(app.securityOptions.noSniff).toBe(true);
		// @ts-ignore
		expect(app.securityOptions.xssFilter).toBe(true);
	});

	it('should apply security options from mountServer parameter', () => {
		const app = new Gaman();
		app.mountServer({ http: 3431 }, { xFrameOptions: 'DENY', noSniff: true });

		// @ts-ignore
		expect(app.securityOptions.xFrameOptions).toBe('DENY');
		// @ts-ignore
		expect(app.securityOptions.noSniff).toBe(true);
	});

	it('should handle mountServer without security parameter', () => {
		const app = new Gaman();
		app.mountServer({ http: 3431 });

		// @ts-ignore
		expect(app.securityOptions).toEqual({});
	});
});
