import { composeController } from 'gaman/compose';
import { Res } from 'gaman/responder';
import { AppService } from '../services/AppService';
import UserModel from '../../../database/models/UserModel';

export type Deps = {
	appService: AppService;
};

export default composeController(({ appService }: Deps) => {
	// TODO: Implement your controller logic here

	return {
		async index(ctx) {
			const res = await UserModel.where('umur', '>=', 0).paginate(2, 2)
			return Res.json(res);
		},
		async sync(ctx) {
			await UserModel.sync();
			return Res.json({
				message: 'berhasil membuat table',
			});
		},
		async createUser({ json }) {
			const { name, umur } = await json();
			const res = await UserModel.create({
				name,
				umur,
			});

			return Res.json({
				message: 'berhasil di buat',
			});
		},
	};
});
