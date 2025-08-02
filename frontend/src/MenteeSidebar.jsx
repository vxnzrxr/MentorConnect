import React, { useState, useEffect } from 'react';
import LogoutModal from './LogoutModal';

function MenteeSidebar({ activeTab, setActiveTab, mentee, sidebarOpen, setSidebarOpen }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-close sidebar on mobile when screen is small
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);
  const notifications = [
    'Sesi kamu besok pukul 10.00',
    'Mentor telah menyetujui permintaanmu',
  ];

  useEffect(() => {
    if (mentee?.id) {
      fetchNotificationCount();
    }
    
    // Listen for refresh events from NotificationPage
    const handleRefresh = () => {
      if (mentee?.id) {
        fetchNotificationCount();
      }
    };
    
    window.addEventListener('refreshSidebarNotifications', handleRefresh);
    
    return () => {
      window.removeEventListener('refreshSidebarNotifications', handleRefresh);
    };
  }, [mentee?.id]);

  // Handle menu click on mobile
  const handleMenuClick = (tabName) => {
    setActiveTab(tabName);
    // Close sidebar on mobile after menu click
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Handle logout function
  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Redirect to landing page
    window.location.href = '/';
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch(`http://localhost:5175/api/mentee/${mentee.id}/notifications/count`);
      const result = await response.json();
      if (result.success) {
        setNotificationCount(result.count.unread);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  return (
    <>
      {/* Hamburger Menu Button - Fixed Position */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 z-30 p-2 bg-white rounded-md shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-300 ${
          sidebarOpen ? 'left-64' : 'left-4'
        }`}
        aria-label="Toggle Sidebar"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 w-64 bg-white shadow-lg flex flex-col h-screen p-6 z-20 pt-6 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center mb-6 relative">
          <img className="h-12 w-12 rounded-full" src={mentee?.avatar || 'https://ui-avatars.com/api/?name=Mentee'} alt="Profile" />
          <span className="ml-3 text-lg font-semibold text-gray-700">{mentee?.name || 'Mentee'}</span>
          <div className="flex-1" />
          <button
            className="ml-3 relative"
            onClick={() => handleMenuClick('notifications')}
            aria-label="Notifikasi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {notificationCount}
              </span>
            )}
          </button>
        </div>
        <nav className="flex-1">
          <ul className="space-y-4">
            <li>
              <button
                className={`w-full text-left text-gray-700 hover:text-primary font-medium ${activeTab === 'profile' ? 'text-primary font-bold' : ''}`}
                onClick={() => handleMenuClick('profile')}
              >
                Profil
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left text-gray-700 hover:text-primary font-medium ${activeTab === 'dashboard' ? 'text-primary font-bold' : ''}`}
                onClick={() => handleMenuClick('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left text-gray-700 hover:text-primary font-medium ${activeTab === 'mentors' ? 'text-primary font-bold' : ''}`}
                onClick={() => handleMenuClick('mentors')}
              >
                Cari Mentor
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left text-gray-700 hover:text-primary font-medium ${activeTab === 'program' ? 'text-primary font-bold' : ''}`}
                onClick={() => handleMenuClick('program')}
              >
                Program
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left text-gray-700 hover:text-primary font-medium ${activeTab === 'sessions' ? 'text-primary font-bold' : ''}`}
                onClick={() => handleMenuClick('sessions')}
              >
                Sesi
              </button>
            </li>
          </ul>
        </nav>
        <div className="mt-auto pt-6">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

export default MenteeSidebar;
