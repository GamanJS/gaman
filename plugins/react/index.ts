import { Integration } from '@gaman/common';
import { hookIntegration } from './hook-integration.js';

export const react = (): Integration => ({
	name: 'gaman:react',
	hooks: {
		'gaman:build:single:before': hookIntegration,
	},
});
