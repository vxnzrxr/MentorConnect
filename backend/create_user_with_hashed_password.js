const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // default XAMPP MySQL user
  password: '', // default XAMPP MySQL password is empty
  database: 'mentorconnect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function createUser(name, email, password, role) {
  try {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role]
    );

    console.log('User created with ID:', result.insertId);
  } catch (err) {
    console.error('Error creating user:', err);
  }
}

async function createUsers() {
  await createUser('Mentee User', 'mentee@example.com', 'mentee123', 'mentee');
  await createUser('Mentor User', 'mentor@example.com', 'mentor123', 'mentor');
  await pool.end();
}

createUsers();
