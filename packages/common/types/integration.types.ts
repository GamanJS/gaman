import { Priority } from '@gaman/common';
import { GamanConfig } from '@gaman/core';

export type FileBuildResult = {
	filePath: string;
	config: GamanConfig;
	mode: 'development' | 'production';
};

export type FileBuildHook = (result: FileBuildResult) => void | Promise<void>;

export interface IntegrationEvents {
	'gaman:build:single:before'?: FileBuildHook;
}

export type Integration = {
	name: string;
	priority?: Priority;
	hooks?: IntegrationEvents;
};
