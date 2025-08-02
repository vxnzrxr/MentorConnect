import React, { useState } from 'react';

function SessionRequestModal({ mentor, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    date: '',
    time: '',
    skills_to_learn: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const menteeEmail = localStorage.getItem('userEmail');
      const requestData = {
        mentor_id: mentor.id,
        mentee_email: menteeEmail,
        topic: formData.topic,
        description: formData.description,
        schedule: `${formData.date} ${formData.time}`,
        skills_to_learn: formData.skills_to_learn,
        message: formData.message,
        status: 'pending'
      };

      const response = await fetch('http://localhost:5175/api/session-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      
      if (result.success) {
        onSuccess();
      } else {
        alert(result.error || 'Failed to send session request');
      }
    } catch (error) {
      console.error('Error sending session request:', error);
      alert('An error occurred while sending the request');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Minta Sesi dengan {mentor?.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topik Sesi *
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              placeholder="mis., Dasar React, Pengembangan Backend Node.js"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Sesi *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Jelaskan apa yang ingin Anda pelajari dalam sesi ini..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Diinginkan *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu Diinginkan *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Skills to Learn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keahlian yang Dipelajari
            </label>
            <input
              type="text"
              name="skills_to_learn"
              value={formData.skills_to_learn}
              onChange={handleChange}
              placeholder="React, JavaScript, Integrasi API (dipisahkan koma)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Pisahkan beberapa keahlian dengan koma</p>
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan untuk Mentor
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Informasi tambahan atau permintaan khusus untuk mentor..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Mentor Info Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Ringkasan Permintaan</h4>
            <div className="flex items-center space-x-3">
              <img
                className="h-10 w-10 rounded-full"
                src={mentor?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor?.name || '')}&background=4F46E5&color=fff`}
                alt={mentor?.name}
              />
              <div>
                <p className="font-medium text-blue-900">{mentor?.name}</p>
                <p className="text-sm text-blue-700">{mentor?.bio || 'Mentor berpengalaman'}</p>
                {mentor?.skills && (
                  <p className="text-xs text-blue-600">
                    Keahlian: {mentor.skills.split(',').slice(0, 3).map(s => s.trim()).join(', ')}
                    {mentor.skills.split(',').length > 3 && '...'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Mengirim Permintaan...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Kirim Permintaan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SessionRequestModal;
