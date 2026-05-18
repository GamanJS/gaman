import type { ColumnDataType } from 'kysely';
import { ColumnDefinition } from './defintion-column';
import { BaseColumnBuilder } from './base-column';
import type { BaseTypeColumn } from './type-column';

const IS_SCHEMA_BUILDER = '__schema_builder__';

export function isSchemaBuilder(def: ColumnDefinition): boolean {
	return def.name === IS_SCHEMA_BUILDER;
}

export class SchemaColumnBuilder
	extends BaseColumnBuilder
	implements BaseTypeColumn<false>
{
	protected override create<T>(type: ColumnDataType): ColumnDefinition<T> {
		return new ColumnDefinition(IS_SCHEMA_BUILDER, type);
	}

	int() {
		return this.create<number>('integer');
	}

	bigInt() {
		return this.create<string>('bigint');
	}

	uuid() {
		return this.create<string>('varchar(36)');
	}

	string(len = 255) {
		return this.create<string>(`varchar(${len})`);
	}

	text() {
		return this.create<string>('text');
	}

	timestamp() {
		return this.create<Date>('datetime');
	}

	boolean() {
		return this.create<boolean>('boolean');
	}

	float(float: 4 | 8 = 4) {
		return this.create<number>(`float${float}`);
	}

	decimal(precision = 10, scale = 2) {
		return this.create<number>(`decimal(${precision}, ${scale})`);
	}

	json<J = any>(type: 'json' | 'jsonb' = 'json') {
		return this.create<J>(type);
	}

	date() {
		return this.create<string>('date');
	}
}
