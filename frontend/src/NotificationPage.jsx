import React, { useState, useEffect } from 'react';

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [menteeId, setMenteeId] = useState(null);

  useEffect(() => {
    fetchMenteeIdAndNotifications();
  }, []);

  // Refresh notifications when tab becomes active
  useEffect(() => {
    if (menteeId) {
      fetchNotifications(menteeId);
    }
  }, [menteeId]);

  const fetchMenteeIdAndNotifications = async () => {
    try {
      // Get mentee data first
      const email = localStorage.getItem('userEmail');
      if (!email) return;
      
      const dashboardResponse = await fetch(`http://localhost:5175/api/mentee-dashboard?email=${email}`);
      const dashboardData = await dashboardResponse.json();
      
      if (dashboardData.mentee?.id) {
        setMenteeId(dashboardData.mentee.id);
        await fetchNotifications(dashboardData.mentee.id);
      }
    } catch (error) {
      console.error('Error fetching mentee data:', error);
    }
    setLoading(false);
  };

  const fetchNotifications = async (menteeId) => {
    try {
      const response = await fetch(`http://localhost:5175/api/mentee/${menteeId}/notifications`);
      const result = await response.json();
      if (result.success) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5175/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, read_status: 1 } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    setDropdownOpen(null);
  };

  const dismissNotification = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:5175/api/notifications/${notificationId}/dismiss`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
        // Trigger sidebar refresh
        const event = new CustomEvent('refreshSidebarNotifications');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
    setDropdownOpen(null);
  };

  const goToMentorSearch = () => {
    // Trigger parent component to change tab
    const event = new CustomEvent('changeMenteeTab', { detail: 'mentors' });
    window.dispatchEvent(event);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'session_approved':
        return 'fas fa-check-circle text-green-500';
      case 'session_rejected':
        return 'fas fa-exclamation-triangle text-red-500';
      case 'session_rescheduled':
        return 'fas fa-calendar-alt text-yellow-500';
      default:
        return 'fas fa-bell text-blue-500';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'session_approved':
        return 'bg-green-50 border-green-200';
      case 'session_rejected':
        return 'bg-red-50 border-red-200';
      case 'session_rescheduled':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  // Group notifications by type
  const sessionNotifications = notifications.filter(n => 
    ['session_approved', 'session_rejected', 'session_rescheduled'].includes(n.type)
  );
  const generalNotifications = notifications.filter(n => 
    !['session_approved', 'session_rejected', 'session_rescheduled'].includes(n.type)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Notifikasi</h2>
        <button
          onClick={() => menteeId && fetchNotifications(menteeId)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          Refresh
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
          <p className="text-gray-500 mt-2">Memuat notifikasi...</p>
        </div>
      )}
      
      {!loading && (
        <div className="space-y-6">
          {/* Session Notifications Section */}
          {sessionNotifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <i className="fas fa-calendar-check mr-2"></i>
                Pembaruan Sesi ({sessionNotifications.filter(n => !n.read_status).length} belum dibaca)
              </h3>
              <div className="space-y-4">
                {sessionNotifications.map((notification) => (
                  <div
                    key={`session-${notification.id}`}
                    className={`${getNotificationColor(notification.type)} border rounded-lg p-4 shadow-sm ${
                      notification.read_status ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="flex-shrink-0">
                            <i className={`${getNotificationIcon(notification.type)} text-xl mr-3`}></i>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-700">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="ml-8 space-y-2">
                          {notification.session_topic && (
                            <div className="text-sm font-medium text-gray-800">
                              Sesi: {notification.session_topic}
                            </div>
                          )}

                          {notification.type === 'session_approved' && (
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">Jadwal:</span>{' '}
                              {new Date(notification.data.schedule).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}

                          {notification.type === 'session_rescheduled' && (
                            <div className="space-y-1">
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Awal:</span>{' '}
                                {new Date(notification.data.originalSchedule).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              <div className="text-sm text-green-700">
                                <span className="font-medium">Jadwal Baru:</span>{' '}
                                {new Date(notification.data.newSchedule).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          )}

                          {/* Display Zoom and Material Links for approved/rescheduled sessions */}
                          {(notification.type === 'session_approved' || notification.type === 'session_rescheduled') && 
                           (notification.data.zoomLink || notification.data.materialLink) && (
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
                              <p className="text-sm font-medium text-blue-900 mb-2">
                                <i className="fas fa-link mr-1"></i>
                                Sumber Daya Sesi:
                              </p>
                              <div className="space-y-2">
                                {notification.data.zoomLink && (
                                  <div className="flex items-center text-sm">
                                    <i className="fas fa-video text-blue-600 mr-2"></i>
                                    <a 
                                      href={notification.data.zoomLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-700 hover:text-blue-900 hover:underline font-medium"
                                    >
                                      Gabung Zoom Meeting
                                    </a>
                                  </div>
                                )}
                                {notification.data.materialLink && (
                                  <div className="flex items-center text-sm">
                                    <i className="fas fa-book text-purple-600 mr-2"></i>
                                    <a 
                                      href={notification.data.materialLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-purple-700 hover:text-purple-900 hover:underline font-medium"
                                    >
                                      Materi Pembelajaran
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {notification.type === 'session_rejected' && notification.data.rejectReason && (
                            <div className="bg-gray-100 rounded-md p-3 mt-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                Alasan penolakan:
                              </p>
                              <p className="text-sm text-gray-800">
                                {notification.data.rejectReason}
                              </p>
                            </div>
                          )}

                          {notification.data.mentorName && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Mentor:</span> {notification.data.mentorName}
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!notification.read_status && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Tandai sudah dibaca"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        )}
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Hapus notifikasi"
                        >
                          <i className="fas fa-times text-lg"></i>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 ml-8 flex space-x-3">
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Hapus
                      </button>
                      {notification.type === 'session_rejected' && (
                        <button
                          onClick={() => {
                            goToMentorSearch();
                            dismissNotification(notification.id);
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <i className="fas fa-search mr-1"></i>
                          Cari Mentor Lain
                        </button>
                      )}
                      {(notification.type === 'session_approved' || notification.type === 'session_rescheduled') && (
                        <button
                          onClick={() => {
                            const event = new CustomEvent('changeMenteeTab', { detail: 'sessions' });
                            window.dispatchEvent(event);
                            markAsRead(notification.id);
                          }}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <i className="fas fa-calendar mr-1"></i>
                          Lihat Sesi
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Notifications Section */}
          {generalNotifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <i className="fas fa-bell mr-2"></i>
                General Notifications ({generalNotifications.filter(n => !n.read_status).length} unread)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {generalNotifications.map(notif => (
                  <div key={`general-${notif.id}`} className={`bg-white border rounded-lg shadow p-5 flex items-center gap-4 relative ${notif.read_status ? 'opacity-60' : ''}`}>
                    <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{notif.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(notif.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100"
                        onClick={() => setDropdownOpen(dropdownOpen === `general-${notif.id}` ? null : `general-${notif.id}`)}
                        aria-label="Opsi Notifikasi"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <circle cx="4" cy="10" r="2" />
                          <circle cx="10" cy="10" r="2" />
                          <circle cx="16" cy="10" r="2" />
                        </svg>
                      </button>
                      {dropdownOpen === `general-${notif.id}` && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => markAsRead(notif.id)}
                          >Tandai sudah dibaca</button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                            onClick={() => dismissNotification(notif.id)}
                          >Hapus</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-bell-slash text-6xl"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak ada notifikasi</h3>
              <p className="text-gray-500">Semua notifikasi akan muncul di sini</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationPage;
