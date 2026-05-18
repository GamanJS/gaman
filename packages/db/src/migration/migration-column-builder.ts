import type { ColumnDataType } from 'kysely';
import { ColumnDefinition } from '../column/defintion-column';
import { BaseColumnBuilder } from '../column/base-column';
import type { BaseTypeColumn } from '../column/type-column';

export class MigrationTableBuilder
	extends BaseColumnBuilder
	implements BaseTypeColumn<true>
{
	public columns: ColumnDefinition[] = [];

	protected override create<T>(
		column: string,
		type: ColumnDataType,
	): ColumnDefinition<T> {
		const col = new ColumnDefinition<T>(column, type);
		this.columns.push(col);
		return col;
	}
	int(column: string) {
		return this.create<number>(column, 'integer');
	}

	bigInt(column: string) {
		return this.create<string>(column, 'bigint');
	}

	uuid(column: string) {
		return this.create<string>(column, 'varchar(36)');
	}

	string(column: string, len = 255) {
		return this.create<string>(column, `varchar(${len})`);
	}

	text(column: string) {
		return this.create<string>(column, 'text');
	}

	timestamp(column: string) {
		return this.create<Date>(column, 'datetime');
	}

	boolean(column: string) {
		return this.create<boolean>(column, 'boolean');
	}

	float(column: string, float: 4 | 8 = 4) {
		return this.create<number>(column, `float${float}`);
	}

	decimal(column: string, precision = 10, scale = 2) {
		return this.create<number>(column, `decimal(${precision}, ${scale})`);
	}

	json<J = any>(column: string, type: 'json' | 'jsonb' = 'json') {
		return this.create<J>(column, type);
	}

	date(column: string) {
		return this.create<string>(column, 'date');
	}
}
