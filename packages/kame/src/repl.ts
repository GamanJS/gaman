import * as readline from 'node:readline';
import { Logger, TextFormat } from 'gaman/utils';
import { getAllCommands, getCommand } from './commands/registry';
import { parseInput } from './input-parser';

/* -------------------------------------------------------------------------- */
/*                              REGISTER COMMANDS                             */
/* -------------------------------------------------------------------------- */
import './commands/gen-module';
import './commands/gen-router';
import './commands/gen-controller';
import './commands/gen-service';
import './commands/gen-middleware';
import './commands/gen-exception';
import './commands/gen-migration';
import './commands/gen-seeder';

import './commands/database/migrate';
import './commands/database/seed';

import './commands/buntest-cmd';
import './commands/fetch';

export interface KameConfig {
	/**
	 * @default 'src/'
	 */
	srcDir?: string;
}

export function startKame(cfg: KameConfig = { srcDir: 'src' }) {
	if (!process.env.KAME_CLI) return;
	Logger.info(
		`${TextFormat.BG_CYAN} ${TextFormat.BOLD}Kame ${TextFormat.RESET} System active. Type "help" for commands.`,
	);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		terminal: true,
	});

	rl.setPrompt('> ');
	rl.prompt();
	rl.write('help');

	rl.on('line', async (line) => {
		const _argv = line.trim().split(' ');
		const commandName = _argv[0];
		if (commandName === undefined) return;

		const { args, flags } = parseInput(_argv.slice(1));

		if (commandName === 'help') {
			const commands = getAllCommands();
			Logger.info(`${TextFormat.BOLD}Available commands:${TextFormat.RESET}`);
			for (const cmd of commands) {
				Logger.info(
					`${TextFormat.YELLOW}- ${TextFormat.RESET}${cmd.getUsage().padEnd(40)}  ${TextFormat.GRAY}${cmd.getDescription()}${TextFormat.RESET}`,
				);
			}
			rl.prompt();
			return;
		}

		const cmd = getCommand(commandName);
		if (!cmd) {
			Logger.error(
				`Unknown command: "${commandName}". Run "help" to see available commands.`,
			);
		} else {
			await cmd.getHandler()(args, flags, cfg);
		}

		rl.prompt();
	});
}
