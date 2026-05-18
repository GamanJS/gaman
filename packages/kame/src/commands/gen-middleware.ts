import { Logger, TextFormat } from 'gaman/utils';
import { join, relative } from 'node:path';
import { registerCommand } from './registry';
import { middlewareTemplate } from '../templates/module';
import { capitalize } from '../utils';
import type { KameConfig } from '../repl';

const handler = async (
	args: string[],
	flags: any,
	cfg: KameConfig,
): Promise<void> => {
	const [name, module = 'app'] = args;
	if (!name || !module) {
		Logger.error("Usage: gen:middleware <name> <module: 'app'>");
		return;
	}

	const nameCapitalized = capitalize(name);
	const cwd = process.cwd();
	// Support nested paths like "v2/user"
	const middlewareDir = join(cwd, cfg.srcDir || 'src', 'modules', module, 'middlewares');
	const filePath = join(middlewareDir, `${nameCapitalized}Middleware.ts`);

	await Bun.$`mkdir -p ${middlewareDir}`.quiet();
	await Bun.write(filePath, middlewareTemplate() + '\n');
	Logger.info(
		`created ${TextFormat.UNDERLINE}${relative(cwd, filePath)}${TextFormat.RESET}`,
	);
	Logger.info(
		`Middleware "${nameCapitalized}Middleware" generated successfully.`,
	);
};

registerCommand({
	name: 'gen:middleware',
	description: 'Generate a new Middleware inside an existing module',
	usage: "gen:middleware <name> <module: 'app'>",
	aliases: ['gen:mi'],
	handler,
});
