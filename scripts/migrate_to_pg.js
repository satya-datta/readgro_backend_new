const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// PostgreSQL Connection String
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const schema = `
-- Drop tables if they exist (reverse order of dependencies)
DROP TABLE IF EXISTS withdrawal_requests CASCADE;
DROP TABLE IF EXISTS wallettransactions CASCADE;
DROP TABLE IF EXISTS wallet CASCADE;
DROP TABLE IF EXISTS user_bank_details CASCADE;
DROP TABLE IF EXISTS package_courses CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TABLE IF EXISTS webheroimages CASCADE;
DROP TABLE IF EXISTS pricevalidater CASCADE;
DROP TABLE IF EXISTS emp CASCADE;
DROP TABLE IF EXISTS admin_details CASCADE;

-- Create Tables

CREATE TABLE admin_details (
  id SERIAL PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password VARCHAR(256),
  name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL
);

CREATE TABLE course (
  course_id SERIAL PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  course_description TEXT,
  instructor VARCHAR(255) NOT NULL,
  course_image VARCHAR(255),
  course_price DECIMAL(10,2),
  discount_price DECIMAL(10,2),
  commission DECIMAL(10,2)
);

CREATE TABLE emp (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(20),
  age INTEGER
);

CREATE TABLE packages (
  package_id SERIAL PRIMARY KEY,
  package_name VARCHAR(191) UNIQUE,
  description TEXT,
  package_price DECIMAL(10,2) NOT NULL,
  created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  package_image VARCHAR(255),
  commission INTEGER,
  discount_price VARCHAR(20) -- Kept as varchar to match source, but check if needs to be decimal
);

CREATE TABLE package_courses (
  map_id SERIAL PRIMARY KEY,
  package_id INTEGER NOT NULL REFERENCES packages(package_id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES course(course_id) ON DELETE CASCADE,
  UNIQUE (package_id, course_id)
);

CREATE TABLE pricevalidater (
  price_id SERIAL PRIMARY KEY,
  price INTEGER CHECK (price > 0)
);

CREATE TABLE topics (
  topic_id SERIAL PRIMARY KEY,
  topic_name VARCHAR(255) NOT NULL,
  video_url VARCHAR(2083) NOT NULL,
  course_id INTEGER NOT NULL REFERENCES course(course_id) ON DELETE CASCADE
);

CREATE TABLE "user" (
  UserId SERIAL PRIMARY KEY,
  Name VARCHAR(255) NOT NULL,
  courseid INTEGER, -- Foreign key logic handled manually or added later if needed? Schema had KEY packageId(courseid) 
  Email VARCHAR(191) NOT NULL UNIQUE,
  Phone VARCHAR(15) UNIQUE,
  Avatar VARCHAR(255),
  Address VARCHAR(255),
  Pincode VARCHAR(255),
  GeneratedReferralCode VARCHAR(50) UNIQUE,
  ReferrerId INTEGER REFERENCES "user"(UserId),
  refferCode VARCHAR(50),
  password VARCHAR(255),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet related tables
CREATE TABLE wallet (
  wallet_id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES "user"(UserId),
  balance DECIMAL(10,2) DEFAULT 0.00,
  last_updated TIMESTAMP
);

CREATE TABLE wallettransactions (
  transaction_id SERIAL PRIMARY KEY,
  wallet_id INTEGER REFERENCES wallet(wallet_id),
  amount DECIMAL(10,2),
  transaction_type VARCHAR(20), -- enum in mysql: 'credit','debit'
  description TEXT,
  created_at TIMESTAMP,
  user_id INTEGER REFERENCES "user"(UserId) ON DELETE CASCADE,
  reffer_id INTEGER
);

CREATE TABLE user_bank_details (
  ubdid SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES "user"(UserId),
  account_holder_name VARCHAR(255) NOT NULL,
  ifsc_code VARCHAR(20) NOT NULL,
  account_number VARCHAR(256),
  bank_name VARCHAR(255) NOT NULL,
  upi_id VARCHAR(256),
  contact_id VARCHAR(50),
  fund_account_id VARCHAR(50)
);

CREATE TABLE webheroimages (
  id INTEGER PRIMARY KEY,
  image1 VARCHAR(255),
  image2 VARCHAR(255),
  image3 VARCHAR(255)
);

CREATE TABLE withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(UserId) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- enum: 'pending','approved','rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const parseAndInsertData = async (client) => {
  const dumpFile = path.join(__dirname, '..', 'readgro_dump.sql');
  const sql = fs.readFileSync(dumpFile, 'utf8');

  const lines = sql.split('\n');

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('INSERT INTO')) {
      // Fix table names that might be reserved words or case sensitive
      // In Postgres "user" is reserved and case sensitive if quoted. 
      // MySQL dump uses backticks `user`.

      let pgLine = line.replace(/`/g, '"'); // Replace backticks with double quotes

      // Handle MySQL escape sequences for strings
      // MySQL uses \' for single quote escape. Postgres uses ''.
      // We need to be careful not to double replace.
      // Simple regex replacement might be risky but let's try a safe approach for standard dumps.
      // Standard mysqldump uses \' inside strings.

      // Re-format INSERT INTO `user` to INSERT INTO "user"
      pgLine = pgLine.replace(/INSERT INTO "user"/i, 'INSERT INTO "user"');

      // Basic values transform:
      // Remove inconsistent locking commands if any attached (usually strict imports handle this but we process line by line)

      // Execute
      try {
        // Postgres strictly needs single quotes for values. MySQL dump has single quotes usually.
        // We need to handle \' -> ''
        // This regex looks for \' and replaces with ''
        pgLine = pgLine.replace(/\\'/g, "''");
        pgLine = pgLine.replace(/\\"/g, '"'); // Unescape double quotes if any?

        await client.query(pgLine);
        console.log(`Executed: ${pgLine.substring(0, 50)}...`);
      } catch (err) {
        console.error(`Failed line: ${pgLine.substring(0, 100)}...`);
        console.error(err.message);
      }
    }
  }
};

