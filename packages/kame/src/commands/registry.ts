import type { KameConfig } from '../repl';

export type CommandHandler = (
	args: string[],
	flags: Record<string, string | boolean>,
	appConfig: KameConfig,
) => Promise<void> | void;

export class Command {
	private _name: string;
	private _handler: CommandHandler;
	private _description: string = '';
	private _usage: string = '';
	private _aliases: string[] = [];

	constructor(name: string, handler: CommandHandler) {
		this._name = name;
		this._handler = handler;
	}

	description(description: string): this {
		this._description = description;
		return this;
	}

	usage(usage: string): this {
		this._usage = usage;
		return this;
	}

	aliases(aliases: string[]): this {
		this._aliases = aliases;
		return this;
	}

	getName(): string {
		return this._name;
	}

	getHandler(): CommandHandler {
		return this._handler;
	}

	getDescription(): string {
		return this._description;
	}

	getUsage(): string {
		return this._usage;
	}

	getAliases(): string[] {
		return this._aliases;
	}
}

const commands = new Map<string, Command>();
const aliases = new Map<string, string>();

export const registerCommand = (
	cmd:
		| Command
		| {
				name: string;
				handler: CommandHandler;
				description?: string;
				usage?: string;
				aliases?: string[];
		  },
): void => {
	let _cmd: Command;
	if (cmd instanceof Command) {
		_cmd = cmd;
	} else {
		_cmd = new Command(cmd.name, cmd.handler)
			.description(cmd.description ?? '')
			.usage(cmd.usage ?? '')
			.aliases(cmd.aliases ?? []);
	}

	commands.set(_cmd.getName(), _cmd);

	// register aliases
	for (const alias of _cmd.getAliases()) {
		aliases.set(alias, _cmd.getName());
	}
};

export const getCommand = (name: string): Command | undefined => {
	const cmd = commands.get(name);
	if (cmd) return cmd;

	// search by alias
	const aliasCmdName = aliases.get(name);
	if (aliasCmdName) return commands.get(aliasCmdName);
};

export const getAllCommands = (): Command[] => Array.from(commands.values());
