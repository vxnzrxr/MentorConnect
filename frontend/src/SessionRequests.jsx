import React, { useState, useEffect } from 'react';

function SessionRequests({ mentorId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [rescheduleModal, setRescheduleModal] = useState({ show: false, sessionId: null, currentSchedule: '' });
  const [rejectModal, setRejectModal] = useState({ show: false, sessionId: null });
  const [approveModal, setApproveModal] = useState({ show: false, sessionId: null, sessionData: null });

  console.log('SessionRequests component received mentorId:', mentorId);

  useEffect(() => {
    if (mentorId) {
      fetchRequests();
    } else {
      setLoading(false);
      setError('ID Mentor tidak tersedia');
    }
  }, [mentorId]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    
    console.log('Fetching requests for mentorId:', mentorId);
    
    try {
      const response = await fetch(`http://localhost:5175/api/mentor/${mentorId}/session-requests`);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Received result:', result);
      
      if (result.success) {
        setRequests(result.requests || []);
        console.log('Set requests to:', result.requests || []);
      } else {
        setError(result.error || 'Gagal mengambil permintaan');
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching session requests:', error);
      setError(error.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };
  const handleAction = async (sessionId, action, newSchedule = null, rejectReason = null, zoomLink = null, materialLink = null) => {
    setActionLoading(prev => ({ ...prev, [sessionId]: true }));
    
    try {
      const requestBody = { action };
      if (newSchedule) requestBody.schedule = newSchedule;
      if (rejectReason) requestBody.reject_reason = rejectReason;
      if (zoomLink) requestBody.zoom_link = zoomLink;
      if (materialLink) requestBody.material_link = materialLink;
      
      const response = await fetch(`http://localhost:5175/api/session-requests/${sessionId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      if (result.success) {
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req.id !== sessionId));
        
        if (action === 'approve') {
          const message = newSchedule ? 'Session approved with new schedule!' : 'Session approved!';
          alert(message);
        } else {
          alert('Permintaan sesi ditolak.');
        }
      } else {
        alert('Gagal memproses permintaan: ' + (result.error || 'Kesalahan tidak diketahui'));
      }
    } catch (error) {
      console.error('Error processing request:', error);
      alert('Terjadi kesalahan saat memproses permintaan');
    }
    
    setActionLoading(prev => ({ ...prev, [sessionId]: false }));
    setRescheduleModal({ show: false, sessionId: null, currentSchedule: '' });
    setRejectModal({ show: false, sessionId: null });
    setApproveModal({ show: false, sessionId: null, sessionData: null });
  };

  const openRescheduleModal = (sessionId, currentSchedule) => {
    setRescheduleModal({ 
      show: true, 
      sessionId, 
      currentSchedule: new Date(currentSchedule).toISOString().slice(0, 16)
    });
  };

  const openApproveModal = (sessionId, sessionData) => {
    setApproveModal({
      show: true,
      sessionId,
      sessionData
    });
  };

  const openRejectModal = (sessionId) => {
    setRejectModal({ show: true, sessionId });
  };

  const handleApprove = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const zoomLink = formData.get('zoomLink');
    const materialLink = formData.get('materialLink');
    
    handleAction(approveModal.sessionId, 'approve', null, null, zoomLink, materialLink);
  };

  const handleReschedule = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSchedule = formData.get('newSchedule');
    handleAction(rescheduleModal.sessionId, 'approve', newSchedule);
  };

  const handleReject = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rejectReason = formData.get('rejectReason');
    handleAction(rejectModal.sessionId, 'reject', null, rejectReason);
  };

  if (!mentorId) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <i className="fas fa-exclamation-triangle text-3xl"></i>
        </div>
        <div>Mentor ID tidak tersedia</div>
        <div className="text-sm text-gray-500 mt-2">Silakan refresh halaman atau login ulang</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
        <div>Memuat permintaan sesi...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <i className="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <div>Gagal memuat permintaan sesi</div>
          <div className="text-sm mt-2">{error}</div>
        </div>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Permintaan Sesi</h2>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sync-alt"></i>
            Refresh
          </button>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-inbox text-6xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak Ada Permintaan Tertunda</h3>
            <p className="text-gray-500">
              Ketika mentee meminta sesi dengan Anda, mereka akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Request Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={request.mentee_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.mentee_name)}&background=10B981&color=fff`}
                        alt={request.mentee_name}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.topic}</h3>
                        <p className="text-sm text-gray-600">
                          Diminta oleh <span className="font-medium">{request.mentee_name}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Deskripsi:</h4>
                        <p className="text-sm text-gray-600">{request.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Jadwal Diminta:</h4>
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-calendar mr-2"></i>
                            {new Date(request.schedule).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-clock mr-2"></i>
                            {new Date(request.schedule).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'Asia/Jakarta'
                            })}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Kontak:</h4>
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-envelope mr-2"></i>
                            {request.mentee_email}
                          </p>
                        </div>
                      </div>

                      {request.skills_to_learn && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Keahlian yang Dipelajari:</h4>
                          <div className="flex flex-wrap gap-1">
                            {request.skills_to_learn.split(',').map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex flex-col space-y-2 min-w-[200px]">
                    <button
                      onClick={() => openApproveModal(request.id, request)}
                      disabled={actionLoading[request.id]}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {actionLoading[request.id] ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-check mr-2"></i>
                      )}
                      Setujui
                    </button>
                    
                    <button
                      onClick={() => openRescheduleModal(request.id, request.schedule)}
                      disabled={actionLoading[request.id]}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      <i className="fas fa-calendar-alt mr-2"></i>
                      Jadwal Ulang & Setujui
                    </button>
                    
                    <button
                      onClick={() => openRejectModal(request.id)}
                      disabled={actionLoading[request.id]}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {actionLoading[request.id] ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-times mr-2"></i>
                      )}
                      Tolak
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approveModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Setujui Permintaan Sesi</h3>
              <button
                onClick={() => setApproveModal({ show: false, sessionId: null, sessionData: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {approveModal.sessionData && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Detail Sesi</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p><span className="font-medium">Topik:</span> {approveModal.sessionData.topic}</p>
                  <p><span className="font-medium">Mentee:</span> {approveModal.sessionData.mentee_name}</p>
                  <p><span className="font-medium">Jadwal:</span> {new Date(approveModal.sessionData.schedule).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                  {approveModal.sessionData.description && (
                    <p><span className="font-medium">Deskripsi:</span> {approveModal.sessionData.description}</p>
                  )}
                </div>
              </div>
            )}
            
            <form onSubmit={handleApprove}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-video text-blue-500 mr-2"></i>
                    Link Zoom Meeting (Opsional)
                  </label>
                  <input
                    type="url"
                    name="zoomLink"
                    placeholder="https://zoom.us/j/1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Berikan link Zoom meeting untuk sesi ini
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-book text-purple-500 mr-2"></i>
                    Link Materi Pembelajaran (Opsional)
                  </label>
                  <input
                    type="url"
                    name="materialLink"
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Bagikan materi pembelajaran, dokumen, atau sumber daya untuk sesi ini
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <i className="fas fa-info-circle text-blue-500 mt-0.5 mr-2 flex-shrink-0"></i>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Catatan:</p>
                      <ul className="list-disc ml-4 space-y-0.5">
                        <li>Link ini akan dibagikan kepada mentee setelah disetujui</li>
                        <li>Anda dapat mengosongkan field ini dan membagikan link nanti</li>
                        <li>Mentee akan menerima notifikasi tentang sesi yang disetujui</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setApproveModal({ show: false, sessionId: null, sessionData: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <i className="fas fa-check mr-2"></i>
                  Setujui Sesi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Reschedule Session</h3>
              <button
                onClick={() => setRescheduleModal({ show: false, sessionId: null, currentSchedule: '' })}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleReschedule}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Schedule
                </label>
                <input
                  type="datetime-local"
                  name="newSchedule"
                  defaultValue={rescheduleModal.currentSchedule}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModal({ show: false, sessionId: null, currentSchedule: '' })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Approve with New Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tolak Permintaan Sesi</h3>
              <button
                onClick={() => setRejectModal({ show: false, sessionId: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleReject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan *
                </label>
                <textarea
                  name="rejectReason"
                  required
                  rows={4}
                  placeholder="Mohon berikan alasan penolakan untuk permintaan sesi ini..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mentee akan melihat alasan ini, jadi mohon berikan yang konstruktif dan membantu.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectModal({ show: false, sessionId: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <i className="fas fa-times mr-2"></i>
                  Tolak Permintaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionRequests;
