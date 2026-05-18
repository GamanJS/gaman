import { Logger } from 'gaman/utils';
import { join, relative } from 'node:path';
import { registerCommand } from './registry';
import { routerBlankTemplate } from '../templates/module';
import { capitalize } from '../utils';
import type { KameConfig } from '../repl';

const handler = async (
	args: string[],
	flags: any,
	cfg: KameConfig,
): Promise<void> => {
	const [name, module = 'app'] = args;
	if (!name || !module) {
		Logger.error("Usage: gen:router <name> <module: 'app'>");
		return;
	}

	const nameCapitalized = capitalize(name);
	const cwd = process.cwd();
	// Support nested paths like "v2/user"
	const routerDir = join(cwd, cfg.srcDir || 'src', 'modules', module);
	const filePath = join(routerDir, `${nameCapitalized}Router.ts`);

	await Bun.$`mkdir -p ${routerDir}`.quiet();
	await Bun.write(filePath, routerBlankTemplate() + '\n');
	Logger.info(`created  ${relative(cwd, filePath)}`);
	Logger.info(`Router "${nameCapitalized}Router" generated successfully.`);
};

registerCommand({
	name: 'gen:router',
	description: 'Generate a new Router inside an existing module',
	usage: "gen:router <name> <module: 'app'>",
	aliases: ['gen:ro'],
	handler,
});
