'use client';

import React, { useState, useEffect } from 'react';
import { storageService, GenerationStats } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Images, Calendar, Sparkles, TrendingUp } from 'lucide-react';

const GalleryStats: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<GenerationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await storageService.getUserStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isAuthenticated]);

  if (!isAuthenticated || loading || !stats) {
    return null;
  }

  const statItems = [
    {
      label: 'Total Images',
      value: stats.total_generations,
      icon: Images,
      color: 'bg-blue-100 text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">{item.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <item.icon className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GalleryStats; 