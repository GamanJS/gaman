import { registerCommand } from '../registry';
import { composeSeeder } from '@gaman/db';
import { Logger } from 'gaman/utils';
import { join } from 'path';
registerCommand({
	name: 'db:seed',
	description: 'Execute migration file',
	usage: 'db:seed <filename>',
	aliases: [],
	handler: async (args, flags, cfg) => {
		const filename = args[0];
		if (filename == undefined) {
			Logger.error(`Usage: db:seed <filename>`);
			return;
		}
		Logger.info(`seeder ${filename} is already running...`);
		let seeder: ReturnType<typeof composeSeeder> = await import(
			join(process.cwd(), cfg.srcDir || 'src', 'database', 'seeders', filename)
		);
		if ((seeder as any).default) seeder = (seeder as any).default;

		await seeder();
		Logger.info(`seeder ${filename} process has been completed`);
	},
});
