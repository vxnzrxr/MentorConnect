import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';

function SessionHistory({ sessions }) {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Helper function to determine session status based on time
  const getSessionStatus = (session) => {
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

  // Categorize sessions
  const upcoming = sessions.filter(s => getSessionStatus(s) === 'upcoming');
  const ongoing = sessions.filter(s => getSessionStatus(s) === 'ongoing');
  const completed = sessions.filter(s => getSessionStatus(s) === 'completed');

  // Helper for countdown
  const getCountdown = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `${diff} hari lagi`;
    if (diff === 0) return 'Hari ini';
    return 'Sudah lewat';
  };

  // Helper to format date/time
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

  // Submit feedback handler
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const response = await fetch('http://localhost:5175/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: selectedSession.id,
          mentee_id: selectedSession.mentee_id,
          mentor_id: selectedSession.mentor_id,
          rating: feedbackData.rating,
          comment: feedbackData.comment
        })
      });
      
      if (response.ok) {
        alert('Feedback berhasil dikirim!');
        // Refresh page or update state here if needed
        window.location.reload();
      } else {
        alert('Gagal mengirim feedback');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengirim feedback');
    }
    setFeedbackOpen(false);
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-6">Riwayat Program Mentoring</h2>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`${
              activeTab === 'upcoming'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <i className="fas fa-clock mr-2"></i>
            Program Akan Datang ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`${
              activeTab === 'ongoing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <i className="fas fa-play-circle mr-2"></i>
            Program Berlangsung ({ongoing.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            <i className="fas fa-check-circle mr-2"></i>
            Program Selesai ({completed.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Upcoming Programs Tab */}
        {activeTab === 'upcoming' && (
          <div>
            {upcoming.length === 0 ? (
              <div className="text-gray-500 bg-gray-50 p-8 rounded-lg text-center">
                <i className="fas fa-calendar-plus text-3xl text-gray-300 mb-4"></i>
                <p className="text-lg font-medium mb-2">Tidak ada program yang akan datang</p>
                <p className="text-sm">Program mentoring yang telah dijadwalkan akan muncul di sini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((session, idx) => {
                  const dateTime = formatDateTime(session.schedule);
                  return (
                    <div key={idx} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="p-4">
                        {/* Header with title and mentor */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{session.topic}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <img className="h-6 w-6 rounded-full mr-2" src={session.mentor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentor_name)}`} alt="Mentor" />
                              <span>dengan {session.mentor_name}</span>
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

                        {/* Action Links - compact buttons */}
                        {(session.zoom_link || session.material_link) && (
                          <div className="flex gap-2">
                            {session.zoom_link && (
                              <a href={session.zoom_link} target="_blank" rel="noopener noreferrer" 
                                 className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                                <i className="fas fa-video mr-1"></i>
                                Join Zoom
                              </a>
                            )}
                            {session.material_link && (
                              <a href={session.material_link} target="_blank" rel="noopener noreferrer" 
                                 className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                                <i className="fas fa-file-alt mr-1"></i>
                                Material
                              </a>
                            )}
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

        {/* Ongoing Programs Tab */}
        {activeTab === 'ongoing' && (
          <div>
            {ongoing.length === 0 ? (
              <div className="text-gray-500 bg-gray-50 p-8 rounded-lg text-center">
                <i className="fas fa-play-circle text-3xl text-gray-300 mb-4"></i>
                <p className="text-lg font-medium mb-2">Tidak ada program yang sedang berlangsung</p>
                <p className="text-sm">Program yang sedang dalam sesi akan muncul di sini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoing.map((session, idx) => {
                  const dateTime = formatDateTime(session.schedule);
                  return (
                    <div key={idx} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="p-4">
                        {/* Header with title and mentor */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{session.topic}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <img className="h-6 w-6 rounded-full mr-2" src={session.mentor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentor_name)}`} alt="Mentor" />
                              <span>dengan {session.mentor_name}</span>
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

                        {/* Action Links - compact buttons */}
                        {(session.zoom_link || session.material_link) && (
                          <div className="flex gap-2">
                            {session.zoom_link && (
                              <a href={session.zoom_link} target="_blank" rel="noopener noreferrer" 
                                 className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                                <i className="fas fa-video mr-1"></i>
                                Join Zoom
                              </a>
                            )}
                            {session.material_link && (
                              <a href={session.material_link} target="_blank" rel="noopener noreferrer" 
                                 className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                                <i className="fas fa-file-alt mr-1"></i>
                                Material
                              </a>
                            )}
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
        {activeTab === 'completed' && (
          <div>
            {completed.length === 0 ? (
              <div className="text-gray-500 bg-gray-50 p-8 rounded-lg text-center">
                <i className="fas fa-check-circle text-3xl text-gray-300 mb-4"></i>
                <p className="text-lg font-medium mb-2">Belum ada program yang selesai</p>
                <p className="text-sm">Program yang telah selesai akan muncul di sini dengan opsi untuk memberikan feedback.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completed.map((session, idx) => {
                  const dateTime = formatDateTime(session.schedule);
                  const hasFeedback = session.feedback_rating && session.feedback_comment;
                  return (
                    <div key={idx} className="bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="p-4">
                        {/* Header with title and mentor */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{session.topic}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <img className="h-6 w-6 rounded-full mr-2" src={session.mentor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentor_name)}`} alt="Mentor" />
                              <span>dengan {session.mentor_name}</span>
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

                        {/* Skills compact display */}
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

                        {/* Action Links and Feedback */}
                        <div className="space-y-2">
                          {/* Resources */}
                          {(session.zoom_link || session.material_link) && (
                            <div className="flex gap-2">
                              {session.zoom_link && (
                                <a href={session.zoom_link} target="_blank" rel="noopener noreferrer" 
                                   className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                                  <i className="fas fa-video mr-1"></i>
                                  Recording
                                </a>
                              )}
                              {session.material_link && (
                                <a href={session.material_link} target="_blank" rel="noopener noreferrer" 
                                   className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                                  <i className="fas fa-file-alt mr-1"></i>
                                  Material
                                </a>
                              )}
                            </div>
                          )}

                          {/* Feedback Section */}
                          {hasFeedback ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center mb-2">
                                <i className="fas fa-star text-yellow-500 mr-2"></i>
                                <span className="text-sm font-medium text-yellow-800">Feedback Diberikan</span>
                              </div>
                              <div className="flex items-center mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i key={star} className={`fas fa-star text-sm ${star <= session.feedback_rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">({session.feedback_rating}/5)</span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{session.feedback_comment}</p>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setSelectedSession(session);
                                setFeedbackOpen(true);
                              }}
                              className="w-full flex items-center justify-center px-3 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 transition-colors"
                            >
                              <i className="fas fa-comment mr-1"></i>
                              Berikan Feedback
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
        session={selectedSession || { topic: '' }}
      />
    </div>
  );
}

export default SessionHistory;