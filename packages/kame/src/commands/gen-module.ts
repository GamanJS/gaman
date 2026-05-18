import { Logger } from 'gaman/utils';
import { join, basename, relative, dirname } from 'node:path';
import { registerCommand } from './registry';
import {
	controllerTemplate,
	routerTemplate,
	serviceTemplate,
} from '../templates/module';
import { capitalize } from '../utils';
import type { KameConfig } from '../repl';

const handler = async (
	args: string[],
	flags: any,
	cfg: KameConfig,
): Promise<void> => {
	const modulePath = args[0];
	if (!modulePath) {
		Logger.error('Usage: gen:module <name>');
		return;
	}

	// Support nested paths like "v2/user" — use last segment for file naming
	const name = basename(modulePath);
	const nameCapitalized = capitalize(name);
	const cwd = process.cwd();
	const moduleDir = join(cwd, cfg.srcDir || 'src', 'modules', modulePath);

	const files: { filePath: string; content: string }[] = [
		{
			filePath: join(
				moduleDir,
				'controllers',
				`${nameCapitalized}Controller.ts`,
			),
			content: controllerTemplate(name),
		},
		{
			filePath: join(moduleDir, 'services', `${nameCapitalized}Service.ts`),
			content: serviceTemplate(name),
		},
		{
			filePath: join(moduleDir, `${nameCapitalized}Router.ts`),
			content: routerTemplate(name),
		},
	];

	for (const { filePath, content } of files) {
		const dir = dirname(filePath);
		await Bun.$`mkdir -p ${dir}`.quiet();
		await Bun.write(filePath, content + '\n');
		Logger.info(`created  ${relative(cwd, filePath)}`);
	}

	Logger.info(`Module "${nameCapitalized}" generated successfully.`);
};

registerCommand({
	name: 'gen:module',
	description: 'Generate a new module with Controller, Service, and Router',
	usage: 'gen:module <name>',
	aliases: ['gen:mo'],
	handler,
});
