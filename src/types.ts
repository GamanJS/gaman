import { CookieMap } from 'bun';
import { GamanHeader } from './context/header';
import { GFile } from './context/formdata/file';
import type { ControllerFactory } from './compose/controller';
import type { MiddlewareHandler } from './compose/middleware';
import { FormData } from './context/formdata';
import type { ExceptionHandler, Router } from './compose';
import type { IResponseOptions } from './responder';

export type HTTPMethod =
	| (string & {})
	| 'GET'
	| 'DELETE'
	| 'HEAD'
	| 'OPTIONS'
	| 'PATCH'
	| 'POST'
	| 'PUT'
	| 'ALL';

/**
 * GamanJS Shortcut for ReturnType<typeof T>
 * Enterprise utility for cleaner dependency injection
 */
export type RT<T extends (...args: any) => any> = ReturnType<T>;

/**
 * App Transportation Mode
 * @example
 * ```ts
 * const gaman = Gaman<HTTP & IPC>();
 *
 * gaman.ipc(...)
 *
 * gaman.get(...)
 * gaman.post(...)
 */
export type GamanServerConfig = {
	/**
	 * HTTP server configuration.
	 * If a number is provided, it will be used as the port.
	 */
	http?: number | HttpServerConfig;
};

export type HttpServerConfig = {
	/**
	 * The port number the HTTP swerver will listen on.
	 * @default 3431
	 */
	port: number;

	/**
	 * The hostname or IP address to bind the server to.
	 * Use '0.0.0.0' to accept connections from any network interface.
	 * @default 'localhost'
	 */
	host?: string;

	/**
	 * The maximum size of the request body in bytes.
	 * Useful for preventing large payload attacks.
	 */
	maxRequestBodySize?: number;

	/**
	 * If true, the server will attempt to use the reusePort socket option.
	 * Useful for high-performance load balancing.
	 * @default false
	 */
	reusePort?: boolean;

	/**
	 * Enable development mode.
	 * When true, GamanJS will provide detailed error stacks and verbose logging.
	 * @default false
	 */
	development?: boolean;
};

/* -------------------------------------------------------------------------- */
/*                                   Handler                                  */
/* -------------------------------------------------------------------------- */
export type RequestHandler = (c: Context) => any | Promise<any>;

/* -------------------------------------------------------------------------- */
/*                                   Router                                   */
/* -------------------------------------------------------------------------- */

export type QueryValue = any | any[];
export type Query = ((name: string) => QueryValue) & Record<string, QueryValue>;

/**
 * Represents an HTTP request in the GamanJS framework.
 */
export interface Requester {
	/**
	 * Request Id fot debugging
	 */
	id: string;
	/**
	 * HTTP method (e.g., GET, POST, PUT, DELETE).
	 */
	method: HTTPMethod;

	/**
	 * Full request URL including query string and host (e.g., "http://localhost/home?search=test").
	 */
	url: string;

	/**
	 * Pathname portion of the URL (e.g., "/home/user"), excludes query string and host.
	 */
	pathname: string;

	/**
	 * Returns the raw request body as a Buffer.
	 *
	 * Useful for binary uploads or low-level processing.
	 */
	body: () => Promise<Buffer<ArrayBufferLike>>;
}

export type Context = {
	/**
	 * Pathname portion of the URL (e.g., "/home/user"), excludes query string and host.
	 */
	path: string;

	url: URL;
	cookies: CookieMap;
	request: Requester;
	set(k: string, v: any): void;
	get<T = any>(k: string): T;
	has(k: string): boolean;
	delete(k: string): void;
	/**
	 * An instance of GamanHeader for easier and normalized access to request headers.
	 */
	headers: GamanHeader;

	/**
	 * Get the value of a specific header (case-insensitive).
	 *
	 * @param key - The header name (e.g., "Content-Type")
	 *
	 * @returns The value of the specified header or null if not present.
	 */
	header: (key: string) => string | null;

	/**
	 * Get a single route parameter by name.
	 *
	 * For example, in route "/user/:id", `param("id")` would return the dynamic value.
	 *
	 * @param name - The name of the route parameter.
	 */
	param: (name: string) => any;

	/**
	 * All route parameters extracted from the dynamic route.
	 *
	 * For example, "/post/:postId/comment/:commentId" => { postId: "123", commentId: "456" }
	 */
	params: Record<string, any>;

	/**
	 * Query parameters parsed from the URL.
	 *
	 * For example, "/search?q=test&page=2" => { q: "test", page: "2" }
	 */
	query: Query;

	/**
	 * Reads the request body as plain text.
	 *
	 * Suitable for `Content-Type: text/plain`.
	 */
	text: () => Promise<string>;

	/**
	 * Parses the request body as FormData.
	 *
	 * Supports `multipart/form-data` and `application/x-www-form-urlencoded`.
	 */
	formData: () => Promise<FormData>;

	/**
	 * Gets a single string value from form data by name.
	 *
	 * Equivalent to `formData().get(name).asString()`.
	 * @param name - The form field name.
	 */
	input: <T>(name: string) => Promise<string | null>;

	/**
	 * Gets a many string values from form data by name.
	 *
	 * Equivalent to `formData().getAll(name).map(asString)`
	 * @param name - The form field name
	 */
	inputs: (name: string) => Promise<Array<string>>;

	/**
	 * Gets a single file value from form data by name
	 *
	 * Equivalent to `formData().get(name).asFile()`
	 * @param name - The form field name
	 */
	file: (name: string) => Promise<GFile | null>;

	/**
	 * Gets a many file values from form data by name
	 *
	 * Equivalent to `Array<formData().get(name).asFile()>`
	 * @param name - The form field name
	 */
	files: (name: string) => Promise<Array<GFile>>;

	/**
	 * Parses the request body as JSON.
	 *
	 * Suitable for
	 * - `Content-Type: application/json`
	 * - `Content-Type: application/x-www-form-urlencoded`.
	 *
	 * @returns A typed JSON object.
	 */
	json: <T = any>() => Promise<T>;
};

