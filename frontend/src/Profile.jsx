import React, { useEffect, useState } from 'react';

const ALL_SKILLS = [
  'Python', 'Java', 'JavaScript', 'C++', 'C#', 'Go', 'Ruby', 'PHP', 'SQL', 'HTML', 'CSS', 'React', 'Node.js', 'Kotlin', 'Swift', 'Dart', 'TypeScript', 'Other'
];

function Profile({ user }) {
  const [profile, setProfile] = useState(user || null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(user || null);

  useEffect(() => {
    if (!user) {
      fetch('http://localhost:5175/api/profile')
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setForm(data);
        });
    }
  }, [user]);

  if (!profile || !form) return <div className="text-center py-10">Memuat...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSkillChange = (skill, checked) => {
    if (profile.role === 'Mentor') {
      setForm(f => ({
        ...f,
        skills: checked ? [...(f.skills || []), skill] : (f.skills || []).filter(s => s !== skill),
      }));
    } else {
      setForm(f => ({
        ...f,
        desiredSkills: checked ? [...(f.desiredSkills || []), skill] : (f.desiredSkills || []).filter(s => s !== skill),
      }));
    }
  };

  const handleSkillDurationChange = (skill, value) => {
    setForm(f => ({
      ...f,
      skillDurations: { ...f.skillDurations, [skill]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Kirim data ke backend
    setProfile(form);
    setEdit(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-8 mt-8">
      <div className="flex flex-col md:flex-row md:items-center mb-8 gap-6">
        <img src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`} alt="avatar" className="h-28 w-28 rounded-full border-4 border-primary shadow" />
        <div>
          <div className="text-3xl font-bold text-primary mb-1">{profile.name}</div>
          <div className="text-gray-600 text-base mb-1">{profile.role}</div>
          <div className="text-gray-500 text-sm mb-2">{profile.department}</div>
          <div className="flex gap-2 mt-2">
            {profile.social && profile.social.split(',').map((s, i) => (
              <a key={i} href={s.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm">{s.trim()}</a>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg">Tentang</div>
            <div className="text-gray-700 text-base">{profile.bio || '-'}</div>
          </div>
          {profile.role === 'Mentor' ? (
            <>
              <div className="mb-4">
                <div className="font-semibold mb-1 text-lg">Keahlian yang Dikuasai</div>
                <div className="flex flex-wrap gap-2">
                  {(profile.skills || []).map(s => (
                    <span key={s} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <div className="font-semibold mb-1 text-lg">Lama Menguasai Keahlian</div>
                <ul className="text-gray-700 text-base list-disc ml-5">
                  {profile.skills && profile.skillDurations && profile.skills.map(s => (
                    <li key={s}>{s}: {profile.skillDurations[s] || '-'} tahun</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <div className="font-semibold mb-1 text-lg">Keahlian yang Ingin Dikuasai</div>
              <div className="flex flex-wrap gap-2">
                {(profile.desiredSkills || []).map(s => (
                  <span key={s} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="mb-4">
            <div className="font-semibold mb-1 text-lg">Nama Lengkap</div>
            <div className="text-gray-700 text-base">{profile.name}</div>
          </div>
          <button className="mt-4 px-4 py-2 bg-primary text-white rounded" onClick={() => setEdit(true)}>Edit Profil</button>
        </div>
      </div>
      {edit && (
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="mb-4">
            <label className="font-semibold mb-1 block">Nama Lengkap</label>
            <input name="name" value={form.name || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="mb-4">
            <label className="font-semibold mb-1 block">Tentang</label>
            <textarea name="bio" value={form.bio || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          <div className="mb-4">
            <label className="font-semibold mb-1 block">Email</label>
            <input name="social" value={form.social || ''} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
          </div>
          {profile.role === 'Mentor' ? (
            <>
              <div className="mb-4">
                <label className="font-semibold mb-1 block">Keahlian yang Dikuasai</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILLS.map(skill => (
                    <label key={skill} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={(form.skills || []).includes(skill)}
                        onChange={e => handleSkillChange(skill, e.target.checked)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="font-semibold mb-1 block">Lama Menguasai Keahlian (tahun)</label>
                <div className="space-y-2">
                  {(form.skills || []).map(skill => (
                    <div key={skill} className="flex items-center gap-2">
                      <span className="w-32">{skill}</span>
                      <input
                        type="number"
                        min="0"
                        className="border rounded px-2 py-1 w-20"
                        value={form.skillDurations?.[skill] || ''}
                        onChange={e => handleSkillDurationChange(skill, e.target.value)}
                      />
                      <span>tahun</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label className="font-semibold mb-1 block">Keahlian yang Ingin Dikuasai</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SKILLS.map(skill => (
                  <label key={skill} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={(form.desiredSkills || []).includes(skill)}
                      onChange={e => handleSkillChange(skill, e.target.checked)}
                    />
                    <span>{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Simpan</button>
            <button type="button" className="px-4 py-2 bg-gray-300 text-gray-700 rounded" onClick={() => { setEdit(false); setForm(profile); }}>Batal</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;
