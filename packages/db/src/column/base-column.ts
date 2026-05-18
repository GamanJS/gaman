import type { ColumnDataType } from 'kysely';
import { ColumnDefinition } from './defintion-column';

export class BaseColumnBuilder {
	protected create<T>(column: string, type: ColumnDataType) {
		return new ColumnDefinition<T>(column, type);
	}
}
