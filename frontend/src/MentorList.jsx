import React, { useEffect, useState } from 'react';

function MentorList() {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5175/api/mentors')
      .then(res => res.json())
      .then(data => {
        setMentors(data);
        // Kumpulkan semua skill unik
        const allSkills = Array.from(new Set(data.flatMap(m => m.skills)));
        setSkills(allSkills);
      });
  }, []);

  const filteredMentors = mentors.filter(m =>
    (m.name.toLowerCase().includes(search.toLowerCase())) &&
    (skill === '' || m.skills.includes(skill))
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Daftar Mentor</h2>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari nama mentor..."
          className="border rounded px-3 py-2 w-1/3"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={skill}
          onChange={e => setSkill(e.target.value)}
        >
          <option value="">Semua Keahlian</option>
          {skills.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map(mentor => (
          <div key={mentor.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center mb-2">
              <img src={mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name)}`} alt="avatar" className="h-12 w-12 rounded-full mr-3" />
              <div>
                <div className="font-semibold text-lg">{mentor.name}</div>
                <div className="text-gray-500 text-sm">{mentor.department}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700 mb-2">{mentor.bio}</div>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.map(s => (
                <span key={s} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{s}</span>
              ))}
            </div>
          </div>
        ))}
        {filteredMentors.length === 0 && <div className="col-span-full text-center text-gray-400">Mentor tidak ditemukan.</div>}
      </div>
    </div>
  );
}

export default MentorList;
