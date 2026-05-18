export const migrationTemplate = () => {
	return `
import { composeMigration } from "@gaman/db"

/**
 * This migration file acts as version control for your database schema.
 * Use it to define changes such as creating tables, adding columns, or managing indexes.
 */
export default composeMigration({

  /**
   * The 'up' method is executed when you run the 'db:migrate' command.
   * This is where you write the logic to APPLY changes to the database.
   * 
   * Example:
   * await m.createTable('users', (table) => {
   *   table.int('id').primary().autoIncrement();
   *   table.string('username').unique();
   *   table.text('bio');
   * });
   */
  async up(m) {
    // Write your 'up' logic here
  },
  
  /**
   * The 'down' method is executed when you run the 'db:rollback' or 'db:migrate -fresh' command.
   * This is where you write the logic to REVERSE the changes made in the 'up' method.
   * Warning: Rolling back often results in permanent data loss in the affected tables.
   * 
   * Example:
   * await m.dropTable('users');
   */
  async down(m) {
    // Write your 'down' logic here (the inverse of 'up')
  },
});
`.trim();
};

export const seederTemplate = () => {
	return `
import { composeSeeder } from '@gaman/db';

/**
 * This seeder file is used to populate your database with initial or sample data.
 * Useful for testing, development setup, or inserting default records.
 */
export default composeSeeder(async () => {
	/**
	 * Add your seed data here.
	 *
	 * Example:
	 * await UserModel.create({
	 *   name: 'Anomali',
	 *   umur: 12,
	 * });
	 *
	 * You can also insert multiple records:
	 *
	 * await UserModel.createMany([
	 *   { name: 'Anomali', umur: 12 },
	 *   { name: 'Budi', umur: 20 },
	 * ]);
	 */
});`.trim();
};
