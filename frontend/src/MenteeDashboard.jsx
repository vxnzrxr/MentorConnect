import React, { useEffect, useState, useCallback } from 'react';
import MentorList from './MentorList';
import MenteeSidebar from './MenteeSidebar';
import MenteeProfile from './MenteeProfile';
import ProgramList from './ProgramList';
import SessionHistory from './SessionHistory';
import MentorSearchPage from './MentorSearchPage';
import NotificationPage from './NotificationPage';

function MenteeDashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [programs, setPrograms] = useState([]);
  const [learningProgress, setLearningProgress] = useState([]);
  const [acquiredSkills, setAcquiredSkills] = useState([]);
  const [isValidAccess, setIsValidAccess] = useState(true);
  const [accessMessage, setAccessMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Refetch dashboard data (for profile update refresh)
  const fetchDashboardData = useCallback(() => {
    const email = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    
    // Pastikan user adalah mentee
    if (!email || userRole !== 'mentee') {
      console.error('Invalid mentee session');
      setIsValidAccess(false);
      setAccessMessage('Anda tidak memiliki akses ke dashboard mentee. Silakan login sebagai mentee.');
      return;
    }
    
    setIsValidAccess(true);
    fetch(`http://localhost:5175/api/mentee-dashboard?email=${email}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(result => {
        setData(result);
        // Extract skills from completed sessions if we have session data
        if (result.allSessions || result.sessionHistory) {
          const sessions = result.allSessions || result.sessionHistory || [];
          const extractedSkills = extractSkillsFromSessions(sessions);
          setLearningProgress(extractedSkills);
          
          // Extract detailed skills for dashboard display
          const detailedSkills = extractDetailedSkills(sessions);
          setAcquiredSkills(detailedSkills);
        }
        // Also fetch learning progress from API if mentee data is available
        if (result.mentee?.id) {
          fetchLearningProgress(result.mentee.id);
        }
      })
      .catch(error => {
        console.error('Error fetching mentee dashboard data:', error);
        setData({ error: error.message, mentee: { name: 'Error User' }, stats: {}, sessions: [] });
      });
  }, []);

  // Fetch learning progress
  const fetchLearningProgress = useCallback((menteeId) => {
    fetch(`http://localhost:5175/api/mentee-skills/${menteeId}`)
      .then(res => res.json())
      .then(result => {
        setLearningProgress(result.skills || []);
      })
      .catch(err => console.error('Error fetching learning progress:', err));
  }, []);

  // Extract skills from completed sessions and create learning progress
  const extractSkillsFromSessions = useCallback((sessions) => {
    if (!sessions || sessions.length === 0) return [];
    
    const completedSessions = sessions.filter(session => 
      session.status === 'completed' && session.skills_to_learn
    );
    
    const extractedSkills = [];
    
    completedSessions.forEach(session => {
      if (session.skills_to_learn) {
        const skillsList = session.skills_to_learn.split(',');
        skillsList.forEach(skill => {
          const trimmedSkill = skill.trim();
          if (trimmedSkill) {
            extractedSkills.push({
              skill_name: trimmedSkill,
              acquired_from_session_id: session.id,
              session_topic: session.topic,
              session_date: session.schedule,
              mentor_name: session.mentor_name,
              proficiency_level: 'Beginner' // Default level
            });
          }
        });
      }
    });
    
    return extractedSkills;
  }, []);

  // Extract detailed skills for dashboard display
  const extractDetailedSkills = useCallback((sessions) => {
    if (!sessions || sessions.length === 0) return [];
    
    const completedSessions = sessions.filter(session => 
      session.status === 'completed' && session.skills_to_learn
    );
    
    const skillFrequency = {};
    
    completedSessions.forEach(session => {
      if (session.skills_to_learn) {
        const skillsList = session.skills_to_learn.split(',');
        skillsList.forEach(skill => {
          const trimmedSkill = skill.trim();
          if (trimmedSkill) {
            if (skillFrequency[trimmedSkill]) {
              skillFrequency[trimmedSkill].count++;
              skillFrequency[trimmedSkill].sessions.push({
                topic: session.topic,
                date: session.schedule,
                mentor: session.mentor_name
              });
            } else {
              skillFrequency[trimmedSkill] = {
                count: 1,
                sessions: [{
                  topic: session.topic,
                  date: session.schedule,
                  mentor: session.mentor_name
                }]
              };
            }
          }
        });
      }
    });
    
    return Object.entries(skillFrequency).map(([skillName, data]) => {
      // Calculate progress: 1 session = 33%, 2 sessions = 66%, 3+ sessions = 100%
      let progress = Math.min((data.count * 33.33), 100);
      let level = 'Beginner';
      let colorClass = 'bg-red-500';
      
      if (progress >= 100) {
        level = 'Expert';
        colorClass = 'bg-green-500';
      } else if (progress >= 66) {
        level = 'Intermediate';
        colorClass = 'bg-yellow-500';
      } else if (progress >= 33) {
        level = 'Basic';
        colorClass = 'bg-blue-500';
      }
      
      return {
        name: skillName,
        level,
        progress: Math.round(progress),
        colorClass,
        sessions: data.sessions,
        sessionCount: data.count
      };
    });
  }, []);

  // Fetch daftar program/sesi yang tersedia
  const fetchPrograms = useCallback(() => {
    console.log('Fetching programs for mentee dashboard...');
    fetch('http://localhost:5175/api/programs')
      .then(res => res.json())
      .then(result => {
        console.log('Programs fetched:', result.programs?.length || 0);
        setPrograms(result.programs || []);
      })
      .catch(err => console.error('Error fetching programs:', err));
  }, []);
  useEffect(() => {
    fetchDashboardData();
    fetchPrograms();
    
    // Refresh programs every 30 seconds
    const interval = setInterval(fetchPrograms, 30000);
    
    // Listen for tab change events from notifications
    const handleTabChange = (event) => {
      setActiveTab(event.detail);
    };
    window.addEventListener('changeMenteeTab', handleTabChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('changeMenteeTab', handleTabChange);
    };
  }, [fetchDashboardData, fetchPrograms]);

  const handleRegisterProgram = async (program) => {
    const menteeEmail = data.mentee?.email || localStorage.getItem('userEmail');
    try {
      const res = await fetch(`http://localhost:5175/api/sessions/${program.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentee_email: menteeEmail })
      });
      const result = await res.json();
      if (result.success) {
        alert('Berhasil mendaftar sesi mentoring!');
        fetchPrograms(); // refresh daftar program
      } else {
        alert(result.error || 'Gagal mendaftar sesi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

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

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <MenteeSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        mentee={data.mentee}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        key={`sidebar-${activeTab}`} // Force re-render when tab changes to refresh notification count
      />
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64 ml-0' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto py-6 px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Welcome Section */}
            <div className="px-4 py-6 sm:px-0">
              <h1 className="text-3xl font-bold text-gray-900">Selamat datang kembali, {data.mentee?.name || "Mentee"}!</h1>
              <p className="mt-2 text-gray-600">Lanjutkan perjalanan belajar Anda dengan mentor ahli.</p>
            </div>

            {/* Stats Section */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-check-circle text-green-500 text-3xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Sesi Selesai</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{data.stats.completedSessions}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-clock text-primary text-3xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Jam Belajar</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{data.stats.learningHours}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <i className="fas fa-award text-yellow-400 text-3xl"></i>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Skills Dikuasai</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{data.stats.skillsAcquired}</div>
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
                <h2 className="text-lg font-medium text-gray-900">Sesi Mendatang Anda</h2>
                <button 
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => setActiveTab('mentors')}
                >
                  Cari Mentor Baru
                </button>
              </div>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                {data.upcomingSessions && data.upcomingSessions.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {data.upcomingSessions.map((session, idx) => (
                      <li key={idx}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img className="h-10 w-10 rounded-full" src={session.mentor_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(session.mentor_name || '')} alt="Mentor" />
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">{session.topic}</p>
                                <p className="text-sm text-gray-500">dengan {session.mentor_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {new Date(session.schedule) > new Date() ? 'Mendatang' : session.status}
                              </span>
                              <p className="ml-4 text-sm text-gray-500">
                                {new Date(session.schedule).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <i className="fas fa-calendar-plus text-6xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak Ada Sesi Mendatang</h3>
                    <p className="text-gray-500 mb-4">Anda belum memiliki sesi mentoring yang akan datang.</p>
                    <button 
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                      onClick={() => setActiveTab('mentors')}
                    >
                      Jadwalkan Sesi Baru
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Acquired Section */}
            <div className="mt-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <i className="fas fa-medal mr-3 text-yellow-500"></i>
                  Skills yang Telah Dipelajari
                </h2>
                
                {acquiredSkills.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 mb-4">
                      <i className="fas fa-lightbulb text-6xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Belum Ada Skills yang Dikuasai</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Ikuti program mentoring untuk mulai memperoleh skills baru dan tingkatkan kemampuan Anda!</p>
                    <button 
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      onClick={() => setActiveTab('program')}
                    >
                      <i className="fas fa-search mr-2"></i>
                      Cari Program Mentoring
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Skills Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <i className="fas fa-trophy text-blue-500 text-2xl"></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600">Total Skills</p>
                            <p className="text-2xl font-bold text-blue-900">{acquiredSkills.length}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <i className="fas fa-star text-green-500 text-2xl"></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-600">Expert Level</p>
                            <p className="text-2xl font-bold text-green-900">
                              {acquiredSkills.filter(skill => skill.level === 'Expert').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <i className="fas fa-chart-line text-purple-500 text-2xl"></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-purple-600">Avg Progress</p>
                            <p className="text-2xl font-bold text-purple-900">
                              {acquiredSkills.length > 0 ? Math.round(acquiredSkills.reduce((sum, skill) => sum + skill.progress, 0) / acquiredSkills.length) : 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {acquiredSkills.map((skill, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
                          {/* Skill Header */}
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-semibold text-gray-900 truncate mr-3">{skill.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${skill.colorClass} flex-shrink-0`}>
                              {skill.level}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-600">Progress</span>
                              <span className="text-lg font-bold text-gray-900">{skill.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-300 ${skill.colorClass}`}
                                style={{ width: `${skill.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Session Count */}
                          <div className="text-sm text-gray-600 mb-3 flex items-center">
                            <i className="fas fa-graduation-cap mr-2 text-blue-500"></i>
                            <span>Dipelajari dalam {skill.sessionCount} sesi mentoring</span>
                          </div>
                          
                          {/* Latest Session Info */}
                          {skill.sessions.length > 0 && (
                            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start">
                                <i className="fas fa-clock mr-2 mt-0.5 text-gray-400"></i>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-700 mb-1 line-clamp-2">
                                    Terakhir dipelajari: {skill.sessions[skill.sessions.length - 1].topic}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(skill.sessions[skill.sessions.length - 1].date).toLocaleDateString('id-ID', {
                                      weekday: 'long',
                                      year: 'numeric', 
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {activeTab === 'mentors' && (
          <MentorSearchPage />
        )}
        {activeTab === 'profile' && (
          <MenteeProfile user={data.mentee} onProfileUpdated={fetchDashboardData} />
        )}
        {activeTab === 'program' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Program Mentoring</h2>
              <button 
                onClick={fetchPrograms}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            </div>
            <ProgramList programs={programs} onRegister={handleRegisterProgram} />
          </div>
        )}
        {activeTab === 'sessions' && (
          <SessionHistory sessions={data.allSessions || data.sessionHistory || []} />
        )}
        {activeTab === 'notifications' && (
          <NotificationPage />
        )}
        {/* ...tambahkan konten tab lain jika diperlukan... */}
        </div>
      </div>
      
      {/* Footer */}
      <footer className={`bg-white w-full fixed bottom-0 z-10 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64 ml-0' : 'ml-0'}`}>
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">© 2024 MentorConnect. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}

export default MenteeDashboard;
