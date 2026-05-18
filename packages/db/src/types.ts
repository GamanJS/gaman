declare const SIMPLE_COLUMN_DATA_TYPES: readonly [
	'varchar',
	'char',
	'text',
	'integer',
	'int2',
	'int4',
	'int8',
	'smallint',
	'bigint',
	'boolean',
	'real',
	'double precision',
	'float4',
	'float8',
	'decimal',
	'numeric',
	'binary',
	'bytea',
	'date',
	'datetime',
	'time',
	'timetz',
	'timestamp',
	'timestamptz',
	'serial',
	'bigserial',
	'uuid',
	'json',
	'jsonb',
	'blob',
	'varbinary',
	'int4range',
	'int4multirange',
	'int8range',
	'int8multirange',
	'numrange',
	'nummultirange',
	'tsrange',
	'tsmultirange',
	'tstzrange',
	'tstzmultirange',
	'daterange',
	'datemultirange',
];
type SimpleColumnDataType = (typeof SIMPLE_COLUMN_DATA_TYPES)[number];
export type ColumnDataType =
	| SimpleColumnDataType
	| `varchar(${number})`
	| `char(${number})`
	| `decimal(${number}, ${number})`
	| `numeric(${number}, ${number})`
	| `binary(${number})`
	| `datetime(${number})`
	| `time(${number})`
	| `timetz(${number})`
	| `timestamp(${number})`
	| `timestamptz(${number})`
	| `varbinary(${number})`;

const sql = {
  // String types
  text: (): 'text' => 'text',
  varchar: (n?: number): 'varchar' | `varchar(${number})` =>
    n !== undefined ? `varchar(${n})` : 'varchar',
  char: (n?: number): 'char' | `char(${number})` =>
    n !== undefined ? `char(${n})` : 'char',

  // Integer types
  integer: (): 'integer' => 'integer',
  int2: (): 'int2' => 'int2',
  int4: (): 'int4' => 'int4',
  int8: (): 'int8' => 'int8',
  smallint: (): 'smallint' => 'smallint',
  bigint: (): 'bigint' => 'bigint',
  serial: (): 'serial' => 'serial',
  bigserial: (): 'bigserial' => 'bigserial',

  // Boolean
  boolean: (): 'boolean' => 'boolean',

  // Float types
  real: (): 'real' => 'real',
  doublePrecision: (): 'double precision' => 'double precision',
  float4: (): 'float4' => 'float4',
  float8: (): 'float8' => 'float8',

  // Decimal / Numeric
  decimal: (precision?: number, scale?: number): 'decimal' | `decimal(${number}, ${number})` =>
    precision !== undefined && scale !== undefined
      ? `decimal(${precision}, ${scale})`
      : 'decimal',
  numeric: (precision?: number, scale?: number): 'numeric' | `numeric(${number}, ${number})` =>
    precision !== undefined && scale !== undefined
      ? `numeric(${precision}, ${scale})`
      : 'numeric',

  // Binary types
  binary: (n?: number): 'binary' | `binary(${number})` =>
    n !== undefined ? `binary(${n})` : 'binary',
  bytea: (): 'bytea' => 'bytea',
  blob: (): 'blob' => 'blob',
  varbinary: (n?: number): 'varbinary' | `varbinary(${number})` =>
    n !== undefined ? `varbinary(${n})` : 'varbinary',

  // Date/Time types
  date: (): 'date' => 'date',
  datetime: (n?: number): 'datetime' | `datetime(${number})` =>
    n !== undefined ? `datetime(${n})` : 'datetime',
  time: (n?: number): 'time' | `time(${number})` =>
    n !== undefined ? `time(${n})` : 'time',
  timetz: (n?: number): 'timetz' | `timetz(${number})` =>
    n !== undefined ? `timetz(${n})` : 'timetz',
  timestamp: (n?: number): 'timestamp' | `timestamp(${number})` =>
    n !== undefined ? `timestamp(${n})` : 'timestamp',
  timestamptz: (n?: number): 'timestamptz' | `timestamptz(${number})` =>
    n !== undefined ? `timestamptz(${n})` : 'timestamptz',

  // UUID
  uuid: (): 'uuid' => 'uuid',

  // JSON types
  json: (): 'json' => 'json',
  jsonb: (): 'jsonb' => 'jsonb',

  // Range types
  int4range: (): 'int4range' => 'int4range',
  int4multirange: (): 'int4multirange' => 'int4multirange',
  int8range: (): 'int8range' => 'int8range',
  int8multirange: (): 'int8multirange' => 'int8multirange',
  numrange: (): 'numrange' => 'numrange',
  nummultirange: (): 'nummultirange' => 'nummultirange',
  tsrange: (): 'tsrange' => 'tsrange',
  tsmultirange: (): 'tsmultirange' => 'tsmultirange',
  tstzrange: (): 'tstzrange' => 'tstzrange',
  tstzmultirange: (): 'tstzmultirange' => 'tstzmultirange',
  daterange: (): 'daterange' => 'daterange',
  datemultirange: (): 'datemultirange' => 'datemultirange',
} satisfies Record<string, (...args: any[]) => ColumnDataType>;