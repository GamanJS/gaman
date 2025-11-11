import { composeController } from '@gaman/core';

export default composeController(() => ({
	async Home(ctx) {
		return Res.render('Home', {
			title: 'Anjay'
		});
	},
}));
