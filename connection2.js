const { Pool } = require('pg');
require("dotenv").config();

// Create a new pool using the connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
// Add an error listener to the pool to handle idle client errors
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
// Helper function to get a client from the pool
// This mimics the mysql2 promise wrapper's getConnection() behavior roughly
pool.getConnection = async () => {
  const client = await pool.connect();
  // Add release method alias if needed, but client.release() is standard in pg
  // We can just return the client.
  // However, if the codebase expects `conn.release()`, pg client has `client.release()`.

  // If the codebase uses `conn.execute(sql, params)`, pg client has `client.query(sql, params)`.
  // We might need to monkey-patch or wrap the client if the syntax differs significantly.
  // For now, let's return the raw client and handle syntax changes in controllers.
  return client;
};

module.exports = pool;
