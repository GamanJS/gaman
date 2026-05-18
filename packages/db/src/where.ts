import type { ComparisonOperatorExpression } from 'kysely';
import type { Kysely, SelectQueryBuilder } from 'kysely';

export type WhereCondition<T> = [keyof T, ComparisonOperatorExpression, any];

export class Where<T extends Record<string, any>> {
	private conditions: WhereCondition<T>[] = [];
	private qb: SelectQueryBuilder<any, any, any>;

	constructor(
		private kysely: Kysely<any>,
		private table: string,
	) {
		this.qb = this.kysely.selectFrom(this.table);
	}

	private applyWhere<Q extends { where: Function }>(query: Q): Q {
		let q = query;

		for (const [col, op, val] of this.conditions) {
			q = q.where(col as string, op, val);
		}

		return q;
	}

	/**
	 * @ID Tambah kondisi where.
	 * @EN Adds where condition.
	 */
	where(column: keyof T, op: ComparisonOperatorExpression, value: any) {
		this.conditions.push([column, op, value]);
		this.qb = this.qb.where(column as string, op, value);
		return this;
	}

	/**
	 * @ID Memperbarui data berdasarkan model.
	 * @EN Updates a record based on its model.
	 */
	async update(data: Partial<T>) {
		let q = this.kysely.updateTable(this.table).set(data as any);

		q = this.applyWhere(q);

		return await q.execute();
	}

	/**
	 * @ID Menghapus rekaman berdasarkan model.
	 * @EN Deletes a record based on its model.
	 */
	async delete() {
		let q = this.kysely.deleteFrom(this.table);

		q = this.applyWhere(q);

		return await q.execute();
	}

	/**
	 * @ID Sorting data (type-safe column).
	 * @EN Orders query result (type-safe column).
	 */
	orderBy(column: keyof T, direction: 'asc' | 'desc' = 'asc') {
		this.qb = this.qb.orderBy(column as string, direction);
		return this;
	}

	/**
	 * @ID Batasi jumlah data.
	 * @EN Limits query result.
	 */
	limit(n: number) {
		this.qb = this.qb.limit(n);
		return this;
	}

	/**
	 * @ID Offset data.
	 * @EN Sets query offset.
	 */
	offset(n: number) {
		this.qb = this.qb.offset(n);
		return this;
	}

	/**
	 * @ID Mengambil semua hasil query.
	 * @EN Executes query and returns all results.
	 */
	async get(): Promise<T[]> {
		return await this.qb.selectAll().execute();
	}

	/**
	 * @ID Mengambil satu data pertama.
	 * @EN Executes query and returns first result.
	 */
	async first(): Promise<T | undefined> {
		return await this.qb.selectAll().executeTakeFirst();
	}

	/**
	 * @ID Menghitung total jumlah rekaman dalam query.
	 * @EN Counts the total number of records in the query.
	 */
	async count() {
		const result = await this.qb
			.clearSelect()
			.select((eb: any) => eb.fn.countAll().as('total'))
			.executeTakeFirst();

		return Number((result as any)?.total || 0);
	}

	/**
	 * @ID Pagination query.
	 * @EN Paginate query results.
	 */
	async paginate(page: number = 1, limit: number = 15) {
		const offset = (page - 1) * limit;

		const [data, totalResult] = await Promise.all([
			this.qb.selectAll().limit(limit).offset(offset).execute(),
			this.qb
				.clearSelect()
				.select((eb: any) => eb.fn.countAll().as('total'))
				.executeTakeFirst(),
		]);

		const total = Number((totalResult as any)?.total || 0);

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
}
