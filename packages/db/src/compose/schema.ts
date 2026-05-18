import type { ColumnDefinition } from '../column/defintion-column';
import { SchemaColumnBuilder } from '../column/schema-column-builder';
import { RelationBuilder } from '../relation-builder';

export type SchemaDefinition = Record<string, ColumnDefinition>;

export function composeSchema<T extends SchemaDefinition>(
	name: string,
	fields: (c: SchemaColumnBuilder) => T,
	relations?: (r: RelationBuilder<T['infer']>) => any,
) {
	return {
		name,
		fields: fields(new SchemaColumnBuilder()),
		relations: relations?.(new RelationBuilder<T['infer']>(name)),
		//! Magic: Mengambil tipe data asli dari tiap ColumnBuilder
		infer: {} as {
			[K in keyof T]: T[K]['_type'];
		},
	};
}