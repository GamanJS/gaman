import { Priority } from '@gaman/common';
import { GamanApp, GamanConfig } from '@gaman/core';

export type FileBuildResult = {
	filePath: string;
	config: GamanConfig;
	mode: 'development' | 'production';
};

export type FileBuildHook = (result: FileBuildResult) => void | Promise<void>;
export type ServerBootstrap = (app: GamanApp) => void | Promise<void>;

export interface IntegrationEvents {
	'gaman:build:single:before'?: FileBuildHook;
	'gaman:server:bootstrap'?: ServerBootstrap;
}

export type Integration = {
	name: string;
	priority?: Priority;
	hooks?: IntegrationEvents;
};
