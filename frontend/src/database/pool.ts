
/**
 * Initializes and exports a PostgreSQL connection pool using the `pg` library.
 * The pool is configured with the connection string provided in the `DATABASE_URL`
 * environment variable. This module provides a shared database connection pool
 * for use throughout the application.
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
