const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function resetSequences() {
    try {
        const client = await pool.connect();
        console.log("Connected to database...");

        const sequencesToReset = [
            { table: 'admin_details', column: 'id' },
            { table: 'course', column: 'course_id' },
            { table: 'emp', column: 'user_id' },
            { table: 'packages', column: 'package_id' },
            { table: 'package_courses', column: 'map_id' },
            { table: 'pricevalidater', column: 'price_id' },
            { table: 'topics', column: 'topic_id' },
            { table: '"user"', column: 'userid' }, // Quoted table, lowercase column (created unquoted SERIAL)
            { table: 'user_bank_details', column: 'ubdid' },
            { table: 'wallet', column: 'wallet_id' },
            { table: 'wallettransactions', column: 'transaction_id' },
            { table: 'withdrawal_requests', column: 'id' },
            { table: 'webheroimages', column: 'id' }
        ];

        for (const { table, column } of sequencesToReset) {
            try {
                // Query to get the name of the sequence associated with the column
                // This is safer than guessing the sequence name
                const seqQuery = `pg_get_serial_sequence('${table}', '${column.replace(/"/g, '')}')`;
                const seqRes = await client.query(`SELECT ${seqQuery} as seqname`);
                const seqName = seqRes.rows[0].seqname;

                if (seqName) {
                    // Reset the sequence to the Max(id) + 1
                    // COALESCE(MAX(...), 0) + 1 accounts for empty tables
                    const resetQuery = `SELECT setval('${seqName}', COALESCE((SELECT MAX(${column}) FROM ${table}), 0) + 1, false)`;
                    await client.query(resetQuery);
                    console.log(`Reset sequence for ${table}.${column} (${seqName})`);
                } else {
                    console.log(`No sequence found for ${table}.${column}`);
                }
            } catch (err) {
                console.error(`Error resetting sequence for ${table}.${column}:`, err.message);
            }
        }

        console.log("Sequence reset complete.");
        client.release();
        pool.end();
    } catch (err) {
        console.error("Error connecting to database:", err);
        process.exit(1);
    }
}

resetSequences();
