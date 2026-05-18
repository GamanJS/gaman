import { Kysely } from 'kysely';
import { MigrationTableBuilder } from './migration-column-builder';
import type { composeSchema } from '../compose';
import { SchemaColumnBuilder } from '../column/schema-column-builder';
import type { ColumnDefinition } from '../column/defintion-column';
import { getDB } from '../create-db';

export class MigrationBuilder {
	private kysely = getDB();

	/**
	 * CREATE TABLE
	 */
	async createTable(tableName: string, cb: (t: MigrationTableBuilder) => void) {
		const table = new MigrationTableBuilder();

		cb(table);

		let query = this.kysely.schema.createTable(tableName).ifNotExists();

		const indexes: string[] = [];
		for (const col of table.columns) {
			if (!col.type) {
				throw new Error(`Column "${col.name}" has no type defined`);
			}

			query = query.addColumn(col.name, col.type, (b) => {
				let res = b;

				if (col.isPrimary) res = res.primaryKey();
				if (col.isAutoIncrement) res = res.autoIncrement();
				if (col.isUnsigned) res = res.unsigned();
				if (col.isUnique) res = res.unique();
				if (!col.isNullable) res = res.notNull();
				if (
					col.defaultValue !== null &&
					typeof col.defaultValue !== 'function'
				) {
					res = res.defaultTo(col.defaultValue);
				}

				return res;
			});

			//? simpan index untuk dibuat nanti
			if (col.isIndex) {
				indexes.push(col.name);
			}
		}

		const result = await query.execute();

		// buat index setelah table dibuat
		for (const colName of indexes) {
			await this.kysely.schema
				.createIndex(`${tableName}_${colName}_idx`)
				.ifNotExists()
				.on(tableName)
				.column(colName)
				.execute();
		}

		return result;
	}

	async createTableFromSchema(schema: ReturnType<typeof composeSchema>) {
		let tableBuilder = this.kysely.schema
			.createTable(schema.name)
			.ifNotExists();

		const indexes: string[] = [];

		for (const [colName, colDefintion] of Object.entries(schema.fields)) {
			if (!colDefintion.type) {
				throw new Error(`Column "${colName}" has no type defined`);
			}

			tableBuilder = tableBuilder.addColumn(
				colName,
				colDefintion.type,
				(cb) => {
					let res = cb;

					if (colDefintion.isPrimary) res = res.primaryKey();
					if (colDefintion.isAutoIncrement) res = res.autoIncrement();
					if (colDefintion.isUnsigned) res = res.unsigned();
					if (colDefintion.isUnique) res = res.unique();
					if (!colDefintion.isNullable) res = res.notNull();
					if (
						colDefintion.defaultValue !== undefined &&
						colDefintion.defaultValue !== null &&
						typeof colDefintion.defaultValue !== 'function'
					) {
						res = res.defaultTo(colDefintion.defaultValue);
					}

					return res;
				},
			);

			//? simpan index untuk dibuat nanti
			if (colDefintion.isIndex) {
				indexes.push(colName);
			}
		}

		const result = await tableBuilder.execute();

		// buat index setelah table dibuat
		for (const colName of indexes) {
			await this.kysely.schema
				.createIndex(`${schema.name}_${colName}_idx`)
				.ifNotExists()
				.on(schema.name)
				.column(colName)
				.execute();
		}

		return result;
	}

	/**
	 * DROP TABLE
	 */
	async dropTable(name: string) {
		return this.kysely.schema.dropTable(name).ifExists().execute();
	}

	/**
	 * ADD COLUMN
	 */
	async addColumn(
		table: string,
		name: string,
		cb: (c: SchemaColumnBuilder) => ColumnDefinition,
	) {
		const colDefintion = cb(new SchemaColumnBuilder());

		const result = await this.kysely.schema
			.alterTable(table)
			.addColumn(name, colDefintion._type, (b) => {
				let res = b;

				if (colDefintion.isPrimary) res = res.primaryKey();
				if (colDefintion.isAutoIncrement) res = res.autoIncrement();
				if (colDefintion.isUnsigned) res = res.unsigned();
				if (colDefintion.isUnique) res = res.unique();
				if (!colDefintion.isNullable) res = res.notNull();
				if (
					colDefintion.defaultValue !== null &&
					typeof colDefintion.defaultValue !== 'function'
				) {
					res = res.defaultTo(colDefintion.defaultValue);
				}
				return res;
			})
			.execute();

		if (colDefintion.isIndex) {
			this.createIndex(table, colDefintion.name, colDefintion.isUnique);
		}
	}

	/**
	 * DROP COLUMN
	 */
	async dropColumn(table: string, name: string) {
		return this.kysely.schema.alterTable(table).dropColumn(name).execute();
	}

	/**
	 * RENAME COLUMN
	 */
	async renameColumn(table: string, from: string, to: string) {
		return this.kysely.schema
			.alterTable(table)
			.renameColumn(from, to)
			.execute();
	}

	/**
	 * CREATE INDEX
	 */
	async createIndex(table: string, column: string, unique = false) {
		let q = this.kysely.schema
			.createIndex(`${table}_${column}_idx`)
			.on(table)
			.column(column);

		if (unique) q = q.unique();

		return q.execute();
	}

	/**
	 * DROP INDEX
	 */
	async dropIndex(name: string) {
		return this.kysely.schema.dropIndex(name).execute();
	}
}
