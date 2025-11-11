import { TextFormat } from '@gaman/common';
import { defineBootstrap } from '@gaman/core';
import AppRoutes from './routes/AppRoutes';
import { staticServe } from '@gaman/static';
import AppMiddleware from './middlewares/AppMiddleware';
import { WebsocketGateway } from '@gaman/websocket';
import { session } from '@gaman/session';
import { jwt } from '@gaman/jwt';
import JwtRoutes from './routes/JwtRoutes';
import { jwtAuthMiddleware } from './middlewares/JwtAuthMiddleware';

defineBootstrap(async (app) => {
	app.mount(
		AppRoutes,
		staticServe(),
		AppMiddleware(),
		jwtAuthMiddleware(),
	);


	app.mount(JwtRoutes);

	const server = await app.mountServer(':3431');
	WebsocketGateway.upgrade(server);

	Log.log(
		`Server is running at ${TextFormat.UNDERLINE}http://localhost:3431${TextFormat.RESET}`,
	);
});
