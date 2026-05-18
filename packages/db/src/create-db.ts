import { Kysely, MysqlDialect, PostgresDialect } from 'kysely';
import { BunSqliteDialect } from 'kysely-bun-sqlite';
import { Database } from 'bun:sqlite';

let db: Kysely<any> | null = null;

//! SINGLETON CONNECTION
export function getDB() {
	if (db) return db;

	const connection = process.env.DB_CONNECTION || 'sqlite';

	const config = {
		host: process.env.DB_HOST || '127.0.0.1',
		port: parseInt(process.env.DB_PORT || '0'),
		database: process.env.DB_DATABASE || 'database.sqlite',
		user: process.env.DB_USERNAME || 'root',
		password: process.env.DB_PASSWORD || '',
	};

	function getDialect() {
		switch (connection.toLowerCase()) {
			case 'postgres':
			case 'pg':
				return new PostgresDialect({
					pool: async () => {
						const { Pool } = await import('pg');
						return new Pool({
							host: config.host,
							port: config.port || 5432,
							database: config.database,
							user: config.user,
							password: config.password,
						});
					},
				});

			case 'mysql':
			case 'mysql2':
				return new MysqlDialect({
					pool: async () => {
						const { createPool } = await import('mysql2');
						return createPool({
							host: config.host,
							port: config.port || 3306,
							database: config.database,
							user: config.user,
							password: config.password,
						});
					},
				});

			case 'sqlite':
			default:
				return new BunSqliteDialect({
					database: new Database(config.database),
				});
		}
	}

	db = new Kysely<any>({
		dialect: getDialect(),
	});

	return db;
}