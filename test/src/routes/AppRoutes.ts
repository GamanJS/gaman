import {
	composeInterceptor,
	composeExceptionHandler,
	composeRoutes,
} from '@gaman/core';
import AppController from '../controllers/AppController';
import { InterceptorException } from '@gaman/common';
import AppWebsocket from '../AppWebsocket';
import TesWSMiddleware from '../middlewares/TesWSMiddleware';

export const Pipe = composeInterceptor(async (ctx, next, error) => {
	ctx.transformParams({
		name: `${ctx.param('name')}-anjay `,
	});
	// throw error('aduhai  ', 500);
	const res = await next();
	const body = JSON.parse(res.body);
	body['anu'] = 1;
	res.body = JSON.stringify(body);
	return res;
});

export const ErrorHandle = composeExceptionHandler((err) => {
	if (err instanceof InterceptorException) {
		const ctx = err.context;
		return Res.json(
			{ message: `${err.message}  ${ctx.param('name')}` },
			{ status: err.statusCode },
		);
	}
	console.error(err);
	return Res.json(
		{
			message: 'Internal server error!',
		},
		{ status: 500 },
	);
});

export default composeRoutes((r) => {

	r.get('/', [AppController, 'Home']);

	r.get('session', async (ctx) => {
		const value = await ctx.session.get();
		if (value) {
			console.log('ada', value.userId);
		} else {
			await ctx.session.set({ userId: 'abogoboga' });
		}

		return Res.json({ message: 'OK!' });
	});

	
});