export type ResponseData =
	| Response
	| ResponseView
	| object
	| Array<any>
	| string
	| Buffer
	| ArrayBufferLike
	| Blob
	| undefined
	| null;

export type NextFunction = () => Promise<ResponseData>;

export interface ResponseView {
	template: string;
	data: Record<string, any>;
	options: IResponseOptions;
}

/* -------------------------------------------------------------------------- */
/*                                   ROUTER                                   */
/* -------------------------------------------------------------------------- */
export type RouteFactory = (route: RouterBuilder) => void;

export type ComposedPipeline = Array<MiddlewareHandler | RequestHandler>;
export interface RouteMetadata {
	id: string;
	exceptionHandler: ExceptionHandler | null;
	pipeline: ComposedPipeline;
}

/**
 * Route Model
 */
export interface Route {
	path: string;
	methods: string[];
	handler: RequestHandler | null;
	middlewares: MiddlewareHandler[];
	exceptionHandler: ExceptionHandler | null;
	pipes: Array<MiddlewareHandler | RequestHandler>;
	name?: string;
}

// Registered Routes
export type Routes = Array<Route>;

/**
 * Routes Definition
 * like : route.get(...).middleware(...).exception(...)
 */
export type RouteDefinition = {
	middleware(...fn: MiddlewareHandler[]): RouteDefinition;
	exception(eh: ExceptionHandler): RouteDefinition;
	name(s: string): RouteDefinition;
};

export type IPCOptions = {
	/**
	 * If true, GamanJS will automatically remove the existing socket file
	 * before starting the server to prevent "Address already in use" errors.
	 * @default true
	 */
	unlink?: boolean;

	/**
	 * Set the file system permissions for the socket file.
	 * Use octal format, e.g., 0o777 to allow cross-user process communication.
	 * Only applicable on Unix-based systems.
	 */
	mode?: number;

	/**
	 * The maximum number of concurrent client connections allowed to the IPC server.
	 */
	maxConnections?: number;

	/**
	 * If true, the socket won't automatically close when the other side
	 * sends a FIN packet. The server can still write data.
	 * @default false
	 */
	allowHalfOpen?: boolean;
};

export type RouterBuilderWithoutHttpMethods = Omit<
	RouterBuilder,
	| 'get'
	| 'post'
	| 'put'
	| 'delete'
	| 'patch'
	| 'all'
	| 'head'
	| 'options'
	| 'match'
>;

export type RouterBuilder = {
	/**
	 * Returns all registered routes within this builder instance.
	 */
	getRoutes: () => Route[];

	/**
	 * Registers a route for the HTTP GET method.
	 */
	get: <T extends ControllerFactory>(
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/**
	 * Registers a route for the HTTP POST method.
	 */
	post: <T extends ControllerFactory>(
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/**
	 * Registers a route for the HTTP PUT method.
	 */
	put: <T extends ControllerFactory>(
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/**
	 * Registers a route for the HTTP DELETE method.
	 */
	delete: <T extends ControllerFactory>(
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/**
	 * Registers a route for the HTTP PATCH method.
	 */
	patch: <T extends ControllerFactory>(
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/**
	 * Registers a route that responds to all standard HTTP methods.
	 */
	all: <T extends ControllerFactory>(
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/**
	 * Registers a route for the HTTP HEAD method.
	 */
	head: <T extends ControllerFactory>(
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/**
	 * Registers a route for the HTTP OPTIONS method.
	 */
	options: <T extends ControllerFactory>(
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/**
	 * Registers a route for a specific set of HTTP methods.
	 */
	match: <T extends ControllerFactory>(
		methods: HTTPMethod[],
		path: string,
		handler: RequestHandler | [fn: T, name: keyof ReturnType<T>],
	) => RouteDefinition;

	/* -------------------------------------------------------------------------- */
	/* Route Grouping                                  */
	/* -------------------------------------------------------------------------- */

	/**
	 * Groups multiple routes under a common path prefix.
	 */
	group: (
		groupPrefix: string,
		callback: (r: RouterBuilder) => void,
	) => RouteDefinition;

	/**
	 * Inject Services to Controller Context
	 */
	mountService: (
		services: Record<string, any>,
	) => RouterBuilderWithoutHttpMethods;

	/**
	 * Mount a global middleware to the router
	 */
	mountMiddleware: (
		...middlewares: MiddlewareHandler[]
	) => RouterBuilderWithoutHttpMethods;

	/**
	 * Mount a global exception handler to the router
	 */
	mountException: (
		exceptionHandler: ExceptionHandler,
	) => RouterBuilderWithoutHttpMethods;

	/**
	 * Mount a external module / router
	 */
	mountRouter: (
		pathPrefix: string,
		router: Router,
	) => RouterBuilderWithoutHttpMethods;
};


export interface SecurityOptions {
    contentSecurityPolicy?: string,
    xFrameOptions?: 'DENY' | 'SAMEORIGIN',
    hsts?: {
		maxAge: number,
		includeSubDomains?: boolean,
		preload?: boolean
    },
    noSniff?: boolean,
    referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url',
    xssFilter?: boolean,
    crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none',
    crossOriginEmbedderPolicy?: 'require-corp' | 'credentialless',
    crossOriginResourcePolicy?: 'same-origin' | 'same-site' | 'cross-origin',
    cacheControl?: string,
    xPermittedCrossDomainPolicies?: 'none' | 'master-only' | 'by-content-type' | 'all',
    xDownloadOptions?: 'noopen',
}