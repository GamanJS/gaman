import { composeSchema, Model } from '../../../packages/db/src';

export const UserSchema = composeSchema('users', (c) => ({
	id: c.int().primary().autoIncrement(),
	name: c.string(),
	umur: c.int(),
}));

export type User = typeof UserSchema.infer;

export default new Model(UserSchema);
