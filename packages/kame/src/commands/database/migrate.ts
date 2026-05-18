import { registerCommand } from '../registry';
import { Logger } from 'gaman/utils';
import { join } from 'path';
import { readdirSync } from 'fs';

registerCommand({
	name: 'db:migrate',
	description: 'Execute database migrations',
	usage: 'db:migrate [filename] [--fresh] [--force]',
	aliases: ['migrate'],
	handler: async (args, flags, cfg) => {
		const targetFile = args[0];
		const srcDir = cfg.srcDir || 'src';
		const migrationDir = join(process.cwd(), srcDir, 'database', 'migrations');

		try {
			let filesToProcess: string[] = [];

			if (targetFile) {
				filesToProcess = [targetFile];
			} else {
				// Pastikan readdirSync tidak error jika folder belum ada
				const allFiles = readdirSync(migrationDir, { withFileTypes: true });
				filesToProcess = allFiles
					.filter(
						(dirent) =>
							dirent.isFile() &&
							(dirent.name.endsWith('.ts') || dirent.name.endsWith('.js')),
					)
					.map((dirent) => dirent.name)
					.sort((a, b) => a.localeCompare(b));
			}

			if (filesToProcess.length === 0) {
				Logger.info('No migrations found to execute.');
				return;
			}

			for (const filename of filesToProcess) {
				// 1. Validasi Path agar tidak undefined
				const filePath = join(migrationDir, filename);

				// 2. Import Module
				const migrationModule = await import(filePath);

				// 3. Ambil default export atau module itu sendiri
				// Gunakan await lagi jika composeMigration adalah async function
				const migration = await (migrationModule.default || migrationModule);

				// 4. Cek apakah method runUp ada sebelum dipanggil
				if (!migration || typeof migration.runUp !== 'function') {
					Logger.error(
						`Invalid migration format in: ${filename}. Make sure to use export default composeMigration(...)`,
					);
					continue;
				}

				if ('fresh' in flags) {
					await migration.runDown(filename, true);
				}

				await migration.runUp(filename, 'force' in flags);
			}

			Logger.info('Migration process completed.');
		} catch (error: any) {
			// Tampilkan stack trace agar tahu baris mana yang error
			Logger.error(`Migration failed: ${error.message}`);
			if (error.stack) console.error(error.stack);
		}
	},
});
