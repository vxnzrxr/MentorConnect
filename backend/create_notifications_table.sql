-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_id INTEGER,
  type TEXT NOT NULL, -- 'session_approved', 'session_rejected', 'session_rescheduled', 'general'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT, -- JSON data for additional information
  read_status INTEGER DEFAULT 0, -- 0 = unread, 1 = read
  dismissed INTEGER DEFAULT 0, -- 0 = active, 1 = dismissed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(read_status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
