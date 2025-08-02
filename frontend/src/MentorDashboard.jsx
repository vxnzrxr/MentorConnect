import React, { useEffect, useState, useCallback } from 'react';
import MentorProfile from './MentorProfile';
import SessionRequests from './SessionRequests';
import MentorSidebar from './MentorSidebar';

function MentorDashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionsTab, setSessionsTab] = useState('daftar');
  const [historyTab, setHistoryTab] = useState('upcoming');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isValidAccess, setIsValidAccess] = useState(true);
  const [accessMessage, setAccessMessage] = useState('');
  const [mentees, setMentees] = useState([]);

  // Refetch dashboard data (for profile update refresh)
  const fetchDashboardData = useCallback(() => {
    const email = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    
    // Pastikan user adalah mentor
    if (!email || userRole !== 'mentor') {
      console.error('Invalid mentor session');
      setIsValidAccess(false);
      setAccessMessage('Anda tidak memiliki akses ke dashboard mentor. Silakan login sebagai mentor.');
      return;
    }
    
    setIsValidAccess(true);
    fetch(`http://localhost:5175/api/mentor-dashboard?email=${email}`)
      .then(res => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Fetch list of mentees
    fetch('http://localhost:5175/api/mentees')
      .then(res => res.json())
      .then(result => setMentees(result.mentees || []))
      .catch(err => console.error('Error fetching mentees:', err));
  }, [fetchDashboardData]);

  // Handler submit sesi baru
  const handleCreateSession = async (e) => {
    e.preventDefault();
    const form = e.target;
    const topic = form.topic.value;
    const description = form.description.value;
    const date = form.date.value;
    const time = form.time.value;
    const schedule = `${date} ${time}`;
    const mentor_id = data.mentor.id;
    const mentee_id = form.mentee_id.value;
    const zoom_link = form.zoom_link.value;
    const material_link = form.material_link.value;
    const skills_to_learn = form.skills_to_learn.value;
    
    const payload = { mentor_id, topic, description, schedule };
    if (mentee_id) payload.mentee_id = mentee_id;
    if (zoom_link) payload.zoom_link = zoom_link;
    if (material_link) payload.material_link = material_link;
    if (skills_to_learn) payload.skills_to_learn = skills_to_learn;
    
    try {
      const response = await fetch('http://localhost:5175/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      
      if (response.ok) {
        alert('Program berhasil dibuat dan akan muncul di daftar program mentee!');
        setShowSessionModal(false);
        form.reset();
        // Refresh data
        fetchDashboardData();
      } else {
        alert(result.error || 'Gagal membuat program');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat membuat program');
    }
  };

  function getSessionStatus(session) {
    if (!session.schedule) return session.status || 'Upcoming';
    const now = new Date();
    const start = new Date(session.schedule.replace(' ', 'T'));
    const end = session.end_schedule ? new Date(session.end_schedule.replace(' ', 'T')) : null;
    if (end && now >= start && now <= end) {
      return 'Sedang Berjalan';
    }
    if (now > (end || start)) {
      return 'Selesai';
    }
    return session.status || 'Upcoming';
  }

  // Jika akses tidak valid, tampilkan pesan error
  if (!isValidAccess) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded max-w-md">
          <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
          <p>{accessMessage}</p>
          <button 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout dan Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20">Memuat...</div>;

  // Filter sessions: upcomingSessions hanya yang belum selesai, sessionHistory yang sudah selesai
  const upcomingSessions = (data.upcomingSessions || []).filter(session => getSessionStatus(session) !== 'Selesai');
  const sessionHistory = [
    ...(data.sessionHistory || []),
    ...(data.upcomingSessions || []).filter(session => getSessionStatus(session) === 'Selesai')
  ];

  // Helper function untuk kategorisasi sessions untuk history tabs
  const getSessionStatusForHistory = (session) => {
    if (!session.schedule) return 'upcoming';
    
    const now = new Date();
    const sessionDate = new Date(session.schedule);
    const hoursDiff = (sessionDate - now) / (1000 * 60 * 60);
    
    // If session is marked as completed in database
    if (session.status === 'completed') return 'completed';
    
    // If session is in the past (more than 2 hours ago), consider it completed
    if (hoursDiff < -2) return 'completed';
    
    // If session is within 2 hours (before or after), consider it ongoing
    if (hoursDiff >= -2 && hoursDiff <= 2) return 'ongoing';
    
    // If session is in the future, it's upcoming
    return 'upcoming';
  };

  // Kategorisasi semua sessions untuk history tabs
  const allSessions = [...upcomingSessions, ...sessionHistory];
  const upcomingHistorySessions = allSessions.filter(s => getSessionStatusForHistory(s) === 'upcoming');
  const ongoingHistorySessions = allSessions.filter(s => getSessionStatusForHistory(s) === 'ongoing');
  const completedHistorySessions = allSessions.filter(s => getSessionStatusForHistory(s) === 'completed');

  // Get only the next 2 upcoming sessions yang benar-benar upcoming (tidak sedang berlangsung)
  // dan memiliki mentee (sessions dengan program)
  const nextUpcomingSessions = upcomingSessions
    .filter(session => {
      const status = getSessionStatus(session);
      return status === 'Upcoming' || status === 'Confirmed';
    })
    .filter(session => session.mentee_id) // Hanya session yang sudah ada mentee (bukan program kosong)
    .sort((a, b) => {
      // Sort berdasarkan waktu terdekat
      if (!a.schedule) return 1;
      if (!b.schedule) return -1;
      return new Date(a.schedule.replace(' ', 'T')) - new Date(b.schedule.replace(' ', 'T'));
    })
    .slice(0, 2); // Ambil hanya 2 sesi terdekat

  // Helper to format date/time for history tabs
  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Helper for countdown
  const getCountdown = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `${diff} hari lagi`;
    if (diff === 0) return 'Hari ini';
    return 'Sudah lewat';
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <MentorSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        sessionsTab={sessionsTab}
        setSessionsTab={setSessionsTab}
        mentor={data.mentor}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64 ml-0' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto py-6 px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="px-4 py-4 sm:px-0">
              <h1 className="text-3xl font-bold text-gray-900">Selamat datang kembali, {data.mentor?.name || 'Mentor'}!</h1>
              <p className="mt-2 text-gray-600">Berikut adalah yang terjadi dengan sesi mentoring Anda.</p>
            </div>

            {/* Stats Section */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Sessions */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-calendar text-primary text-3xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Sesi</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{data.stats.totalSessions}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm text-gray-500">
                    Sesi mentoring yang telah selesai
                  </div>
                </div>
              </div>
              {/* Available Programs for Mentees */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-calendar-plus text-green-500 text-3xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Program Tersedia</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{upcomingSessions.length}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm text-gray-500">
                    Total program yang akan berlangsung
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    <div className="flex justify-between">
                      <span>• Program terbuka: {upcomingSessions.filter(s => !s.mentee_id).length}</span>
                      <span>• Dengan mentee: {upcomingSessions.filter(s => s.mentee_id).length}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Active Mentees */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-users text-secondary text-3xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Mentees</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{data.stats.activeMentees}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              {/* Average Rating */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-star text-yellow-400 text-3xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Average Rating</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{parseFloat(data.stats.averageRating || 0).toFixed(2)}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Your Upcoming Sessions</h2>
                <span className="text-sm text-gray-500">2 sesi terdekat</span>
              </div>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                {nextUpcomingSessions.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {nextUpcomingSessions.map((session, idx) => (
                      <li key={idx}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img className="h-10 w-10 rounded-full" src={session.mentee_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(session.mentee_name || '')} alt="Mentee" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">{session.topic}</p>
                                <p className="text-sm text-gray-500">with {session.mentee_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${session.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{session.status}</span>
                              <p className="ml-4 text-sm text-gray-500">{session.schedule}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <i className="fas fa-calendar-plus text-4xl mb-4 text-gray-300"></i>
                    <p>Tidak ada sesi mentoring yang akan datang</p>
                    <p className="text-sm">Sesi akan muncul di sini setelah ada mentee yang mendaftar program Anda</p>
                  </div>
                )}
              </div>
            </div>


          </>
        )}
        {activeTab === 'profile' && (
          <MentorProfile user={data.mentor} onProfileUpdated={fetchDashboardData} />
        )}
        {activeTab === 'sessions' && (
          <div>
            {sessionsTab === 'daftar' && (
              <>
                {/* Button Create New Session */}
                <div className="flex justify-end mb-4">
                  <button
                    className="px-4 py-2 bg-primary text-white rounded font-bold shadow hover:bg-blue-600"
                    onClick={() => setShowSessionModal(true)}
                  >
                    Create New Session
                  </button>
                </div>
                {/* Modal Form Buat Sesi Baru */}
                {showSessionModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
                        <button
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                          onClick={() => setShowSessionModal(false)}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                        <h2 className="text-xl font-bold text-gray-900 pr-8">Buat Program Mentoring Baru</h2>
                      </div>
                      
                      <div className="px-6 py-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-start">
                            <i className="fas fa-info-circle text-blue-500 mt-0.5 mr-2 flex-shrink-0"></i>
                            <div className="text-sm text-blue-700">
                              <p className="font-medium mb-1">Program akan ditampilkan di:</p>
                              <ul className="list-disc ml-4 space-y-0.5">
                                <li>Daftar Program di Dashboard Mentor</li>
                                <li>Halaman Program Mentee (tersedia untuk pendaftaran)</li>
                                <li>Sidebar kiri Dashboard Mentee</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <form className="space-y-4" onSubmit={handleCreateSession}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Program</label>
                              <input name="topic" type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" required />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Mentee (opsional)</label>
                              <select name="mentee_id" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary">
                                <option value="">-- Program Terbuka --</option>
                                {mentees.map(mentee => (
                                  <option key={mentee.id} value={mentee.id}>
                                    {mentee.name} - {mentee.email}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pelaksanaan</label>
                              <input name="date" type="date" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" required />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pelaksanaan</label>
                              <input name="time" type="time" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" required />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Program</label>
                            <textarea name="description" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" rows={2} required placeholder="Jelaskan tujuan dan materi yang akan dipelajari dalam program ini..." />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Zoom Link */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                <i className="fas fa-video text-blue-500 mr-1"></i>
                                Link Zoom Meeting (opsional)
                              </label>
                              <input 
                                name="zoom_link" 
                                type="url" 
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" 
                                placeholder="https://zoom.us/j/1234567890" 
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Link meeting untuk sesi online
                              </p>
                            </div>

                            {/* Material Link */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                <i className="fas fa-book text-green-500 mr-1"></i>
                                Link Materi (opsional)
                              </label>
                              <input 
                                name="material_link" 
                                type="url" 
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" 
                                placeholder="https://drive.google.com/..." 
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Link ke materi pembelajaran
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              <i className="fas fa-lightbulb text-yellow-500 mr-1"></i>
                              Skills yang Akan Dipelajari (opsional)
                            </label>
                            <textarea 
                              name="skills_to_learn" 
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary" 
                              rows={2}
                              placeholder="Contoh: JavaScript, React, Node.js, Database Design" 
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Pisahkan dengan koma. Skills ini akan otomatis ditambahkan ke learning progress mentee setelah menyelesaikan session.
                            </p>
                          </div>
                          
                          <div className="pt-4">
                            <button type="submit" className="w-full py-3 bg-primary text-white rounded-md font-semibold hover:bg-blue-700 transition-colors">
                              Buat Program Mentoring
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
                {/* Daftar Sesi yang Sudah Dibuat */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Daftar Program</h2>
                  {upcomingSessions.length === 0 ? (
                    <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                      Belum ada program yang dibuat.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingSessions.map((session, idx) => (
                        <div key={idx} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="p-4">
                            {/* Header with title and status */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{session.topic}</h4>
                                <div className="flex items-center text-sm text-gray-600">
                                  <i className="fas fa-user mr-2 text-gray-400"></i>
                                  <span>{session.mentee_name || 'Program Terbuka'}</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border-l-2 border-blue-500">
                                  <i className="fas fa-calendar mr-1"></i>
                                  {session.status || 'Active'}
                                </span>
                              </div>
                            </div>

                            {/* Date and Time */}
                            <div className="flex items-center text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                              <div className="flex items-center">
                                <i className="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                <span>{new Date(session.schedule).toLocaleDateString('id-ID', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              <div className="flex items-center ml-4">
                                <i className="fas fa-clock mr-2 text-gray-400"></i>
                                <span>{new Date(session.schedule).toLocaleTimeString('id-ID', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}</span>
                              </div>
                            </div>

                            {/* Description */}
                            {session.description && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
                              </div>
                            )}

                            {/* Skills */}
                            {session.skills_to_learn && (
                              <div className="mb-3">
                                <div className="flex items-center text-xs text-purple-600 mb-2">
                                  <i className="fas fa-lightbulb mr-1"></i>
                                  <span className="font-medium">Skills:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {session.skills_to_learn.split(',').slice(0, 3).map((skill, idx) => (
                                    <span key={idx} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md">
                                      {skill.trim()}
                                    </span>
                                  ))}
                                  {session.skills_to_learn.split(',').length > 3 && (
                                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                      +{session.skills_to_learn.split(',').length - 3} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-gray-500 bg-blue-50 rounded-lg p-2">
                              <div className="flex items-center">
                                <i className="fas fa-users mr-1 text-blue-500"></i>
                                <span>Pendaftar: {session.mentee_id ? 1 : 0}</span>
                              </div>
                              <div className="flex items-center">
                                <i className="fas fa-eye mr-1 text-green-500"></i>
                                <span>Tersedia untuk umum</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            {sessionsTab === 'ajuan' && (
              data.mentor?.id ? (
                <SessionRequests mentorId={data.mentor.id} />
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
                  <div>Memuat data mentor...</div>
                  <div className="text-sm text-gray-500 mt-2">
                    Mentor data: {JSON.stringify(data.mentor)}
                  </div>
                </div>
              )
            )}
            {sessionsTab === 'riwayat' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-6">Riwayat Program Mentoring</h2>
                
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8" aria-label="Tabs">
                    <button
                      onClick={() => setHistoryTab('upcoming')}
                      className={`${
                        historyTab === 'upcoming'
                          ? 'border-yellow-500 text-yellow-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      <i className="fas fa-clock mr-2"></i>
                      Program Akan Datang ({upcomingHistorySessions.length})
                    </button>
                    <button
                      onClick={() => setHistoryTab('ongoing')}
                      className={`${
                        historyTab === 'ongoing'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      <i className="fas fa-play-circle mr-2"></i>
                      Program Berlangsung ({ongoingHistorySessions.length})
                    </button>
                    <button
                      onClick={() => setHistoryTab('completed')}
                      className={`${
                        historyTab === 'completed'
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                      <i className="fas fa-check-circle mr-2"></i>
                      Program Selesai ({completedHistorySessions.length})
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Upcoming Programs Tab */}
                  {historyTab === 'upcoming' && (
                    <div>
                      {upcomingHistorySessions.length === 0 ? (
                        <div className="text-gray-500 bg-gray-50 p-8 rounded-lg text-center">
                          <i className="fas fa-calendar-plus text-3xl text-gray-300 mb-4"></i>
                          <p className="text-lg font-medium mb-2">Tidak ada program yang akan datang</p>
                          <p className="text-sm">Program mentoring yang telah dijadwalkan akan muncul di sini.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {upcomingHistorySessions.map((session, idx) => {
                            const dateTime = formatDateTime(session.schedule);
                            return (
                              <div key={idx} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-4">
                                  {/* Header with title and mentee */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{session.topic}</h4>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-user mr-2 text-gray-400"></i>
                                        <span>dengan {session.mentee_name || 'Program Terbuka'}</span>
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border-l-2 border-yellow-500">
                                        <i className="fas fa-clock mr-1"></i>
                                        Upcoming
                                      </span>
                                    </div>
                                  </div>

                                  {/* Date and Time in compact format */}
                                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center">
                                      <i className="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                      <span>{dateTime.date}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <i className="fas fa-clock mr-2 text-gray-400"></i>
                                      <span>{dateTime.time}</span>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {session.description && (
                                    <div className="mb-3">
                                      <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
                                    </div>
                                  )}

                                  {/* Skills compact display */}
                                  {session.skills_to_learn && (
                                    <div className="mb-3">
                                      <div className="flex items-center text-xs text-purple-600 mb-2">
                                        <i className="fas fa-lightbulb mr-1"></i>
                                        <span className="font-medium">Skills:</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {session.skills_to_learn.split(',').slice(0, 3).map((skill, idx) => (
                                          <span key={idx} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md">
                                            {skill.trim()}
                                          </span>
                                        ))}
                                        {session.skills_to_learn.split(',').length > 3 && (
                                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                            +{session.skills_to_learn.split(',').length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Countdown */}
                                  <div className="text-center mb-3">
                                    <span className="text-sm font-medium text-orange-600">
                                      {getCountdown(session.schedule)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ongoing Programs Tab */}
                  {historyTab === 'ongoing' && (
                    <div>
                      {ongoingHistorySessions.length === 0 ? (
                        <div className="text-gray-500 bg-gray-50 p-8 rounded-lg text-center">
                          <i className="fas fa-play-circle text-3xl text-gray-300 mb-4"></i>
                          <p className="text-lg font-medium mb-2">Tidak ada program yang sedang berlangsung</p>
                          <p className="text-sm">Program yang sedang dalam sesi akan muncul di sini.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {ongoingHistorySessions.map((session, idx) => {
                            const dateTime = formatDateTime(session.schedule);
                            return (
                              <div key={idx} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-4">
                                  {/* Header with title and mentee */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{session.topic}</h4>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-user mr-2 text-gray-400"></i>
                                        <span>dengan {session.mentee_name || 'Program Terbuka'}</span>
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border-l-2 border-blue-500">
                                        <i className="fas fa-play-circle mr-1"></i>
                                        Ongoing
                                      </span>
                                    </div>
                                  </div>

                                  {/* Date and Time in compact format */}
                                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center">
                                      <i className="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                      <span>{dateTime.date}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <i className="fas fa-clock mr-2 text-gray-400"></i>
                                      <span>{dateTime.time}</span>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {session.description && (
                                    <div className="mb-3">
                                      <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
                                    </div>
                                  )}

                                  {/* Skills compact display */}
                                  {session.skills_to_learn && (
                                    <div className="mb-3">
                                      <div className="flex items-center text-xs text-purple-600 mb-2">
                                        <i className="fas fa-lightbulb mr-1"></i>
                                        <span className="font-medium">Skills:</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {session.skills_to_learn.split(',').slice(0, 3).map((skill, idx) => (
                                          <span key={idx} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-md">
                                            {skill.trim()}
                                          </span>
                                        ))}
                                        {session.skills_to_learn.split(',').length > 3 && (
                                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                            +{session.skills_to_learn.split(',').length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Programs Tab */}
                  {historyTab === 'completed' && (
                    <div>
                      {completedHistorySessions.length === 0 ? (
                        <div className="text-gray-500 bg-gray-50 p-8 rounded-lg text-center">
                          <i className="fas fa-check-circle text-3xl text-gray-300 mb-4"></i>
                          <p className="text-lg font-medium mb-2">Belum ada program yang selesai</p>
                          <p className="text-sm">Program yang telah selesai akan muncul di sini dengan feedback dari mentee.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {completedHistorySessions.map((session, idx) => {
                            const dateTime = formatDateTime(session.schedule);
                            const hasFeedback = session.feedback_rating && session.feedback_comment;
                            return (
                              <div key={idx} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="p-4">
                                  {/* Header with title and mentee */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{session.topic}</h4>
                                      <div className="flex items-center text-sm text-gray-600">
                                        <i className="fas fa-user mr-2 text-gray-400"></i>
                                        <span>dengan {session.mentee_name || 'Program Terbuka'}</span>
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border-l-2 border-green-500">
                                        <i className="fas fa-check-circle mr-1"></i>
                                        Completed
                                      </span>
                                    </div>
                                  </div>

                                  {/* Date and Time in compact format */}
                                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                                    <div className="flex items-center">
                                      <i className="fas fa-calendar-alt mr-2 text-gray-400"></i>
                                      <span>{dateTime.date}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <i className="fas fa-clock mr-2 text-gray-400"></i>
                                      <span>{dateTime.time}</span>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  {session.description && (
                                    <div className="mb-3">
                                      <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
                                    </div>
                                  )}

                                  {/* Skills completed */}
                                  {session.skills_to_learn && (
                                    <div className="mb-3">
                                      <div className="flex items-center text-xs text-green-600 mb-2">
                                        <i className="fas fa-check-circle mr-1"></i>
                                        <span className="font-medium">Skills dikuasai:</span>
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {session.skills_to_learn.split(',').slice(0, 3).map((skill, idx) => (
                                          <span key={idx} className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md">
                                            {skill.trim()}
                                          </span>
                                        ))}
                                        {session.skills_to_learn.split(',').length > 3 && (
                                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                                            +{session.skills_to_learn.split(',').length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Session duration */}
                                  <div className="text-center mb-3">
                                    <span className="text-sm font-medium text-gray-600">
                                      {session.end_schedule ? 
                                        `Durasi: ${new Date(session.schedule).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(session.end_schedule).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` :
                                        'Sesi telah selesai'
                                      }
                                    </span>
                                  </div>

                                  {/* Feedback display if available */}
                                  {hasFeedback ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                      <div className="flex items-center mb-2">
                                        <i className="fas fa-star text-yellow-500 mr-2"></i>
                                        <span className="text-sm font-medium text-yellow-800">Feedback dari Mentee</span>
                                      </div>
                                      <div className="flex items-center mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <i key={star} className={`fas fa-star text-sm ${star <= (session.feedback_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">({session.feedback_rating || 0}/5)</span>
                                      </div>
                                      <p className="text-xs text-gray-600 line-clamp-2">"{session.feedback_comment}"</p>
                                    </div>
                                  ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                      <i className="fas fa-comment-slash text-gray-400 text-lg mb-1"></i>
                                      <p className="text-xs text-gray-500">Belum ada feedback dari mentee</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'feedback' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Feedback Sesi Program Selesai</h2>
            {sessionHistory.length === 0 ? (
              <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                Belum ada sesi yang selesai.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionHistory.map((session, idx) => (
                  <div key={idx} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-4">
                      {/* Header with title and mentor */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{session.topic}</h4>
                          <div className="flex items-center text-sm text-gray-600">
                            <i className="fas fa-user mr-2 text-gray-400"></i>
                            <span>dengan {session.mentee_name}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border-l-2 border-green-500">
                            <i className="fas fa-check-circle mr-1"></i>
                            Completed
                          </span>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                        <div className="flex items-center">
                          <i className="fas fa-calendar-alt mr-2 text-gray-400"></i>
                          <span>{new Date(session.schedule).toLocaleDateString('id-ID', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-clock mr-2 text-gray-400"></i>
                          <span>
                            {new Date(session.schedule).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            {session.end_schedule && ` - ${new Date(session.end_schedule).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {session.description && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
                        </div>
                      )}

                      {/* Feedback Section */}
                      {session.feedback_rating ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center mb-2">
                            <i className="fas fa-star text-yellow-500 mr-2"></i>
                            <span className="text-sm font-medium text-yellow-800">Feedback dari Mentee</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <i key={star} className={`fas fa-star text-sm ${star <= (session.feedback_rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">({session.feedback_rating || 0}/5)</span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-3 italic">"{session.feedback_comment}"</p>
                          {session.feedback_date && (
                            <div className="text-xs text-gray-400 mt-2">
                              <i className="fas fa-clock mr-1"></i>
                              {new Date(session.feedback_date).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                          <i className="fas fa-comment-slash text-gray-400 text-2xl mb-2"></i>
                          <p className="text-xs text-gray-500 italic">Belum ada feedback dari mentee</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ...existing code for other tabs if needed... */}
        </div>
      </div>
      
      {/* Footer */}
      <footer className={`bg-white w-full fixed bottom-0 z-10 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64 ml-0' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">© 2024 MentorConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default MentorDashboard;
