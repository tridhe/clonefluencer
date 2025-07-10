'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Settings, Crown, Star } from 'lucide-react';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, privileges } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors border border-gray-200"
      >
        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
          {user.name?.charAt(0) || user.email.charAt(0)}
        </div>
        <span className="hidden sm:block">{user.name || user.email}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* User Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="font-medium text-gray-900">{user.name || 'User'}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
              {privileges.isJudge && (
                <div className="mt-2 flex items-center space-x-2 text-purple-600">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Hackathon Judge</span>
                </div>
              )}
            </div>

            <div className="p-2">
              <button
                onClick={() => {/* TODO: Implement profile settings */}}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Profile Settings</span>
              </button>

              {!privileges.isJudge && (
                <button
                  onClick={() => {/* TODO: Implement upgrade to pro */}}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Crown className="w-4 h-4 text-purple-500" />
                  <span className="text-gray-700">Upgrade to Pro</span>
                  <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded">
                    PRO
                  </span>
                </button>
              )}

              <button
                onClick={() => {/* TODO: Implement general settings */}}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Settings</span>
              </button>

              <div className="border-t border-gray-200 my-2" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu; 