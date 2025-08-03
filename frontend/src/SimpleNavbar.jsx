import React from 'react';
import { Link } from 'react-router-dom';

function SimpleNavbar() {
  return (
    <nav className="bg-white shadow-lg fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">MentorConnect</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Beranda
            </Link>
            <Link 
              to="/login" 
              className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Masuk
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-600 transition-colors"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default SimpleNavbar;
