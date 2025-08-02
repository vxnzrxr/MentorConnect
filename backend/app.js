const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db'); // pastikan file db.js meng-export connection/query

const app = express();
const PORT = 5175;

app.use(cors());
app.use(bodyParser.json());

// Function untuk generate role_id unik
async function generateRoleId(role) {
  const prefix = role === 'mentor' ? 'MTR_' : 'MTE_';
  const count = await db.get(`SELECT COUNT(*) as count FROM users WHERE role = ?`, [role]);
  const nextNum = (count.count + 1).toString().padStart(3, '0');
  return prefix + nextNum;
}

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Request body:", req.body);

    if (!name || !email || !password || !role) {
      console.log("Missing fields");
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    // Generate role_id unik
    const roleId = await generateRoleId(role);
    console.log("Generated role_id:", roleId);

    // Insert user dengan role_id
    const insertResult = await db.run(
      'INSERT INTO users (role_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [roleId, name, email, hashedPassword, role]
    );
    console.log("User inserted:", insertResult.lastID);

    // Ambil user baru
    const selectResult = await db.query(
      'SELECT id, role_id, name, email, role, created_at FROM users WHERE id = ?',
      [insertResult.lastID]
    );
    console.log("New user:", selectResult.rows[0]);

    res.status(201).json({ user: selectResult.rows[0] });
  } catch (error) {
    console.error('Register error:', error); // Ini akan menunjukkan error detail
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    // Cari user berdasarkan email
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Cek password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Login sukses, kirim data user tanpa password
    const { password: _, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ambil data dashboard mentee dari database
app.get('/api/mentee-dashboard', async (req, res) => {
  try {
    // Ambil data mentee dari tabel users dengan role='mentee'
    const mentee = await db.get('SELECT * FROM users WHERE email = ? AND role = ?', [req.query.email, 'mentee']);
    if (!mentee) {
      // Jika tidak ada, return empty data
      return res.json({ 
        mentee: { name: 'Mentee', email: req.query.email, role: 'mentee' }, 
        stats: { completedSessions: 0, learningHours: 0, skillsAcquired: 0 }, 
        upcomingSessions: [], 
        sessionHistory: [],
        allSessions: []
      });
    }
    
    // Ambil semua sesi untuk mentee ini
    const allSessions = await db.query(`
      SELECT s.*, 
             u.name as mentor_name, 
             u.profile_picture as mentor_avatar,
             f.rating as feedback_rating,
             f.comment as feedback_comment,
             f.created_at as feedback_date
      FROM sessions s 
      JOIN users u ON s.mentor_id = u.id 
      LEFT JOIN feedback f ON s.id = f.session_id
      WHERE s.mentee_id = ? 
      ORDER BY s.schedule ASC
    `, [mentee.id]);
    
    // Filter sesi berdasarkan status dan waktu untuk upcoming sessions di dashboard
    const now = new Date();
    const upcomingSessions = allSessions.rows
      .filter(session => {
        // Only include sessions that are truly upcoming (not started yet)
        const sessionDate = new Date(session.schedule);
        const hoursDiff = (sessionDate - now) / (1000 * 60 * 60);
        
        // Include sessions that:
        // 1. Have upcoming/open status AND are in the future (more than 0 hours from now)
        // 2. OR are within 2 hours but not yet started (ongoing sessions)
        return (
          (session.status === 'upcoming' || session.status === 'open') && 
          hoursDiff > 0
        );
      })
      .sort((a, b) => new Date(a.schedule) - new Date(b.schedule)) // Sort by nearest first
      .slice(0, 2); // Limit to 2 nearest sessions
    
    // Count completed sessions untuk stats
    const completedSessions = allSessions.rows.filter(s => {
      // Consider session completed if status is 'completed' OR if it's in the past and not cancelled
      if (s.status === 'completed') return true;
      
      // If session is in the past (more than 2 hours ago) and not cancelled, consider it completed
      const sessionDate = new Date(s.schedule);
      const now = new Date();
      const hoursDiff = (sessionDate - now) / (1000 * 60 * 60);
      
      return hoursDiff < -2 && s.status !== 'cancelled' && s.status !== 'rejected';
    });
    
    const completedCount = completedSessions.length;
    
    // Calculate actual learning hours from session duration or assume 2 hours per session
    const learningHours = completedSessions.reduce((total, session) => {
      // If session has duration field, use it; otherwise assume 2 hours
      const sessionHours = session.duration || 2;
      return total + sessionHours;
    }, 0);
    
    // Calculate skills acquired from completed sessions
    const skillsFromSessions = new Set();
    completedSessions.forEach(session => {
      if (session.skills_to_learn) {
        const skills = session.skills_to_learn.split(',');
        skills.forEach(skill => {
          const trimmedSkill = skill.trim();
          if (trimmedSkill) {
            skillsFromSessions.add(trimmedSkill);
          }
        });
      }
    });
    
    const skillsAcquiredCount = skillsFromSessions.size;
    
    res.json({
      mentee: {
        id: mentee.id,
        role_id: mentee.role_id,
        name: mentee.name,
        email: mentee.email,
        role: mentee.role,
        bio: mentee.bio,
        interests: mentee.interests,
        avatar: mentee.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentee.name)}`
      },
      stats: {
        completedSessions: completedCount,
        learningHours: learningHours,
        skillsAcquired: skillsAcquiredCount
      },
      upcomingSessions: upcomingSessions || [],
      sessionHistory: allSessions.rows || [],
      allSessions: allSessions.rows || []
    });
  } catch (error) {
    console.error('Error in mentee-dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ambil data dashboard mentor dari database
app.get('/api/mentor-dashboard', async (req, res) => {
  try {
    const mentor = await db.get('SELECT * FROM users WHERE email = ?', [req.query.email]);
    if (!mentor) {
      return res.json({ mentor: {}, stats: {}, upcomingSessions: [], sessionHistory: [], recentFeedback: [] });
    }
    
    // Ambil semua sesi yang dibuat mentor (semua status untuk mendapatkan data lengkap)
    const allSessions = await db.query(`
      SELECT s.*, 
             u.name as mentee_name, 
             u.profile_picture as mentee_avatar,
             f.rating as feedback_rating,
             f.comment as feedback_comment,
             f.created_at as feedback_date
      FROM sessions s
      LEFT JOIN users u ON s.mentee_id = u.id
      LEFT JOIN feedback f ON s.id = f.session_id
      WHERE s.mentor_id = ?
      ORDER BY s.schedule ASC
    `, [mentor.id]);
    
    const now = new Date();
    
    // Filter untuk upcoming sessions (belum dimulai)
    const upcomingSessions = allSessions.rows.filter(session => {
      const sessionDate = new Date(session.schedule);
      const hoursDiff = (sessionDate - now) / (1000 * 60 * 60);
      return (
        (session.status === 'upcoming' || session.status === 'open') && 
        hoursDiff > 0
      );
    });
    
    // Filter untuk completed sessions (untuk stats)
    const completedSessions = allSessions.rows.filter(session => {
      if (session.status === 'completed') return true;
      
      // Jika session sudah lewat lebih dari 2 jam dan tidak dibatalkan, dianggap selesai
      const sessionDate = new Date(session.schedule);
      const hoursDiff = (sessionDate - now) / (1000 * 60 * 60);
      
      return hoursDiff < -2 && session.status !== 'cancelled' && session.status !== 'rejected';
    });
    
    // Ambil feedback terbaru
    const feedbacks = await db.query('SELECT * FROM feedback WHERE mentor_id = ? ORDER BY created_at DESC LIMIT 5', [mentor.id]);
    
    res.json({
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        bio: mentor.bio,
        skills: mentor.skills,
        avatar: mentor.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}`
      },
      stats: {
        totalSessions: completedSessions.length, // Hanya session yang sudah selesai
        activeMentees: await db.get('SELECT COUNT(DISTINCT mentee_id) as count FROM sessions WHERE mentor_id = ? AND mentee_id IS NOT NULL', [mentor.id]).then(r => r.count),
        averageRating: await db.get('SELECT AVG(rating) as avg FROM feedback WHERE mentor_id = ?', [mentor.id]).then(r => r.avg || 0)
      },
      upcomingSessions: upcomingSessions,
      sessionHistory: completedSessions, // Kirim session history yang sudah completed
      recentFeedback: feedbacks.rows
    });
  } catch (error) {
    console.error('Error in mentor-dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/mentor/profile', async (req, res) => {
  try {
    const { name, expertise, experience, bio, email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email wajib diisi' });
    }
    await db.run(
      'UPDATE users SET name = ?, expertise = ?, experience = ?, bio = ? WHERE email = ?',
      [name, expertise, experience, bio, email]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile user (mentor/mentee)
app.put('/api/profile', async (req, res) => {
  try {
    const { email, role, name, bio, skills, interests, profile_picture } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email dan role wajib diisi' });
    }
    await db.run(
      'UPDATE users SET name = ?, bio = ?, skills = ?, interests = ?, profile_picture = ? WHERE email = ? AND role = ?',
      [name, bio, skills, interests, profile_picture, email, role]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk membuat sesi baru
app.post('/api/sessions', async (req, res) => {
  try {
    const { mentor_id, mentee_id, topic, description, schedule, zoom_link, material_link, skills_to_learn } = req.body;
    console.log('Creating new session:', { mentor_id, mentee_id, topic, description, schedule, zoom_link, material_link, skills_to_learn });
    
    if (!mentor_id || !topic || !schedule) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    let result;
    if (!mentee_id || mentee_id === '') {
      // Sesi open/available (belum ada mentee) - ini akan muncul di daftar program mentee
      console.log('Creating open session for mentee registration');
      result = await db.run(
        'INSERT INTO sessions (mentor_id, topic, description, schedule, status, zoom_link, material_link, skills_to_learn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [mentor_id, topic, description, schedule, 'open', zoom_link || null, material_link || null, skills_to_learn || null]
      );
    } else {
      // Sesi langsung dengan mentee spesifik
      console.log('Creating direct session with specific mentee');
      result = await db.run(
        'INSERT INTO sessions (mentor_id, mentee_id, topic, description, schedule, status, zoom_link, material_link, skills_to_learn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [mentor_id, mentee_id, topic, description, schedule, 'upcoming', zoom_link || null, material_link || null, skills_to_learn || null]
      );
    }
    
    console.log('Session created with ID:', result.lastID);
    res.status(201).json({ session_id: result.lastID, success: true });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk mengambil data profile user (mentor/mentee)
app.get('/api/profile', async (req, res) => {
  try {
    const { email, role } = req.query;
    if (!email || !role) return res.status(400).json({ error: 'Email dan role wajib diisi' });
    const user = await db.get('SELECT id, role_id, name, email, role, bio, skills, interests, profile_picture FROM users WHERE email = ? AND role = ?', [email, role]);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk update profile user (mentor/mentee)
app.put('/api/profile', async (req, res) => {
  try {
    const { email, role, name, bio, skills, interests, profile_picture } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email dan role wajib diisi' });
    }
    
    // Update berdasarkan email dan role untuk memastikan tidak tercampur
    const result = await db.run(
      'UPDATE users SET name = ?, bio = ?, skills = ?, interests = ?, profile_picture = ? WHERE email = ? AND role = ?',
      [name, bio, skills, interests, profile_picture, email, role]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan atau tidak ada perubahan' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk mengambil semua program/sesi yang tersedia (status open/available)
app.get('/api/programs', async (req, res) => {
  try {
    console.log('Fetching programs...');
    // Ambil semua sesi yang tersedia untuk mentee (belum ada mentee yang mendaftar)
    const sessions = await db.query(`
      SELECT s.*, 
             u.name as mentor_name, 
             u.skills as mentor_expertise, 
             u.profile_picture as mentor_avatar,
             u.bio as mentor_bio,
             mentee.name as mentee_name
      FROM sessions s
      JOIN users u ON s.mentor_id = u.id
      LEFT JOIN users mentee ON s.mentee_id = mentee.id
      WHERE s.mentee_id IS NULL OR s.mentee_id = ''
      ORDER BY s.schedule ASC
    `);
    
    console.log('Found sessions:', sessions.rows.length);
    
    // Format data untuk frontend
    const programs = sessions.rows.map(session => ({
      ...session,
      is_available: true,
      total_slots: 1,
      available_slots: 1,
      schedule_formatted: new Date(session.schedule).toLocaleString('id-ID')
    }));
    
    res.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk menghapus sesi
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM sessions WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint mentee mendaftar ke sesi program
app.post('/api/sessions/:id/register', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { mentee_email } = req.body;
    if (!mentee_email) return res.status(400).json({ error: 'Email mentee wajib diisi' });
    // Cari mentee
    const mentee = await db.get('SELECT id FROM users WHERE email = ?', [mentee_email]);
    if (!mentee) return res.status(404).json({ error: 'Mentee tidak ditemukan' });
    // Cek apakah sesi sudah ada mentee
    const session = await db.get('SELECT mentee_id FROM sessions WHERE id = ?', [sessionId]);
    if (!session) return res.status(404).json({ error: 'Sesi tidak ditemukan' });
    if (session.mentee_id) return res.status(409).json({ error: 'Sesi sudah diikuti oleh mentee lain' });
    // Cek apakah mentee sudah pernah mendaftar sesi ini
    // (Karena 1 sesi hanya bisa diikuti 1 mentee, cukup cek mentee_id)
    await db.run('UPDATE sessions SET mentee_id = ?, status = "upcoming" WHERE id = ?', [mentee.id, sessionId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk submit feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { session_id, mentee_id, mentor_id, rating, comment } = req.body;
    
    if (!session_id || !mentee_id || !mentor_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if feedback already exists
    const existing = await db.get('SELECT id FROM feedback WHERE session_id = ? AND mentee_id = ?', [session_id, mentee_id]);
    
    if (existing) {
      // Update existing feedback
      await db.run(
        'UPDATE feedback SET rating = ?, comment = ?, created_at = CURRENT_TIMESTAMP WHERE session_id = ? AND mentee_id = ?',
        [rating, comment, session_id, mentee_id]
      );
    } else {
      // Insert new feedback
      await db.run(
        'INSERT INTO feedback (session_id, mentee_id, mentor_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [session_id, mentee_id, mentor_id, rating, comment]
      );
    }
    
    // Update session status to completed if not already
    await db.run('UPDATE sessions SET status = "completed" WHERE id = ?', [session_id]);
    
    // Otomatis tambah skills ke mentee setelah submit feedback
    try {
      // Get session details dan skills
      const session = await db.query('SELECT skills_to_learn FROM sessions WHERE id = ?', [session_id]);
      if (session.rows.length && session.rows[0].skills_to_learn) {
        const skillsToLearn = session.rows[0].skills_to_learn;
        const skillsArray = skillsToLearn.split(',').map(skill => skill.trim()).filter(skill => skill);
        
        // Add each skill to mentee_skills table
        for (const skill of skillsArray) {
          // Check if skill already exists for this mentee from this session
          const existing = await db.query(
            'SELECT id FROM mentee_skills WHERE mentee_id = ? AND skill_name = ? AND acquired_from_session_id = ?',
            [mentee_id, skill, session_id]
          );
          
          if (!existing.rows.length) {
            await db.run(
              'INSERT INTO mentee_skills (mentee_id, skill_name, acquired_from_session_id) VALUES (?, ?, ?)',
              [mentee_id, skill, session_id]
            );
          }
        }
        console.log(`Added ${skillsArray.length} skills to mentee ${mentee_id} learning progress`);
      }
    } catch (skillError) {
      console.error('Error adding skills to mentee:', skillError);
      // Don't fail the feedback submission if skill addition fails
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk mendapatkan daftar mentee
app.get('/api/mentees', async (req, res) => {
  try {
    const mentees = await db.query('SELECT id, name, email, bio FROM users WHERE role = "mentee" ORDER BY name ASC');
    res.json({ mentees: mentees.rows || [] });
  } catch (error) {
    console.error('Error fetching mentees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk mendapatkan learning progress mentee
app.get('/api/mentee-skills/:mentee_id', async (req, res) => {
  try {
    const { mentee_id } = req.params;
    const skills = await db.query(`
      SELECT ms.*, s.topic as session_topic, s.schedule as session_date
      FROM mentee_skills ms
      LEFT JOIN sessions s ON ms.acquired_from_session_id = s.id
      WHERE ms.mentee_id = ?
      ORDER BY ms.acquired_date DESC
    `, [mentee_id]);
    
    res.json({ skills: skills.rows || [] });
  } catch (error) {
    console.error('Error fetching mentee skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint untuk menambah skill ke mentee (otomatis dipanggil saat session completed)
app.post('/api/mentee-skills', async (req, res) => {
  try {
    const { mentee_id, session_id } = req.body;
    
    // Get session details dan skills
    const session = await db.query('SELECT skills_to_learn FROM sessions WHERE id = ?', [session_id]);
    if (!session.rows.length || !session.rows[0].skills_to_learn) {
      return res.json({ success: true, message: 'No skills to add' });
    }
    
    const skillsToLearn = session.rows[0].skills_to_learn;
    const skillsArray = skillsToLearn.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    // Add each skill to mentee_skills table
    for (const skill of skillsArray) {
      // Check if skill already exists for this mentee from this session
      const existing = await db.query(
        'SELECT id FROM mentee_skills WHERE mentee_id = ? AND skill_name = ? AND acquired_from_session_id = ?',
        [mentee_id, skill, session_id]
      );
      
      if (!existing.rows.length) {
        await db.run(
          'INSERT INTO mentee_skills (mentee_id, skill_name, acquired_from_session_id) VALUES (?, ?, ?)',
          [mentee_id, skill, session_id]
        );
      }
    }
    
    res.json({ success: true, skillsAdded: skillsArray.length });
  } catch (error) {
    console.error('Error adding mentee skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// API endpoint untuk mendapatkan daftar semua mentor dengan rating
app.get('/api/mentors', async (req, res) => {
  try {
    const mentors = await db.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.bio,
        u.skills,
        u.profile_picture,
        ROUND(AVG(f.rating), 1) as average_rating,
        COUNT(f.id) as feedback_count,
        COUNT(DISTINCT s.id) as completed_sessions,
        COUNT(DISTINCT s.mentee_id) as total_mentees
      FROM users u
      LEFT JOIN sessions s ON u.id = s.mentor_id AND s.status = 'completed'
      LEFT JOIN feedback f ON s.id = f.session_id
      WHERE u.role = 'mentor'
      GROUP BY u.id, u.name, u.email, u.bio, u.skills, u.profile_picture
      ORDER BY average_rating DESC, u.name ASC
    `);
    
    res.json({ success: true, mentors: mentors.rows });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk mendapatkan detail profil mentor
app.get('/api/mentor-profile/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    // Get mentor basic info
    const mentor = await db.get(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.bio,
        u.skills,
        u.profile_picture,
        ROUND(AVG(f.rating), 1) as average_rating,
        COUNT(f.id) as feedback_count,
        COUNT(DISTINCT CASE WHEN s.status = 'completed' THEN s.id END) as completed_sessions,
        COUNT(DISTINCT s.mentee_id) as total_mentees
      FROM users u
      LEFT JOIN sessions s ON u.id = s.mentor_id
      LEFT JOIN feedback f ON s.id = f.session_id
      WHERE u.id = ? AND u.role = 'mentor'
      GROUP BY u.id
    `, [mentorId]);
    
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    // Get recent feedback
    const recentFeedback = await db.query(`
      SELECT 
        f.rating,
        f.comment,
        f.created_at,
        u.name as mentee_name
      FROM feedback f
      JOIN sessions s ON f.session_id = s.id
      JOIN users u ON f.mentee_id = u.id
      WHERE s.mentor_id = ?
      ORDER BY f.created_at DESC
      LIMIT 5
    `, [mentorId]);
    
    mentor.recent_feedback = recentFeedback.rows;
    
    res.json({ success: true, mentor });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk membuat session request (pengajuan sesi)
app.post('/api/session-requests', async (req, res) => {
  try {
    const { 
      mentor_id, 
      mentee_email, 
      topic, 
      description, 
      schedule, 
      skills_to_learn, 
      message, 
      status = 'pending' 
    } = req.body;
    
    // Get mentee by email
    const mentee = await db.get('SELECT id FROM users WHERE email = ? AND role = ?', [mentee_email, 'mentee']);
    if (!mentee) {
      return res.status(400).json({ error: 'Mentee not found' });
    }
    
    // Create session request (stored in sessions table with status 'pending')
    const result = await db.run(`
      INSERT INTO sessions 
      (mentor_id, mentee_id, topic, description, schedule, status, skills_to_learn)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [mentor_id, mentee.id, topic, description, schedule, 'pending', skills_to_learn || null]);
    
    // If there's a message, we could store it in a separate messages table
    // For now, we'll include it in the description
    if (message) {
      await db.run(`
        UPDATE sessions 
        SET description = description || ? 
        WHERE id = ?
      `, [`\n\nMessage from mentee: ${message}`, result.lastID]);
    }
    
    res.json({ success: true, sessionId: result.lastID });
  } catch (error) {
    console.error('Error creating session request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk mendapatkan session requests untuk mentor
app.get('/api/mentor/:mentorId/session-requests', async (req, res) => {
  try {
    const { mentorId } = req.params;
    
    const requests = await db.query(`
      SELECT 
        s.id,
        s.topic,
        s.description,
        s.schedule,
        s.skills_to_learn,
        s.zoom_link,
        s.material_link,
        s.status,
        s.created_at,
        u.name as mentee_name,
        u.email as mentee_email,
        u.profile_picture as mentee_avatar
      FROM sessions s
      JOIN users u ON s.mentee_id = u.id
      WHERE s.mentor_id = ? AND s.status = 'pending'
      ORDER BY s.created_at DESC
    `, [mentorId]);
    
    res.json({ success: true, requests: requests.rows });
  } catch (error) {
    console.error('Error fetching session requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk approve/reject session request
app.post('/api/session-requests/:sessionId/respond', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { action, schedule, reject_reason, zoom_link, material_link } = req.body; // action: 'approve' | 'reject', schedule for reschedule, reject_reason for rejection
    
    // Get session details first
    const session = await db.get(`
      SELECT s.*, u.name as mentee_name, m.name as mentor_name
      FROM sessions s
      JOIN users u ON s.mentee_id = u.id
      JOIN users m ON s.mentor_id = m.id
      WHERE s.id = ?
    `, [sessionId]);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    let newStatus;
    let newSchedule = null;
    let notificationType;
    let notificationTitle;
    let notificationMessage;
    let notificationData = {};
    
    if (action === 'approve') {
      newStatus = 'upcoming';
      newSchedule = schedule || session.schedule;
      
      // Check if it's a reschedule (new schedule different from original)
      const isReschedule = schedule && schedule !== session.schedule;
      
      if (isReschedule) {
        notificationType = 'session_rescheduled';
        notificationTitle = 'Session Rescheduled';
        notificationMessage = `Your session "${session.topic}" has been approved with a new schedule`;
        notificationData = {
          originalSchedule: session.schedule,
          newSchedule: schedule,
          mentorName: session.mentor_name,
          zoomLink: zoom_link,
          materialLink: material_link
        };
      } else {
        notificationType = 'session_approved';
        notificationTitle = 'Session Approved';
        notificationMessage = `Your session "${session.topic}" has been approved by ${session.mentor_name}`;
        notificationData = {
          schedule: session.schedule,
          mentorName: session.mentor_name,
          zoomLink: zoom_link,
          materialLink: material_link
        };
      }
    } else if (action === 'reject') {
      newStatus = 'rejected';
      notificationType = 'session_rejected';
      notificationTitle = 'Session Request Rejected';
      notificationMessage = `Your session request "${session.topic}" has been declined`;
      notificationData = {
        rejectReason: reject_reason,
        originalSchedule: session.schedule,
        mentorName: session.mentor_name
      };
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    // Update session status
    if (action === 'reject' && reject_reason) {
      await db.run(`
        UPDATE sessions 
        SET status = ?, reject_reason = ? 
        WHERE id = ?
      `, [newStatus, reject_reason, sessionId]);
    } else if (newSchedule && newSchedule !== session.schedule) {
      // Reschedule with approval - update schedule and optionally zoom/material links
      const updateQuery = `
        UPDATE sessions 
        SET status = ?, schedule = ?${zoom_link !== undefined ? ', zoom_link = ?' : ''}${material_link !== undefined ? ', material_link = ?' : ''}
        WHERE id = ?
      `;
      const updateParams = [newStatus, newSchedule];
      if (zoom_link !== undefined) updateParams.push(zoom_link);
      if (material_link !== undefined) updateParams.push(material_link);
      updateParams.push(sessionId);
      
      await db.run(updateQuery, updateParams);
    } else {
      // Regular approval - optionally update zoom/material links
      const updateQuery = `
        UPDATE sessions 
        SET status = ?${zoom_link !== undefined ? ', zoom_link = ?' : ''}${material_link !== undefined ? ', material_link = ?' : ''}
        WHERE id = ?
      `;
      const updateParams = [newStatus];
      if (zoom_link !== undefined) updateParams.push(zoom_link);
      if (material_link !== undefined) updateParams.push(material_link);
      updateParams.push(sessionId);
      
      await db.run(updateQuery, updateParams);
    }
    
    // Create notification for mentee
    await db.run(`
      INSERT INTO notifications (user_id, session_id, type, title, message, data)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [session.mentee_id, sessionId, notificationType, notificationTitle, notificationMessage, JSON.stringify(notificationData)]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error responding to session request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk mendapatkan rejected sessions untuk mentee
app.get('/api/mentee/:menteeId/rejected-sessions', async (req, res) => {
  try {
    const { menteeId } = req.params;
    
    const rejectedSessions = await db.query(`
      SELECT 
        s.id,
        s.topic,
        s.description,
        s.schedule,
        s.reject_reason,
        s.created_at,
        u.name as mentor_name,
        u.profile_picture as mentor_avatar
      FROM sessions s
      JOIN users u ON s.mentor_id = u.id
      WHERE s.mentee_id = ? AND s.status = 'rejected'
      ORDER BY s.created_at DESC
    `, [menteeId]);
    
    res.json({ success: true, rejectedSessions: rejectedSessions.rows });
  } catch (error) {
    console.error('Error fetching rejected sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk mendapatkan notifications mentee
app.get('/api/mentee/:menteeId/notifications', async (req, res) => {
  try {
    const { menteeId } = req.params;
    const { type } = req.query; // optional filter by type
    
    let query = `
      SELECT n.*, s.topic as session_topic
      FROM notifications n
      LEFT JOIN sessions s ON n.session_id = s.id
      WHERE n.user_id = ? AND n.dismissed = 0
    `;
    const params = [menteeId];
    
    if (type) {
      query += ' AND n.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY n.created_at DESC';
    
    const notifications = await db.query(query, params);
    
    // Parse JSON data for each notification
    const parsedNotifications = notifications.rows.map(notification => ({
      ...notification,
      data: notification.data ? JSON.parse(notification.data) : {}
    }));
    
    res.json({ success: true, notifications: parsedNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await db.run(`
      UPDATE notifications 
      SET read_status = 1 
      WHERE id = ?
    `, [notificationId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk dismiss notification
app.put('/api/notifications/:notificationId/dismiss', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await db.run(`
      UPDATE notifications 
      SET dismissed = 1 
      WHERE id = ?
    `, [notificationId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint untuk get notification count
app.get('/api/mentee/:menteeId/notifications/count', async (req, res) => {
  try {
    const { menteeId } = req.params;
    
    const result = await db.get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN read_status = 0 THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN type = 'session_rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN type = 'session_approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN type = 'session_rescheduled' THEN 1 ELSE 0 END) as rescheduled
      FROM notifications 
      WHERE user_id = ? AND dismissed = 0
    `, [menteeId]);
    
    res.json({ success: true, count: result });
  } catch (error) {
    console.error('Error fetching notification count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
