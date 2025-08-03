# 🎓 MentorConnect

**Sistem Mentoring Modern** - Platform untuk menghubungkan mentee dengan mentor berpengalaman untuk mempercepat pembelajaran dan pengembangan karir.

![MentorConnect](https://img.shields.io/badge/MentorConnect-v1.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![SQLite](https://img.shields.io/badge/SQLite-3.x-blue.svg)

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Prasyarat Instalasi](#-prasyarat-instalasi)
- [Instalasi dan Setup](#-instalasi-dan-setup)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Proyek](#-struktur-proyek)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)
- [Troubleshooting](#-troubleshooting)

## ✨ Fitur Utama

### 🔐 **Sistem Autentikasi**
- Registrasi mentee dan mentor
- Login dengan validasi role
- Logout dengan konfirmasi

### 👨‍🎓 **Dashboard Mentee**
- Pencarian mentor berdasarkan keahlian
- Request sesi mentoring
- Tracking history sesi
- Notifikasi real-time
- Manajemen profil

### 👨‍🏫 **Dashboard Mentor**
- Manajemen permintaan sesi
- Approve/reject sesi dengan alasan
- Reschedule sesi
- Pemberian feedback
- Statistik mentoring

### 💬 **Sistem Notifikasi**
- Notifikasi sesi disetujui/ditolak
- Notifikasi reschedule
- Sharing materi pembelajaran

### 📱 **Responsive Design**
- Mobile-friendly interface
- Modern UI dengan Tailwind CSS
- Smooth animations

## 🛠 Teknologi yang Digunakan

### **Frontend**
- **React.js 18** - Library UI
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **FontAwesome** - Icons
- **Vite** - Build tool

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests

### **Tools & Others**
- **VS Code** - Code editor
- **Git** - Version control
- **npm** - Package manager

## 📋 Prasyarat Instalasi

Pastikan sistem Anda memiliki:

- **Node.js** (versi 16.x atau lebih baru)
- **npm** (biasanya sudah include dengan Node.js)
- **Git** (untuk clone repository)

### Cek versi yang terinstall:
```bash
node --version
npm --version
git --version
```

## 🚀 Instalasi dan Setup

### 1. **Clone Repository**
```bash
git clone https://github.com/vxnzrxr/MentorConnect.git
cd MentorConnect
```

### 2. **Setup Backend**
```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Setup database dan data sample
npm run setup
```

### 3. **Setup Frontend**
```bash
# Masuk ke folder frontend (dari root project)
cd ../frontend

# Install dependencies
npm install
```

## ▶️ Menjalankan Aplikasi

### **Mode Development (Recommended)**

Buka 2 terminal terpisah:

#### **Terminal 1 - Backend:**
```bash
cd backend
node app.js
```
Server akan berjalan di: `http://localhost:5175`

#### **Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Aplikasi akan berjalan di: `http://localhost:5173`

### **Akses Aplikasi**
Buka browser dan kunjungi: `http://localhost:5173`

### **🔑 Akun Testing (Sudah Tersedia)**
Setelah setup database, Anda dapat langsung login dengan akun berikut:

**Mentee:**
- Email: `mentee@example.com` 
- Password: `password123`

**Mentor:**  
- Email: `mentor@example.com`
- Password: `password123`

**Demo Accounts:**
- Demo Mentee: `demo.mentee@example.com` / `demo123`
- Demo Mentor: `demo.mentor@example.com` / `demo123`

### **Untuk Akses dari HP/Device Lain:**

1. **Setup Port Forwarding di VS Code:**
   - Buka panel `PORTS` di VS Code
   - Forward port `5173` (frontend) dengan visibility `Public`
   - Forward port `5175` (backend) dengan visibility `Public`

2. **Akses via tunnel URL:**
   - Frontend: `https://xxx-5173.devtunnels.ms`
   - Backend: `https://xxx-5175.devtunnels.ms`

## 📁 Struktur Proyek

```
MentorConnect/
├── 📁 backend/                 # Server aplikasi
│   ├── 📄 app.js              # Main server file
│   ├── 📄 db.js               # Database connection
│   ├── 📄 db-init.sql         # Database schema
│   ├── 📄 database.sqlite     # SQLite database
│   ├── 📄 package.json        # Backend dependencies
│   └── 📄 test_api_endpoints.js # API testing
│
├── 📁 frontend/               # Client aplikasi
│   ├── 📁 src/               # Source code
│   │   ├── 📄 App.jsx        # Main component & landing page
│   │   ├── 📄 Login.jsx      # Login page
│   │   ├── 📄 Register.jsx   # Registration page
│   │   ├── 📄 MenteeDashboard.jsx  # Dashboard mentee
│   │   ├── 📄 MentorDashboard.jsx  # Dashboard mentor
│   │   ├── 📄 MenteeProfile.jsx    # Profile mentee
│   │   ├── 📄 MentorProfile.jsx    # Profile mentor
│   │   ├── 📄 MentorSearchPage.jsx # Pencarian mentor
│   │   ├── 📄 SessionRequests.jsx  # Manajemen sesi
│   │   ├── 📄 NotificationPage.jsx # Halaman notifikasi
│   │   ├── 📄 SessionHistory.jsx   # History sesi
│   │   ├── 📄 FeedbackModal.jsx    # Modal feedback
│   │   ├── 📄 LogoutModal.jsx      # Modal logout
│   │   └── 📄 main.jsx       # Entry point
│   ├── 📄 index.html         # HTML template
│   ├── 📄 package.json       # Frontend dependencies
│   ├── 📄 tailwind.config.js # Tailwind configuration
│   └── 📄 vite.config.js     # Vite configuration
│
├── 📄 README.md              # Dokumentasi ini
├── 📄 .gitignore            # Git ignore rules
└── 📄 .vscode/              # VS Code settings
```

## 🔌 API Endpoints

### **Authentication**
- `POST /api/register` - Registrasi user baru
- `POST /api/login` - Login user

### **Profile Management**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### **Dashboard**
- `GET /api/mentee-dashboard` - Data dashboard mentee
- `GET /api/mentor-dashboard` - Data dashboard mentor

### **Mentor Features**
- `GET /api/mentors` - List semua mentor
- `GET /api/mentor-profile/:id` - Detail profil mentor
- `GET /api/mentor/:id/session-requests` - Permintaan sesi untuk mentor

### **Session Management**
- `POST /api/session-requests` - Buat permintaan sesi baru
- `PUT /api/session-requests/:id/approve` - Approve sesi
- `PUT /api/session-requests/:id/reject` - Reject sesi
- `GET /api/sessions/history` - History sesi

### **Notifications**
- `GET /api/mentee/:id/notifications` - Notifikasi mentee
- `PUT /api/notifications/:id/read` - Mark notifikasi as read
- `DELETE /api/notifications/:id` - Hapus notifikasi

## 🌐 Deployment

### **Local Production Build**
```bash
# Build frontend
cd frontend
npm run build

# Serve dengan static server
npx serve -s dist -p 3000
```

### **Cloud Deployment Options**
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Render, Heroku
- **Database**: PostgreSQL, MySQL (untuk production)

## 🐛 Troubleshooting

### **Problem: Database error saat setup**
**Solution**: 
```bash
cd backend
npm run reset-db  # Reset dan setup ulang database
```

### **Problem: "Module not found" error**
**Solution**: 
```bash
# Install ulang dependencies
cd backend && npm install
cd ../frontend && npm install
```

### **Problem: Backend tidak bisa diakses dari HP**
**Solution**: Pastikan port forwarding sudah disetup dengan visibility `Public`

### **Problem: CORS Error**
**Solution**: Cek konfigurasi CORS di `backend/app.js`

### **Problem: Dashboard stuck "Memuat..."**
**Solution**: 
1. Cek apakah backend berjalan di port 5175
2. Test API dengan: `curl http://localhost:5175/api/mentors`
3. Cek console browser untuk error

### **Problem: Port sudah digunakan**
```bash
# Kill process di port 5175 (backend)
lsof -ti:5175 | xargs kill

# Kill process di port 5173 (frontend)  
lsof -ti:5173 | xargs kill
```

### **Problem: Login gagal**
**Solution**: Pastikan menggunakan email dan password yang benar dari akun testing

## 👥 Tim Pengembang

- **Developer**: [vxnzrxr](https://github.com/vxnzrxr)
- **Email**: vxnzrxr@gmail.com

## 🙏 Ucapan Terima Kasih

- React.js Community
- Tailwind CSS Team
- Node.js Contributors
- SQLite Team

---

**Happy Mentoring! 🎓✨**