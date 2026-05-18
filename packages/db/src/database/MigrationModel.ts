import { composeSchema } from '../compose';
import { Model } from '../model';

export const MigrationSchema = composeSchema('__gaman_migrations', (c) => ({
	id: c.int().primary().autoIncrement(),
	name: c.string().unique(),
	createdAt: c.string().default(() => new Date().toISOString()),
}));

export const MigrationModel = new Model(MigrationSchema);
