'use client';

import React from 'react';
import UserGallery from '@/components/gallery/UserGallery';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const GalleryPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your AI Gallery
            </h1>
          </div>
          
          <UserGallery />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default GalleryPage; 