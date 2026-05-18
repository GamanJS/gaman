import { Logger, TextFormat } from 'gaman/utils';
import { join, relative } from 'node:path';
import { registerCommand } from './registry';
import { exceptionTemplate } from '../templates/module';
import { capitalize } from '../utils';
import type { KameConfig } from '../repl';

const handler = async (
	args: string[],
	flags: any,
	cfg: KameConfig,
): Promise<void> => {
	const [name, module = 'app'] = args;
	if (!name || !module) {
		Logger.error("Usage: gen:exception <name> <module: 'app'>");
		return;
	}

	const nameCapitalized = capitalize(name);
	const cwd = process.cwd();

	// Support nested paths like "v2/user"
	const exceptionDir = join(
		cwd,
		cfg.srcDir || 'src',
		'modules',
		module,
		'exceptions',
	);
	const filePath = join(exceptionDir, `${nameCapitalized}Exception.ts`);

	await Bun.$`mkdir -p ${exceptionDir}`.quiet();
	await Bun.write(filePath, exceptionTemplate() + '\n');
	Logger.info(
		`created ${TextFormat.UNDERLINE}${relative(cwd, filePath)}${TextFormat.RESET}`,
	);
	Logger.info(
		`Exception "${nameCapitalized}Exception" generated successfully.`,
	);
};

registerCommand({
	name: 'gen:exception',
	description: 'Generate a new Exception inside an existing module',
	usage: "gen:exception <name> <module: 'app'>",
	aliases: ['gen:ex'],
	handler,
});
