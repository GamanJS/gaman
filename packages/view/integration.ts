import { Integration } from '@gaman/common';

export const view = (): Integration => ({
	name: 'gaman:view',
	hooks: {
    "gaman:server:bootstrap": async (app) => {
      app.mount()
    }
  },
});
