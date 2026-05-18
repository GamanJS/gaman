import { Logger } from 'gaman/utils';
import { join, relative } from 'node:path';
import { registerCommand } from './registry';
import { migrationTemplate } from '../templates/database'; // Import template kamu
import type { KameConfig } from '../repl';

const handler = async (
  args: string[],
  flags: any,
  cfg: KameConfig,
): Promise<void> => {
  const [name] = args;
  
  if (!name) {
    Logger.error("Usage: gen:migration <name>");
    return;
  }

  const cwd = process.cwd();
  
  // 1. Generate Timestamp (YYYY_MM_DD_HHMMSS)
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') + '_' +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');

  // 2. Tentukan direktori migrations
  const migrationDir = join(
    cwd,
    cfg.srcDir || 'src',
    'database',
    'migrations',
  );

  // 3. Nama file: timestamp_nama_migration.ts
  const fileName = `${timestamp}_${name.toLowerCase().replace(/\s+/g, '_')}.ts`;
  const filePath = join(migrationDir, fileName);

  try {
    // Buat folder jika belum ada
    await Bun.$`mkdir -p ${migrationDir}`.quiet();
    
    // Tulis file menggunakan template yang kamu buat
    await Bun.write(filePath, migrationTemplate() + '\n');

    Logger.info(`created  ${relative(cwd, filePath)}`);
    Logger.info(`Migration "${fileName}" generated successfully.`);
  } catch (error: any) {
    Logger.error(`Failed to generate migration: ${error.message}`);
  }
};

registerCommand({
  name: 'gen:migration',
  description: 'Generate a new database migration file with timestamp',
  usage: "gen:migration <name>",
  aliases: ['gen:mi', 'make:migration'],
  handler,
});