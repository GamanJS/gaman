import { composeService } from 'gaman/compose';
import type { RT } from 'gaman/types';

export const AppService = composeService(() => {
	
	// TODO: Implement your service logic here

	return {
		WelcomeMessage() {
			return 'Welcome to App Service!';
		},
	};
});

export type AppService = RT<typeof AppService>;
