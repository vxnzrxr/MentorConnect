import React, { useState, useEffect } from 'react';
import SessionRequestModal from './SessionRequestModal';

function MentorSearchPage() {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSessionRequest, setShowSessionRequest] = useState(false);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('http://localhost:5175/api/mentors');
      const result = await response.json();
      if (result.success) {
        setMentors(result.mentors);
        setFilteredMentors(result.mentors);
        
        // Extract all unique skills
        const skills = new Set();
        result.mentors.forEach(mentor => {
          if (mentor.skills) {
            mentor.skills.split(',').forEach(skill => skills.add(skill.trim()));
          }
        });
        setAllSkills(Array.from(skills));
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
    setLoading(false);
  };

  const fetchMentorProfile = async (mentorId) => {
    try {
      const response = await fetch(`http://localhost:5175/api/mentor-profile/${mentorId}`);
      const result = await response.json();
      if (result.success) {
        setMentorProfile(result.mentor);
        setShowProfile(true);
      }
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    filterMentors(query, skillFilter);
  };

  const handleSkillFilter = (skill) => {
    setSkillFilter(skill);
    filterMentors(searchQuery, skill);
  };

  const filterMentors = (query, skill) => {
    let filtered = mentors;

    if (query) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(query.toLowerCase()) ||
        mentor.bio?.toLowerCase().includes(query.toLowerCase()) ||
        mentor.skills?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (skill) {
      filtered = filtered.filter(mentor =>
        mentor.skills?.toLowerCase().includes(skill.toLowerCase())
      );
    }

    setFilteredMentors(filtered);
  };

  const handleViewProfile = (mentor) => {
    setSelectedMentor(mentor);
    fetchMentorProfile(mentor.id);
  };

  const handleRequestSession = (mentor) => {
    setSelectedMentor(mentor);
    setShowSessionRequest(true);
  };

  const MentorCard = ({ mentor }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <img
          className="h-16 w-16 rounded-full object-cover"
          src={mentor.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}&background=4F46E5&color=fff`}
          alt={mentor.name}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
          <p className="text-gray-600 text-sm">{mentor.bio || 'Experienced mentor'}</p>
          {mentor.average_rating && (
            <div className="flex items-center mt-1">
              <div className="flex text-yellow-400">
                {[...Array(Math.floor(mentor.average_rating))].map((_, i) => (
                  <i key={i} className="fas fa-star text-sm"></i>
                ))}
                {mentor.average_rating % 1 !== 0 && (
                  <i className="fas fa-star-half-alt text-sm"></i>
                )}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                {mentor.average_rating.toFixed(1)} ({mentor.feedback_count || 0} reviews)
              </span>
            </div>
          )}
        </div>
      </div>
      
      {mentor.skills && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
          <div className="flex flex-wrap gap-2">
            {mentor.skills.split(',').slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {skill.trim()}
              </span>
            ))}
            {mentor.skills.split(',').length > 5 && (
              <span className="text-xs text-gray-500">
                +{mentor.skills.split(',').length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => handleViewProfile(mentor)}
          className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
        >
          <i className="fas fa-user mr-2"></i>
          View Profile
        </button>
        <button
          onClick={() => handleRequestSession(mentor)}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <i className="fas fa-calendar-plus mr-2"></i>
          Request Session
        </button>
      </div>
    </div>
  );

  const MentorProfileModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mentor Profile</h2>
          <button
            onClick={() => setShowProfile(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>
        
        {mentorProfile && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-center space-x-6">
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={mentorProfile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorProfile.name)}&background=4F46E5&color=fff`}
                alt={mentorProfile.name}
              />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{mentorProfile.name}</h3>
                <p className="text-gray-600">{mentorProfile.email}</p>
                <p className="text-gray-700 mt-2">{mentorProfile.bio}</p>
                
                {mentorProfile.average_rating && (
                  <div className="flex items-center mt-3">
                    <div className="flex text-yellow-400">
                      {[...Array(Math.floor(mentorProfile.average_rating))].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                      {mentorProfile.average_rating % 1 !== 0 && (
                        <i className="fas fa-star-half-alt"></i>
                      )}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {mentorProfile.average_rating.toFixed(1)} average rating from {mentorProfile.feedback_count || 0} reviews
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {mentorProfile.skills && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Skills & Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {mentorProfile.skills.split(',').map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Session Statistics */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">Mentoring Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-900">
                    {mentorProfile.completed_sessions || 0}
                  </div>
                  <div className="text-sm text-blue-600">Completed Sessions</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-900">
                    {mentorProfile.total_mentees || 0}
                  </div>
                  <div className="text-sm text-green-600">Total Mentees</div>
                </div>
              </div>
            </div>

            {/* Recent Feedback */}
            {mentorProfile.recent_feedback && mentorProfile.recent_feedback.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Recent Feedback</h4>
                <div className="space-y-3">
                  {mentorProfile.recent_feedback.slice(0, 3).map((feedback, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(feedback.rating)].map((_, i) => (
                            <i key={i} className="fas fa-star text-sm"></i>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{feedback.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">- {feedback.mentee_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowProfile(false);
                  handleRequestSession(selectedMentor);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                <i className="fas fa-calendar-plus mr-2"></i>
                Request Session with {mentorProfile.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="spinner-border" role="status">
          <span className="sr-only">Memuat...</span>
        </div>
        <p className="mt-4 text-gray-600">Memuat mentor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cari Mentor</h1>
        <p className="mt-2 text-gray-600">
          Temukan mentor berpengalaman yang dapat membimbing Anda dalam perjalanan pembelajaran
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search by name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Mentor
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama, keahlian, atau keahlian..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
          </div>

          {/* Filter by skill */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter berdasarkan Keahlian
            </label>
            <select
              value={skillFilter}
              onChange={(e) => handleSkillFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Keahlian</option>
              {allSkills.map((skill, idx) => (
                <option key={idx} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(searchQuery || skillFilter) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Cari: "{searchQuery}"
                <button
                  onClick={() => handleSearch('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
            {skillFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Keahlian: {skillFilter}
                <button
                  onClick={() => handleSkillFilter('')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredMentors.length} mentor ditemukan
          </h2>
        </div>

        {filteredMentors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-user-tie text-6xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Tidak ada mentor ditemukan</h3>
            <p className="text-gray-500 mb-4">
              Coba sesuaikan kriteria pencarian Anda atau jelajahi semua mentor yang tersedia.
            </p>
            <button
              onClick={() => {
                handleSearch('');
                handleSkillFilter('');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Tampilkan Semua Mentor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showProfile && <MentorProfileModal />}
      {showSessionRequest && (
        <SessionRequestModal
          mentor={selectedMentor}
          onClose={() => setShowSessionRequest(false)}
          onSuccess={() => {
            setShowSessionRequest(false);
            alert('Session request sent successfully!');
          }}
        />
      )}
    </div>
  );
}

export default MentorSearchPage;
