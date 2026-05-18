import { Logger } from 'gaman/utils';
import { join, relative, basename } from 'node:path';
import { registerCommand } from './registry';
import { standaloneServiceTemplate } from '../templates/service';
import { capitalize, toCamelCase } from '../utils';
import type { KameConfig } from '../repl';

/**
 * Inject the new service into the module Router file.
 * Adds the import statement and an entry inside r.mountService({...}).
 */
const patchRouter = async (
	routerPath: string,
	serviceName: string,
): Promise<void> => {
	const file = Bun.file(routerPath);
	if (!(await file.exists())) {
		Logger.warn(`Router not found at ${routerPath}, skipping auto-register.`);
		return;
	}

	const nameCapitalized = capitalize(serviceName);
	const camelName = toCamelCase(serviceName);
	const importLine = `import { ${nameCapitalized}Service } from './services/${nameCapitalized}Service';`;
	const mountEntry = `\t\t${camelName}Service: ${nameCapitalized}Service(),`;

	let source = await file.text();

	// --- 1. Add import if not already present ---
	if (!source.includes(importLine)) {
		// Insert after the last import line
		const lastImportIdx = source.lastIndexOf('\nimport ');
		const insertAfter =
			lastImportIdx !== -1
				? source.indexOf('\n', lastImportIdx + 1)
				: source.indexOf('\n');
		source =
			source.slice(0, insertAfter) +
			'\n' +
			importLine +
			source.slice(insertAfter);
	}

	if (!source.includes(`${camelName}Service:`)) {
		const mountStart = source.indexOf('r.mountService({');
		if (mountStart !== -1) {
			// Find the closing }) of mountService
			const closingIdx = source.indexOf('\t});', mountStart);
			if (closingIdx !== -1) {
				source =
					source.slice(0, closingIdx) +
					mountEntry +
					'\n' +
					source.slice(closingIdx);
			}
		} else {
			Logger.warn(
				`r.mountService block not found in ${routerPath}, skipping auto-register.`,
			);
		}
	}

	await Bun.write(routerPath, source);
};

const handler = async (
	args: string[],
	flags: any,
	cfg: KameConfig,
): Promise<void> => {
	const [name, module = 'app'] = args;
	if (!name || !module) {
		Logger.error("Usage: gen:service <name> <module: 'app'>");
		return;
	}

	const nameCapitalized = capitalize(name);
	// Support nested paths like "v2/user" — use last segment for Router filename
	const moduleSegment = basename(module);
	const moduleCapitalized = capitalize(moduleSegment);
	const cwd = process.cwd();
	const serviceDir = join(
		cwd,
		cfg.srcDir || 'src',
		'modules',
		module,
		'services',
	);
	const filePath = join(serviceDir, `${nameCapitalized}Service.ts`);

	await Bun.$`mkdir -p ${serviceDir}`.quiet();
	await Bun.write(filePath, standaloneServiceTemplate(name) + '\n');
	Logger.info(`created  ${relative(cwd, filePath)}`);

	// Auto-register in module router (named after last segment, e.g. UserRouter.ts)
	const routerPath = join(
		cwd,
		cfg.srcDir || 'src',
		'modules',
		module,
		`${moduleCapitalized}Router.ts`,
	);
	await patchRouter(routerPath, name);
	Logger.info(`updated  ${relative(cwd, routerPath)}`);

	Logger.info(`Service "${nameCapitalized}Service" generated successfully.`);
};

registerCommand({
	name: 'gen:service',
	description: 'Generate a new Service and register it in the module Router',
	usage: "gen:service <name> <module: 'app'>",
	aliases: ['gen:se'],
	handler,
});
