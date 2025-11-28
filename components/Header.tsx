import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddMessClick: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  currentUser: User | null;
}

const Logo = () => (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-green to-primary flex items-center justify-center shadow">
        {/* Simplified Fork & Spoon icon */}
        <svg className="w-6 h-6 text-white transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3v13c0 1.66-1.34 3-3 3s-3-1.34-3-3V3" />
          <path d="M11 3v4" />
          <path d="M14 10a4 4 0 0 1-8 0V3h8v7z" />
        </svg>
      </div>
      <span className="text-3xl font-bold text-brand-dark tracking-tight">
        Mess<span className="text-primary">Mate</span>
      </span>
    </div>
);

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddMessClick,
  onLoginClick,
  onLogoutClick,
  currentUser,
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 gap-4">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          <div className="hidden md:flex flex-1 justify-center px-8">
             <div className="w-full max-w-md">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a mess, location..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent transition w-full bg-white text-gray-900"
                    />
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
                onClick={onAddMessClick}
                className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                + Add Mess
            </button>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="hidden lg:inline text-sm font-medium text-gray-700">Welcome, {currentUser.name}</span>
                <button
                  onClick={onLogoutClick}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-4 py-2 bg-brand-dark text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;