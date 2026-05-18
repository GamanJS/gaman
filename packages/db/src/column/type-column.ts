import type { ColumnDefinition } from './defintion-column';

type ColumnFn<
	HasName extends boolean,
	T,
	Extra extends any[] = [],
> = HasName extends true
	? (column: string, ...extra: Extra) => ColumnDefinition<T>
	: (...extra: Extra) => ColumnDefinition<T>;

export interface BaseTypeColumn<HasName extends boolean = false> {
	int: ColumnFn<HasName, number>;

	bigInt: ColumnFn<HasName, string>;

	uuid: ColumnFn<HasName, string>;

	string: ColumnFn<HasName, string, [len?: number]>;

	text: ColumnFn<HasName, string>;

	timestamp: ColumnFn<HasName, Date>;

	boolean: ColumnFn<HasName, boolean>;

	float: ColumnFn<HasName, number, [float?: 4 | 8]>;

	decimal: ColumnFn<HasName, number, [precision?: number, scale?: number]>;

	json: <J = any>(
		...args: HasName extends true
			? [column: string, type?: 'json' | 'jsonb']
			: [type?: 'json' | 'jsonb']
	) => ColumnDefinition<J>;

	date: ColumnFn<HasName, string>;
}
