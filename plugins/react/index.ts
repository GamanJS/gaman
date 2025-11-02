import { defineIntegration } from '@gaman/core';
import { hookIntegration } from './hook-integration.js';

export const react = defineIntegration({
	name: 'gaman-react-builder',
	hooks: {
		'gaman:build:single:before': hookIntegration,
	},
});