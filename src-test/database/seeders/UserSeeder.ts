import { composeSeeder } from '../../../packages/db/src';
import UserModel from '../models/UserModel';

export default composeSeeder(async () => {
	UserModel.create({
		name: 'Anomali',
		umur: 12,
	});
});
