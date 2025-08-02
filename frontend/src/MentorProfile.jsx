import React, { useEffect, useState } from 'react';

const MentorProfile = ({ user, onProfileUpdated }) => {
  const [form, setForm] = useState({ name: '', bio: '', skills: '', interests: '', profile_picture: '', email: '' });
  const [message, setMessage] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [isValidAccess, setIsValidAccess] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');
    
    // Pastikan user adalah mentor
    if (!email || userRole !== 'mentor') {
      console.error('No valid mentor session found');
      setIsValidAccess(false);
      setMessage('Anda tidak memiliki akses ke halaman mentor. Silakan login sebagai mentor.');
      return;
    }
    
    setIsValidAccess(true);
    
    fetch(`http://localhost:5175/api/profile?email=${email}&role=mentor`)
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setForm({...data.user, email}); // Pastikan email form sama dengan localStorage
          setHasData(
            !!(data.user.name || data.user.bio || data.user.skills || data.user.interests || data.user.profile_picture)
          );
        } else {
          // Jika tidak ada data user, set email dari localStorage
          setForm(prev => ({...prev, email}));
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setForm(prev => ({...prev, email}));
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = localStorage.getItem('userEmail');
      const payload = {
        name: form.name || '',
        bio: form.bio || '',
        skills: form.skills || '',
        interests: form.interests || '',
        profile_picture: form.profile_picture || '',
        email: email,
        role: 'mentor', // Tambahkan role untuk endpoint yang benar
      };
      
      // Langsung gunakan PUT untuk update profile
      const res = await fetch('http://localhost:5175/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage('Profil berhasil disimpan!');
        setIsEdit(false);
        setHasData(true);
        if (onProfileUpdated) onProfileUpdated();
      } else {
        setMessage(result?.error || 'Gagal menyimpan profil.');
      }
    } catch (err) {
      setMessage('Terjadi kesalahan: ' + err.message);
    }
  };

  // Jika akses tidak valid, tampilkan pesan error
  if (!isValidAccess) {
    return (
      <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded">
        <h2 className="text-2xl font-bold mb-4">Akses Ditolak</h2>
        <p>{message}</p>
        <button 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
        >
          Logout dan Kembali ke Login
        </button>
      </div>
    );
  }

  if (!hasData || isEdit) {
    // Tampilkan form jika data kosong atau sedang edit
    return (
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Profil Mentor</h2>
        {message && <div className="mb-4 text-green-600">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Nama Lengkap</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Keahlian (pisahkan dengan koma)</label>
            <input type="text" name="skills" value={form.skills} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <input type="hidden" name="interests" value={form.interests} />
          <input type="hidden" name="profile_picture" value={form.profile_picture} />
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Kontak Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
          {hasData && (
            <button type="button" className="ml-4 px-4 py-2 rounded border" onClick={() => setIsEdit(false)}>Batal</button>
          )}
        </form>
      </div>
    );
  }

  // Tampilkan data profil (read-only)
  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profil Mentor</h2>
      {message && <div className="mb-4 text-green-600">{message}</div>}
      <div className="mb-4"><b>Nama Lengkap:</b> {form.name}</div>
      <div className="mb-4"><b>Bio:</b> {form.bio}</div>
      <div className="mb-4"><b>Keahlian:</b> {form.skills}</div>
      <div className="mb-4"><b>Email:</b> {form.email}</div>
      <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={() => setIsEdit(true)}>Edit</button>
    </div>
  );
};

export default MentorProfile;
