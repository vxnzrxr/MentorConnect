import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import MenteeDashboard from "./MenteeDashboard";
import MentorDashboard from "./MentorDashboard";

function Navbar() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const toggleMobileMenu = () => {
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.classList.toggle('hidden');
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">MentorConnect</span>
            </div>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Fitur</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">Cara Kerja</button>
            <Link to="/login" className="ml-4 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Masuk
            </Link>
            <Link to="/register" className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-primary border border-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              Daftar
            </Link>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMobileMenu} className="mobile-menu-button p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className="md:hidden hidden mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button onClick={() => { scrollToSection('features'); toggleMobileMenu(); }} className="text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium w-full text-left">Fitur</button>
          <button onClick={() => { scrollToSection('how-it-works'); toggleMobileMenu(); }} className="text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium w-full text-left">Cara Kerja</button>
          <Link to="/login" className="text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Masuk</Link>
          <Link to="/register" className="text-gray-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium">Daftar</Link>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname === "/";

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      {showNavbar && <Navbar />}
      <div className="bg-gray-50 min-h-screen font-sans">
        <Routes>
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section className="pt-20 pb-32 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                  <div className="text-center">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                      <span className="block">Transformasi Perjalanan Belajar Anda</span>
                      <span className="block text-primary">Dengan Bimbingan Ahli</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                      Terhubung dengan mentor berpengalaman, jadwalkan sesi personal, dan percepat pertumbuhan Anda di bidang yang Anda pilih.
                    </p>
                    <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                      <div className="rounded-md shadow">
                        <Link to="/register" className="w-full flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 md:py-3 md:text-base md:px-8">
                          Mulai Sekarang
                        </Link>
                      </div>
                      <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                        <button onClick={() => scrollToSection('features')} className="w-full flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-primary bg-white hover:bg-gray-50 md:py-3 md:text-base md:px-8">
                          Pelajari Lebih Lanjut
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                      Fitur yang Memberdayakan Pembelajaran Anda
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                      Semua yang Anda butuhkan untuk terhubung dengan mentor dan mempercepat pertumbuhan Anda.
                    </p>
                  </div>

                  <div className="mt-20">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Feature 1 */}
                      <div className="pt-6">
                        <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                          <div className="-mt-6">
                            <div>
                              <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                                <i className="fas fa-users text-white text-2xl"></i>
                              </span>
                            </div>
                            <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Mentor Ahli</h3>
                            <p className="mt-5 text-base text-gray-500">
                              Terhubung dengan profesional berpengalaman yang bersemangat berbagi pengetahuan mereka.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Feature 2 */}
                      <div className="pt-6">
                        <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                          <div className="-mt-6">
                            <div>
                              <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                                <i className="fas fa-calendar-alt text-white text-2xl"></i>
                              </span>
                            </div>
                            <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Penjadwalan Fleksibel</h3>
                            <p className="mt-5 text-base text-gray-500">
                              Pesan sesi sesuai kenyamanan Anda dengan sistem penjadwalan yang mudah digunakan.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Feature 3 */}
                      <div className="pt-6">
                        <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                          <div className="-mt-6">
                            <div>
                              <span className="inline-flex items-center justify-center p-3 bg-primary rounded-md shadow-lg">
                                <i className="fas fa-star text-white text-2xl"></i>
                              </span>
                            </div>
                            <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Sistem Feedback</h3>
                            <p className="mt-5 text-base text-gray-500">
                              Berikan dan terima feedback untuk memastikan perbaikan berkelanjutan dalam perjalanan belajar Anda.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Statistics Section */}
              <section className="py-16 bg-primary text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    <div>
                      <div className="text-4xl font-bold">500+</div>
                      <div className="mt-2 text-lg">Mentor Ahli</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold">2,000+</div>
                      <div className="mt-2 text-lg">Sesi Selesai</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold">4.9/5</div>
                      <div className="mt-2 text-lg">Rating Rata-rata</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold">1,500+</div>
                      <div className="mt-2 text-lg">Pelajar Aktif</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials Section */}
              <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Apa Kata Pengguna Kami</h2>
                    <p className="mt-4 text-lg text-gray-500">Cerita nyata dari mentee dan mentor</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                      <img src="https://ui-avatars.com/api/?name=Sarah+W&background=3B82F6&color=fff" alt="Sarah" className="h-16 w-16 rounded-full mb-4" />
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className="fas fa-star text-yellow-400 text-sm"></i>
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"MentorConnect membantu saya menemukan mentor yang sempurna dan meningkatkan karir saya secara signifikan!"</p>
                      <span className="text-primary font-semibold">Sarah W.</span>
                      <span className="text-gray-500 text-sm">Pengembang Perangkat Lunak</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                      <img src="https://ui-avatars.com/api/?name=John+D&background=10B981&color=fff" alt="John" className="h-16 w-16 rounded-full mb-4" />
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className="fas fa-star text-yellow-400 text-sm"></i>
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"Sesi mentoring sangat mudah dijadwalkan dan feedback dari mentee sangat membantu."</p>
                      <span className="text-primary font-semibold">John D.</span>
                      <span className="text-gray-500 text-sm">Insinyur Senior</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                      <img src="https://ui-avatars.com/api/?name=Lisa+M&background=6366F1&color=fff" alt="Lisa" className="h-16 w-16 rounded-full mb-4" />
                      <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className="fas fa-star text-yellow-400 text-sm"></i>
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"Platform ini sangat user-friendly dan komunitasnya suportif!"</p>
                      <span className="text-primary font-semibold">Lisa M.</span>
                      <span className="text-gray-500 text-sm">Desainer UX</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* How It Works Section */}
              <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                      Cara Kerja
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                      Mulai dengan MentorConnect dalam tiga langkah sederhana
                    </p>
                  </div>

                  <div className="mt-20">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                      {/* Step 1 */}
                      <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-2xl mx-auto">
                          1
                        </div>
                        <h3 className="mt-6 text-lg font-medium text-gray-900">Buat Profil Anda</h3>
                        <p className="mt-2 text-base text-gray-500">
                          Daftar dan buat profil Anda sebagai mentor atau mentee
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-2xl mx-auto">
                          2
                        </div>
                        <h3 className="mt-6 text-lg font-medium text-gray-900">Temukan Pasangan Anda</h3>
                        <p className="mt-2 text-base text-gray-500">
                          Jelajahi profil dan temukan mentor yang sempurna untuk tujuan Anda
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="text-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-2xl mx-auto">
                          3
                        </div>
                        <h3 className="mt-6 text-lg font-medium text-gray-900">Mulai Belajar</h3>
                        <p className="mt-2 text-base text-gray-500">
                          Jadwalkan sesi dan mulai perjalanan mentoring Anda
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="bg-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                      <span className="text-2xl font-bold text-primary">MentorConnect</span>
                      <p className="mt-4 text-gray-500">
                        Memberdayakan pembelajaran melalui koneksi mentoring yang bermakna.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Tautan Cepat</h3>
                      <ul className="mt-4 space-y-4">
                        <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Tentang Kami</a></li>
                        <li><button onClick={() => scrollToSection('features')} className="text-base text-gray-500 hover:text-gray-900 text-left">Fitur</button></li>
                        <li><button onClick={() => scrollToSection('how-it-works')} className="text-base text-gray-500 hover:text-gray-900 text-left">Cara Kerja</button></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Kontak</h3>
                      <ul className="mt-4 space-y-4">
                        <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Dukungan</a></li>
                        <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Syarat</a></li>
                        <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Privasi</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <p className="text-base text-gray-400 text-center">
                      © 2024 MentorConnect. Semua hak dilindungi.
                    </p>
                  </div>
                </div>
              </footer>
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
