require('dotenv').config();
const db = require('./db');

console.log('Starting database connection test...');

async function testConnection() {
  try {
    const res = await db.query('SELECT datetime("now") as current_time');
    console.log('Database connection successful:', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

testConnection().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
