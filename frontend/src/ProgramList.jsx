import React, { useState } from 'react';

function ProgramList({ programs, onRegister }) {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRegisterClick = (program) => {
    setSelectedProgram(program);
    setShowModal(true);
  };

  const handleConfirm = () => {
    onRegister(selectedProgram);
    setShowModal(false);
    setSelectedProgram(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedProgram(null);
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Program Mentoring Tersedia</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-calendar-plus text-6xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Belum Ada Program Tersedia</h3>
            <p className="text-gray-500 mb-4">Program mentoring yang dibuat oleh mentor akan muncul di sini.</p>
            <p className="text-sm text-gray-400">Periksa kembali nanti atau hubungi mentor untuk membuat program baru.</p>
          </div>
        ) : (
          programs.map((program, idx) => (
            <div key={idx} className="flex h-full">
              <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col w-full h-full">
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{program.topic}</h3>
                  {/* Mentor Info */}
                  <div className="flex items-center mb-2">
                    <img className="h-8 w-8 rounded-full" src={program.mentor_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(program.mentor_name || '')} alt="Mentor" />
                    <div className="ml-2">
                      <span className="text-sm font-semibold text-gray-700">{program.mentor_name}</span>
                      <span className="block text-xs text-gray-500">{program.mentor_expertise}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <i className="fas fa-calendar-alt mr-1"></i>
                    Tanggal: {new Date(program.schedule).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <i className="fas fa-clock mr-1"></i>
                    Jam: {new Date(program.schedule).toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      timeZone: 'Asia/Jakarta'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                  
                  {/* Skills Section */}
                  {program.skills_to_learn && (
                    <div className="mb-3">
                      <div className="flex items-center text-xs text-purple-600 mb-1">
                        <i className="fas fa-lightbulb mr-2"></i>
                        <span className="font-medium">Skills yang akan dipelajari:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {program.skills_to_learn.split(',').map((skill, idx) => (
                          <span key={idx} className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Links Section */}
                  {(program.zoom_link || program.material_link) && (
                    <div className="space-y-2 mb-3">
                      {program.zoom_link && (
                        <div className="flex items-center text-xs text-blue-600">
                          <i className="fas fa-video mr-2"></i>
                          <span>Zoom Meeting Tersedia</span>
                        </div>
                      )}
                      {program.material_link && (
                        <div className="flex items-center text-xs text-green-600">
                          <i className="fas fa-book mr-2"></i>
                          <span>Materi Pembelajaran Tersedia</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Status Program */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      program.mentee_id 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {program.mentee_id ? 'Program Penuh' : 'Masih Tersedia'}
                    </span>
                    <span className="text-gray-500">
                      Slot: {program.mentee_id ? '1/1' : '0/1'}
                    </span>
                  </div>
                  <div className="mt-auto">
                    <button
                      className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        program.mentee_id 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-primary hover:bg-blue-600'
                      }`}
                      onClick={() => handleRegisterClick(program)}
                      disabled={program.mentee_id}
                    >
                      {program.mentee_id ? 'Program Penuh' : 'Daftar Program'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Apakah kamu ingin mengikuti sesi mentoring ini?</h2>
            <div className="mb-4">
              <p className="text-gray-700 font-semibold">{selectedProgram?.topic}</p>
              <p className="text-gray-500">Mentor: {selectedProgram?.mentor_name}</p>
              
              {/* Show available links */}
              {(selectedProgram?.zoom_link || selectedProgram?.material_link) && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">Tersedia untuk program ini:</p>
                  <div className="space-y-1">
                    {selectedProgram?.zoom_link && (
                      <div className="flex items-center text-sm text-blue-700">
                        <i className="fas fa-video mr-2"></i>
                        <span>Link Zoom Meeting</span>
                      </div>
                    )}
                    {selectedProgram?.material_link && (
                      <div className="flex items-center text-sm text-green-700">
                        <i className="fas fa-book mr-2"></i>
                        <span>Materi Pembelajaran</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Link akan dapat diakses setelah mendaftar program.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={handleCancel}>Tidak</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleConfirm}>Iya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgramList;
