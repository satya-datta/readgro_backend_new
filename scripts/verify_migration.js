const axios = require('axios');
const connection = require('../backend');

const API_URL = 'http://localhost:5000';

async function verifyMigration() {
    console.log('Verifying Migration Results...');
    try {
        const client = await connection.connect(); // Get client from pool

        const tables = ['"user"', 'course', 'packages', 'admin_details'];

        for (const table of tables) {
            const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
            console.log(`Table ${table}: ${res.rows[0].count} rows`);
        }

        client.release();
        console.log('Migration verification complete.');
    } catch (error) {
        console.error('Migration verification failed:', error);
    }
}

async function verifyEndpoints() {
    console.log('\nVerifying API Endpoints...');

    try {
        // 1. Get All Courses
        console.log('Testing GET /getallcourses...');
        const coursesRes = await axios.get(`${API_URL}/getallcourses`);
        if (coursesRes.status === 200) {
            console.log(`[PASS] /getallcourses returned ${coursesRes.data.length} courses`);
        } else {
            console.log(`[FAIL] /getallcourses status: ${coursesRes.status}`);
        }

        // 2. Get All Packages
        console.log('Testing GET /getallpackages...');
        const packagesRes = await axios.get(`${API_URL}/getallpackages`);
        if (packagesRes.status === 200) {
            console.log(`[PASS] /getallpackages returned ${packagesRes.data.length} packages`);
        } else {
            console.log(`[FAIL] /getallpackages status: ${packagesRes.status}`);
        }

        // 3. Test Admin Login (using seeded data if available, otherwise just checking if route exists/handles bad aut)
        // We can't easily test login without credentials, but we can try with bad creds to valid server is responding
        console.log('Testing Admin Login with dummy creds...');
        try {
            await axios.post(`${API_URL}/adminlogin`, { email: 'wrong@example.com', password: 'wrong' });
        } catch (err) {
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 404 || err.response.status === 400) {
                    console.log(`[PASS] /adminlogin responded correctly to invalid creds: ${err.response.status}`);
                } else {
                    console.log(`[FAIL] /adminlogin unexpected status: ${err.response.status}`);
                }
            } else {
                console.error('[FAIL] /adminlogin error:', err.message);
            }
        }

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('[FAIL] API Server is not running. Please start the server with `node index.js` first.');
        } else {
            console.error('Endpoint verification error:', error.message);
        }
    } finally {
        process.exit();
    }
}

// verifyMigration().then(verifyEndpoints);
// Note: We can only run endpoints if server is running. 
// For now, let's just run migration verification directly via DB since we can't spin up server in background reliably in this env without blocking.
verifyMigration();
