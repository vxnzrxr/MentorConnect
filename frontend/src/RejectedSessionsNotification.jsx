import React, { useState, useEffect } from 'react';

function RejectedSessionsNotification({ menteeId }) {
  const [rejectedSessions, setRejectedSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedSessions, setDismissedSessions] = useState(new Set());

  useEffect(() => {
    if (menteeId) {
      fetchRejectedSessions();
    }
  }, [menteeId]);

  const fetchRejectedSessions = async () => {
    try {
      const response = await fetch(`http://localhost:5175/api/mentee/${menteeId}/rejected-sessions`);
      const result = await response.json();
      if (result.success) {
        setRejectedSessions(result.rejectedSessions);
      }
    } catch (error) {
      console.error('Error fetching rejected sessions:', error);
    }
    setLoading(false);
  };

  const dismissNotification = (sessionId) => {
    setDismissedSessions(prev => new Set([...prev, sessionId]));
  };

  const visibleRejectedSessions = rejectedSessions.filter(
    session => !dismissedSessions.has(session.id)
  );

  if (loading || visibleRejectedSessions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {visibleRejectedSessions.map((session) => (
        <div
          key={session.id}
          className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-triangle text-red-500 text-xl mr-3"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Session Request Rejected
                  </h3>
                  <p className="text-sm text-red-700">
                    Your request for "{session.topic}" has been declined
                  </p>
                </div>
              </div>

              <div className="ml-8 space-y-2">
                <div className="flex items-center text-sm text-red-700">
                  <img
                    className="h-6 w-6 rounded-full mr-2"
                    src={session.mentor_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentor_name)}&background=EF4444&color=fff`}
                    alt={session.mentor_name}
                  />
                  <span>Rejected by <strong>{session.mentor_name}</strong></span>
                </div>

                <div className="text-sm text-red-700">
                  <span className="font-medium">Original Schedule:</span>{' '}
                  {new Date(session.schedule).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {session.reject_reason && (
                  <div className="bg-red-100 rounded-md p-3 mt-3">
                    <p className="text-sm font-medium text-red-900 mb-1">
                      Reason for rejection:
                    </p>
                    <p className="text-sm text-red-800">
                      {session.reject_reason}
                    </p>
                  </div>
                )}

                <div className="text-xs text-red-600 mt-2">
                  Rejected on {new Date(session.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => dismissNotification(session.id)}
              className="ml-4 text-red-400 hover:text-red-600 transition-colors"
              title="Dismiss notification"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          <div className="mt-4 ml-8 flex space-x-3">
            <button
              onClick={() => dismissNotification(session.id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                // Navigate to find mentors to try again
                if (window.location.hash) {
                  window.location.hash = '#mentors';
                } else {
                  // Trigger parent component to change tab
                  const event = new CustomEvent('changeMenteeTab', { detail: 'mentors' });
                  window.dispatchEvent(event);
                }
                dismissNotification(session.id);
              }}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-search mr-1"></i>
              Find Another Mentor
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default RejectedSessionsNotification;
