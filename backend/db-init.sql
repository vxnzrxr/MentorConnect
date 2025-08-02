-- SQLite users table schema for MentorConnect

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id TEXT UNIQUE NOT NULL, -- Format: MTE_001 untuk mentee, MTR_001 untuk mentor
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tambahan kolom untuk profil user
-- ALTER TABLE users ADD COLUMN bio TEXT;
-- ALTER TABLE users ADD COLUMN skills TEXT; -- untuk mentor, comma separated
-- ALTER TABLE users ADD COLUMN interests TEXT; -- untuk mentee, comma separated
-- ALTER TABLE users ADD COLUMN profile_picture TEXT;

-- Tabel sesi mentoring
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentor_id INTEGER NOT NULL,
  mentee_id INTEGER NOT NULL,
  topic TEXT NOT NULL,
  description TEXT,
  schedule DATETIME NOT NULL,
  status TEXT DEFAULT 'upcoming',
  feedback_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mentor_id) REFERENCES users(id),
  FOREIGN KEY (mentee_id) REFERENCES users(id)
);

-- Tabel feedback
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  mentee_id INTEGER NOT NULL,
  mentor_id INTEGER NOT NULL,
  rating INTEGER,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (mentee_id) REFERENCES users(id),
  FOREIGN KEY (mentor_id) REFERENCES users(id)
);

-- Tabel mentees (data profil mentee terpisah)
CREATE TABLE IF NOT EXISTS mentees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_id TEXT UNIQUE NOT NULL, -- Format: MTE_001, MTE_002, etc
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  interests TEXT,
  profile_picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  interests TEXT,
  profile_picture TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
