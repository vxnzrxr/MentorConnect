import React, { useState } from 'react';

const departments = ['IT', 'HR', 'Finance', 'Marketing'];
const experienceYears = [1, 2, 3, 5, 10];
const skillsList = ['React.js', 'Node.js', 'Communication', 'Leadership', 'Python', 'Design'];

function MentorSearch({ mentors, onViewProfile, onRequestSession }) {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [experience, setExperience] = useState('');
  const [skill, setSkill] = useState('');

  // Filter logic
  const filteredMentors = mentors.filter(m => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchDept = department ? m.department === department : true;
    const matchExp = experience ? m.experience >= experience : true;
    const matchSkill = skill ? m.skills.includes(skill) : true;
    return matchSearch && matchDept && matchExp && matchSkill;
  });

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Cari nama mentor atau keahlian..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-1/3"
        />
        <select
          value={department}
          onChange={e => setDepartment(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-1/5"
        >
          <option value="">Departemen</option>
          {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>
        <select
          value={experience}
          onChange={e => setExperience(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-1/5"
        >
          <option value="">Tahun Pengalaman</option>
          {experienceYears.map((y, i) => <option key={i} value={y}>{y}+ tahun</option>)}
        </select>
        <select
          value={skill}
          onChange={e => setSkill(e.target.value)}
          className="border rounded px-3 py-2 w-full sm:w-1/5"
        >
          <option value="">Skill Spesifik</option>
          {skillsList.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMentors.length === 0 ? (
          <div className="col-span-3 text-gray-500">Mentor tidak ditemukan.</div>
        ) : (
          filteredMentors.map((mentor, idx) => (
            <div key={idx} className="bg-white shadow rounded-lg overflow-hidden flex flex-col w-full h-full">
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{mentor.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{mentor.position}</p>
                <div className="mb-2 flex flex-wrap gap-2">
                  {mentor.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{skill}</span>
                  ))}
                </div>
                <div className="mt-auto flex gap-2">
                  <button
                    className="px-3 py-2 bg-primary text-white rounded shadow"
                    onClick={() => onViewProfile(mentor)}
                  >Lihat Profil</button>
                  <button
                    className="px-3 py-2 bg-green-600 text-white rounded shadow"
                    onClick={() => onRequestSession(mentor)}
                  >Ajukan Sesi</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MentorSearch;
