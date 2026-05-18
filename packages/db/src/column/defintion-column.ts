import type { ColumnDataType } from 'kysely';

/**
 * Disini ColumnDefintion itinya kayak config gitu jadi dari type kayak col.string() bakal lanjut ke defintion ini,
 * Contoh: col.string().isPrimary()
 */
export class ColumnDefinition<T = any> {
	public isPrimary: boolean = false;
	public isAutoIncrement: boolean = false;
	public isNullable: boolean = false;
	public isUnique: boolean = false;
	public isUnsigned: boolean = false;

	public isIndex: boolean = false;

	public defaultValue?: any;
	
	//? Properti bayangan untuk inferensi tipe data TypeScript
	public _type!: T;

	constructor(
		public name: string,
		public type: ColumnDataType | null,
	) {}

	nullable() {
		this.isNullable = true;
		return this;
	}

	unique() {
		this.isUnique = true;
		return this;
	}

	primary() {
		this.isPrimary = true;
		this.isNullable = false;
		return this;
	}

	autoIncrement() {
		this.isAutoIncrement = true;
		return this;
	}

	default(val: any | (() => any)) {
		this.defaultValue = val;
		return this;
	}

	unsigned() {
		this.isUnsigned = true;
		return this;
	}

	index() {
		this.isIndex = true;
	}
}
