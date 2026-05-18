import { Kysely } from 'kysely';
import type { composeSchema } from './compose/schema';
import type { ComparisonOperatorExpression } from 'kysely';
import { getDB } from './create-db';
import { Where } from './where';

export class Model<T extends ReturnType<typeof composeSchema>> {
	/**
	 * @ID Instance database (singleton).
	 * @EN Singleton database instance.
	 */
	public kysely: Kysely<any> = getDB();

	constructor(public schema: T) {}

	//! init table
	/**
	 * @ID Membuat tabel berdasarkan schema jika belum ada.
	 * @EN Creates table based on schema if it does not exist.
	 */
	async sync() {
		let tableBuilder = this.kysely.schema
			.createTable(this.schema.name)
			.ifNotExists();

		const indexes: string[] = [];

		for (const [colName, colDefintion] of Object.entries(this.schema.fields)) {
			if (!colDefintion.type) {
				throw new Error(`Column "${colName}" has no type defined`);
			}

			tableBuilder = tableBuilder
				.addColumn(colName, colDefintion.type, (cb) => {
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
				})
				.ifNotExists();

			//? simpan index untuk dibuat nanti
			if (colDefintion.isIndex) {
				indexes.push(colName);
			}
		}

		const result = await tableBuilder.execute();

		// buat index setelah table dibuat
		for (const colName of indexes) {
			await this.kysely.schema
				.createIndex(`${this.schema.name}_${colName}_idx`)
				.ifNotExists()
				.on(this.schema.name)
				.column(colName)
				.execute();
		}

		return result;
	}

	/**
	 * @ID Base query builder untuk tabel ini.
	 * @EN Base query builder for this table.
	 */
	query() {
		return this.kysely.selectFrom(this.schema.name);
	}

	/**
	 * @ID Mengambil semua data dari tabel.
	 * @EN Fetches all records from the table.
	 */
	async all(): Promise<Array<T['infer']>> {
		return await this.query().selectAll().execute();
	}

	/**
	 * @ID Mencari satu rekaman berdasarkan nama kolom dan nilai tertentu.
	 * @EN Finds multiple record by a specific column and value.
	 */
	async find(column: keyof T['infer'], value: any): Promise<Array<T['infer']>> {
		return await this.query()
			.selectAll()
			.where(column as any, '=', value)
			.execute();
	}

	/**
	 * @ID Mencari satu data berdasarkan kolom.
	 * @EN Finds a single record by column.
	 */
	async findOne(
		column: keyof T['infer'],
		value: any,
	): Promise<T['infer'] | undefined> {
		return await this.query()
			.selectAll()
			.where(column as any, '=', value)
			.executeTakeFirst();
	}

	/**
	 * @ID Query filter berbasis kondisi (return query builder).
	 * @EN Conditional query filter (returns query builder).
	 */
	where(
		column: keyof T['infer'],
		op: ComparisonOperatorExpression,
		value: any,
	) {
		return new Where<T['infer']>(this.kysely, this.schema.name).where(
			column,
			op,
			value,
		);
	}
	/**
	 * @ID Membuat data baru ke tabel.
	 * @EN Inserts new record into table.
	 */
	async create(data: Partial<T['infer']>) {
		const finalData: any = { ...data };

		for (const [key, col] of Object.entries(this.schema.fields)) {
			if (finalData[key] === undefined && col.defaultValue !== null) {
				if (typeof col.defaultValue === 'function') {
					finalData[key] = col.defaultValue();
				} else {
					finalData[key] = col.defaultValue;
				}
			}
		}

		return await this.kysely
			.insertInto(this.schema.name)
			.values(finalData)
			.executeTakeFirstOrThrow();
	}

	/**
	 * @ID Membuat banyak data sekaligus ke tabel.
	 * @EN Inserts multiple records into the table.
	 */
	async createMany(data: Array<Partial<T['infer']>>) {
		const finalData = data.map((item) => {
			const row: any = { ...item };

			for (const [key, col] of Object.entries(this.schema.fields)) {
				if (row[key] === undefined && col.defaultValue !== null) {
					if (typeof col.defaultValue === 'function') {
						row[key] = col.defaultValue();
					} else {
						row[key] = col.defaultValue;
					}
				}
			}

			return row;
		});

		return await this.kysely
			.insertInto(this.schema.name)
			.values(finalData)
			.execute();
	}

	/**
	 * @ID Memperbarui data berdasarkan ID unik.
	 * @EN Updates a record based on its unique ID.
	 */
	async update(id: number | string, data: Partial<T['infer']>) {
		return await this.kysely
			.updateTable(this.schema.name)
			.set(data as any)
			.where('id' as any, '=', id as any)
			.execute();
	}

	/**
	 * @ID Menghapus rekaman berdasarkan ID unik.
	 * @EN Deletes a record based on its unique ID.
	 */
	async delete(id: number | string) {
		return await this.kysely
			.deleteFrom(this.schema.name)
			.where('id' as any, '=', id as any)
			.execute();
	}

	/**
	 * @ID Menghitung total jumlah rekaman dalam tabel.
	 * @EN Counts the total number of records in the table.
	 */
	async count() {
		const result = await this.query()
			.select((eb: any) => eb.fn.countAll().as('total'))
			.executeTakeFirst();

		return Number((result as any)?.total || 0);
	}

	/**
	 * @ID Mengambil rekaman terbaru berdasarkan urutan kolom tertentu.
	 * @EN Retrieves the latest record ordered by a specific column.
	 */
	async latest(column: keyof T['infer'] = 'created_at' as any) {
		return await this.query()
			.selectAll()
			.orderBy(column as any, 'desc')
			.executeTakeFirst();
	}

	/**
	 * @ID Mengambil data dengan sistem paginasi.
	 * @EN Retrieves data using a pagination system.
	 */
	async paginate(page: number = 1, limit: number = 15) {
		const offset = (page - 1) * limit;

		const [data, total] = await Promise.all([
			this.query().selectAll().limit(limit).offset(offset).execute(),
			this.count(),
		]);

		return {
			data,
			meta: {
				total,
				page,
				limit,
				lastPage: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * @ID Mengembalikan instance Kysely utama untuk akses database tingkat rendah.
	 * @EN Returns the raw Kysely instance for low-level database access.
	 */
	getRaw() {
		return this.kysely;
	}

	/**
	 * @ID Menghapus semua data di dalam tabel (bersihkan tabel).
	 * @EN Deletes all data within the table (clears the table).
	 */
	async truncate() {
		return await this.kysely.deleteFrom(this.schema.name).execute();
	}
}
