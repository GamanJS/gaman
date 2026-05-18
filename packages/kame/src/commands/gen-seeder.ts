import { Logger } from 'gaman/utils';
import { join, relative } from 'node:path';
import { registerCommand } from './registry';
import type { KameConfig } from '../repl';
import { seederTemplate } from '../templates/database';

const handler = async (
	args: string[],
	flags: any,
	cfg: KameConfig,
): Promise<void> => {
	const [name] = args;

	if (!name) {
		Logger.error('Usage: gen:seeder <name>');
		return;
	}

	const cwd = process.cwd();

	const seederDir = join(cwd, cfg.srcDir || 'src', 'database', 'seeders');

	const fileName = name.includes('.ts') ? name : `${name}.ts`;
	const filePath = join(seederDir, fileName);

	try {
		// Buat folder jika belum ada
		await Bun.$`mkdir -p ${seederDir}`.quiet();

		// Tulis file menggunakan template yang kamu buat
		await Bun.write(filePath, seederTemplate() + '\n');

		Logger.info(`created  ${relative(cwd, filePath)}`);
		Logger.info(`Seeder "${fileName}" generated successfully.`);
	} catch (error: any) {
		Logger.error(`Failed to generate seeder: ${error.message}`);
	}
};

registerCommand({
	name: 'gen:seeder',
	description: 'Generate a new database seeder file with timestamp',
	usage: 'gen:seeder <name>',
	aliases: ['gen:seed', 'make:seeder'],
	handler,
});
