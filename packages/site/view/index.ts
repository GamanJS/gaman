import { Context, FileBuildResult } from '@gaman/common';
import { Response } from '@gaman/core';

export interface ViewEngineInstance {
	middleware?(
		ctx: Context,
		next: () => Response | Promise<Response>,
	): Response | Promise<Response>;
	builder?(result: FileBuildResult): void | Promise<void>;
}

export type ViewEngineClassConstructor = {
	new (): ViewEngineInstance;
};
