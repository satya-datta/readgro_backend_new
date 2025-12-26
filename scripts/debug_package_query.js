const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testQuery(course_ids) {
    console.log("Testing with course_ids:", course_ids);

    if (!Array.isArray(course_ids) || course_ids.length === 0) {
        console.log("Invalid input (mimicking controller check):", course_ids);
        return;
    }

    const placeholders = course_ids.map((_, i) => `$${i + 1}`).join(",");
    const query = `SELECT * FROM course WHERE course_id IN (${placeholders})`;

    console.log("Generated Query:", query);

    try {
        const client = await pool.connect();
        const res = await client.query(query, course_ids);
        console.log("Success! Rows:", res.rows.length);
        client.release();
    } catch (err) {
        console.error("Query Failed:", err.message);
        console.error("Error Code:", err.code);
        console.error("Error Position:", err.position);
    }
}

async function run() {
    await testQuery([28]);
    await testQuery(['28']);
    await testQuery([28, 29]);
    await pool.end();
}

run();