const resetSequences = async (client) => {
  // Reset sequences to max id
  const tables = [
    { name: 'admin_details', id: 'id' },
    { name: 'course', id: 'course_id' },
    { name: 'emp', id: 'user_id' },
    { name: 'packages', id: 'package_id' },
    { name: 'package_courses', id: 'map_id' },
    { name: 'pricevalidater', id: 'price_id' },
    { name: 'topics', id: 'topic_id' },
    { name: '"user"', id: '"UserId"' }, // Quote case sensitive column/table
    { name: 'wallet', id: 'wallet_id' },
    { name: 'wallettransactions', id: 'transaction_id' },
    { name: 'user_bank_details', id: 'ubdid' },
    { name: 'withdrawal_requests', id: 'id' }
  ];

  for (const t of tables) {
    try {
      // safe query to sync sequence
      const seqQuery = `SELECT setval(pg_get_serial_sequence('${t.name.replace(/"/g, '')}', '${t.id.replace(/"/g, '')}'), COALESCE(MAX(${t.id}), 1) ) FROM ${t.name};`;
      await client.query(seqQuery);
      console.log(`Updated sequence for ${t.name}`);
    } catch (err) {
      console.log(`Could not reset sequence for ${t.name}: ${err.message}`);
    }
  }
};

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('Creating Schema...');
    await client.query(schema);
    console.log('Schema Created.');

    console.log('Inserting Data...');
    await parseAndInsertData(client);
    console.log('Data Inserted.');

    console.log('Resetting Sequences...');
    await resetSequences(client);
    console.log('Sequences Reset.');

    console.log('Migration Complete.');
  } catch (err) {
    console.error('Migration Failed:', err);
  } finally {
    client.release();
    pool.end();
  }
};

migrate();
