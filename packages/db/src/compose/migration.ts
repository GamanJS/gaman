import { MigrationModel } from '../database/MigrationModel';
import { MigrationBuilder } from '../migration';
import { Logger } from 'gaman/utils';

export async function composeMigration(handlers: {
	up: (m: MigrationBuilder) => Promise<void> | void;
	down: (m: MigrationBuilder) => Promise<void> | void;
}) {
	await MigrationModel.sync();

	return {
		async runUp(filename: string) {
			const found = await MigrationModel.findOne('name', filename);

			if (found) {
				Logger.error(
					`Migration [${filename}] already executed. Use '--fresh' to drop and up again.`,
				);
				return;
			}

			Logger.info(`Migrating: ${filename}`);
			await handlers.up(new MigrationBuilder());

			if (!found) {
				await MigrationModel.create({ name: filename });
			}
			Logger.info(`Migrated: ${filename}`);
		},

		async runDown(filename: string, force: boolean = false) {
			const found = await MigrationModel.findOne('name', filename);

			if (!found && !force) {
				Logger.warn(
					`Skip Rollback: [${filename}] has not been executed. Use '--force' to re-run.`,
				);
				return;
			}

			Logger.info(`Rolling back: ${filename}`);
			await handlers.down(new MigrationBuilder());

			if(found) await MigrationModel.delete(found.id);
			Logger.info(`Rolled back: ${filename}`);
		},
	};
}
