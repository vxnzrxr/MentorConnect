#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up MentorConnect database...');

// Create database file if it doesn't exist
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Read SQL schema
const schemaSQL = fs.readFileSync(path.join(__dirname, 'db-init.sql'), 'utf8');

// Execute schema
db.exec(schemaSQL, async (err) => {
  if (err) {
    console.error('❌ Error creating schema:', err);
    process.exit(1);
  }
  
  console.log('✅ Database schema created successfully');
  
  // Check if users already exist
  db.get("SELECT COUNT(*) as count FROM users", async (err, row) => {
    if (err) {
      console.error('❌ Error checking users:', err);
      process.exit(1);
    }
    
    if (row.count > 0) {
      console.log('✅ Database already has users. Setup complete!');
      console.log('📝 You can now start the server with: npm start');
      db.close();
      return;
    }
    
    console.log('📝 Creating sample users...');
    
    // Create sample users
    const users = [
      {
        role_id: 'MTE_001',
        name: 'Sarah Mentee',
        email: 'mentee@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'mentee'
      },
      {
        role_id: 'MTR_001', 
        name: 'John Mentor',
        email: 'mentor@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'mentor'
      },
      {
        role_id: 'MTE_002',
        name: 'Demo Mentee',
        email: 'demo.mentee@example.com', 
        password: await bcrypt.hash('demo123', 10),
        role: 'mentee'
      },
      {
        role_id: 'MTR_002',
        name: 'Demo Mentor',
        email: 'demo.mentor@example.com',
        password: await bcrypt.hash('demo123', 10), 
        role: 'mentor'
      }
    ];
    
    const stmt = db.prepare(`
      INSERT INTO users (role_id, name, email, password, role) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    let created = 0;
    for (const user of users) {
      stmt.run(user.role_id, user.name, user.email, user.password, user.role, (err) => {
        if (err) {
          console.error('❌ Error creating user:', err);
        } else {
          created++;
          console.log(`✅ Created user: ${user.name} (${user.email})`);
        }
        
        if (created === users.length) {
          stmt.finalize();
          
          console.log('\n🎉 Database setup complete!');
          console.log('\n📋 Sample Login Credentials:');
          console.log('  Mentee: mentee@example.com / password123');
          console.log('  Mentor: mentor@example.com / password123');
          console.log('  Demo Mentee: demo.mentee@example.com / demo123'); 
          console.log('  Demo Mentor: demo.mentor@example.com / demo123');
          console.log('\n🚀 You can now start the server with: npm start');
          
          db.close();
        }
      });
    }
  });
});
