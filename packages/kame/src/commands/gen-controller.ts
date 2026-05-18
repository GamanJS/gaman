import { Logger } from 'gaman/utils';
import { join, relative } from 'node:path';
import { registerCommand } from './registry';
import { controllerTemplate } from '../templates/module';
import { capitalize } from '../utils';
import type { KameConfig } from '../repl';

const handler = async (
	args: string[],
	flags: any,
	cfg: KameConfig,
): Promise<void> => {
	const [name, module = 'app'] = args;
	if (!name || !module) {
		Logger.error("Usage: gen:controller <name> <module: 'app'>");
		return;
	}

	const nameCapitalized = capitalize(name);
	const cwd = process.cwd();
	// Support nested paths like "v2/user"
	const controllerDir = join(
		cwd,
		cfg.srcDir || 'src',
		'modules',
		module,
		'controllers',
	);
	const filePath = join(controllerDir, `${nameCapitalized}Controller.ts`);

	await Bun.$`mkdir -p ${controllerDir}`.quiet();
	await Bun.write(filePath, controllerTemplate(name) + '\n');
	Logger.info(`created  ${relative(cwd, filePath)}`);
	Logger.info(
		`Controller "${nameCapitalized}Controller" generated successfully.`,
	);
};

registerCommand({
	name: 'gen:controller',
	description: 'Generate a new Controller inside an existing module',
	usage: "gen:controller <name> <module: 'app'>",
	aliases: ['gen:co'],
	handler,
});
