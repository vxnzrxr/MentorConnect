import React, { useState, useEffect } from 'react';
import LogoutModal from './LogoutModal';

function MentorSidebar({ activeTab, setActiveTab, sessionsTab, setSessionsTab, mentor, sidebarOpen, setSidebarOpen }) {
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

  // Handle menu click on mobile
  const handleMenuClick = (tabName, sessionSubTab = null) => {
    setActiveTab(tabName);
    if (sessionSubTab) {
      setSessionsTab(sessionSubTab);
    }
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
      <aside className={`fixed left-0 top-0 w-64 bg-white shadow-lg flex flex-col h-screen p-6 z-20 transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center mb-6">
          <img className="h-12 w-12 rounded-full" src={mentor?.avatar || 'https://ui-avatars.com/api/?name=Mentor'} alt="Profile" />
          <span className="ml-3 text-lg font-semibold text-gray-700">{mentor?.name || 'Mentor'}</span>
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
              <div className="pt-4 border-t">
                <span className="block text-xs font-bold text-gray-500 mb-2">Sesi</span>
                <ul className="space-y-2 pl-2">
                  <li>
                    <button
                      className={`w-full text-left text-gray-700 hover:text-primary font-medium ${activeTab === 'sessions' && sessionsTab === 'daftar' ? 'text-primary font-bold' : ''}`}
                      onClick={() => handleMenuClick('sessions', 'daftar')}
                    >
                      Daftar Program
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left text-gray-700 hover:text-yellow-600 font-medium ${activeTab === 'sessions' && sessionsTab === 'ajuan' ? 'text-yellow-600 font-bold' : ''}`}
                      onClick={() => handleMenuClick('sessions', 'ajuan')}
                    >
                      Ajuan Program
                    </button>
                  </li>
                  <li>
                    <button
                      className={`w-full text-left text-gray-700 hover:text-gray-600 font-medium ${activeTab === 'sessions' && sessionsTab === 'riwayat' ? 'text-gray-600 font-bold' : ''}`}
                      onClick={() => handleMenuClick('sessions', 'riwayat')}
                    >
                      Riwayat
                    </button>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              <button
                className={`w-full text-left text-gray-700 hover:text-primary font-medium ${activeTab === 'feedback' ? 'text-primary font-bold' : ''}`}
                onClick={() => handleMenuClick('feedback')}
              >
                Feedback
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

export default MentorSidebar;
