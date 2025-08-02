import React, { useState } from 'react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentee',
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok');
      return;
    }

    try {
      const response = await fetch('http://localhost:5175/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Pendaftaran berhasil! Anda sekarang dapat masuk.');
        setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'mentee' });
        // Redirect ke login page setelah register sukses
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500); // beri jeda 1.5 detik agar user lihat pesan sukses
      } else {
        setError(data.error || 'Pendaftaran gagal');
      }
    } catch (err) {
      setError('Kesalahan saat menghubungi server');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Daftar</h2>
        {message && <p className="mb-4 text-green-600">{message}</p>}
        {error && <p className="mb-4 text-red-600">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">Nama</label>
            <input
              type="text"
              id="name"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Nama lengkap Anda"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="anda@contoh.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 mb-2">Kata Sandi</label>
            <input
              type="password"
              id="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="block text-gray-700 mb-2">Peran</label>
            <select
              id="role"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="mentee">Mentee</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-blue-600">Daftar</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
