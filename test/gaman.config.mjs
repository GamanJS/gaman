import { defineConfig } from '@gaman/core';
import { react } from '@gaman/react';

export default defineConfig({
	verbose: true,
	integrations: [react()],
});
