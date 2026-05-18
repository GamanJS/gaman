export type SeederHandler = () => Promise<void> | void;

export function composeSeeder( handler: SeederHandler) {
	return handler;
}
