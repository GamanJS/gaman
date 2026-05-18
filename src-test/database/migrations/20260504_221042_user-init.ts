import { composeMigration } from '../../../packages/db/src/index';

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
