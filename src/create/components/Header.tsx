'use client';

import { useState } from 'react';
import { Sparkles, Images, Package, Palette, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from '../../components/auth/LoginModal';
import PaywallModal from '../../components/auth/PaywallModal';
import UserMenu from '@/components/auth/UserMenu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  // Don't render header on landing page when not authenticated
  if (pathname === '/' && !isAuthenticated && !loading) {
    return null;
  }

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Clonefluencer</span>
        </div>
        
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium transition-colors relative ${
                pathname === '/' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              AI Create
              {pathname === '/' && (
                <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-black rounded-full"></div>
              )}
            </Link>
            <Link
              href="/gallery"
              className={`flex items-center space-x-2 font-medium transition-colors relative ${
                pathname === '/gallery' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Images className="w-4 h-4" />
              <span>Gallery</span>
              {pathname === '/gallery' && (
                <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-black rounded-full"></div>
              )}
            </Link>
            <Link
              href="/explore"
              className={`flex items-center space-x-2 font-medium transition-colors relative ${
                pathname === '/explore' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Explore</span>
              {pathname === '/explore' && (
                <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-black rounded-full"></div>
              )}
            </Link>
            <Link
              href="/studio"
              className={`flex items-center space-x-2 font-medium transition-colors relative ${
                pathname === '/studio' 
                  ? 'text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Studio</span>
              {pathname === '/studio' && (
                <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-black rounded-full"></div>
              )}
            </Link>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => setShowPaywallModal(true)}
                    className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>PRO</span>
                  </button>
                  <UserMenu />
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Sign In
                </button>
              )}
            </>
          )}
        </div>
      </header>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      <PaywallModal 
        isOpen={showPaywallModal} 
        onClose={() => setShowPaywallModal(false)} 
      />
    </>
  );
};

export default Header; 