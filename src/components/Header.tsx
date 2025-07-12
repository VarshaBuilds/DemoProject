import React, { useState } from 'react';
import { Search, Plus, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { AuthModal } from './AuthModal';

interface HeaderProps {
  onAskQuestion: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAskQuestion,
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Listen for user state changes to force re-render
  React.useEffect(() => {
    const handleUserStateChange = () => {
      // Force component re-render by updating state
      setShowUserMenu(false);
      setShowMobileMenu(false);
    };
    
    window.addEventListener('userStateChanged', handleUserStateChange);
    return () => window.removeEventListener('userStateChanged', handleUserStateChange);
  }, [user]);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">StackIt</h1>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={onAskQuestion}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Ask Question
                  </button>
                  
                  <NotificationBell />
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <User size={20} />
                      <span className="text-sm font-medium">
                        {user?.username || 'User'}
                      </span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="p-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-4">
              {/* Mobile Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Mobile Navigation */}
              {isAuthenticated ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onAskQuestion();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Ask Question
                  </button>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Signed in as {user?.username || 'User'}
                    </span>
                    <NotificationBell />
                  </div>
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleAuthClick('login');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-gray-700 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      handleAuthClick('register');
                      setShowMobileMenu(false);
                    }}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu Overlay */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    </>
  );
};