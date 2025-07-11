'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Download, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Generation } from '@/lib/storage';
import { apiService } from '../../lib/api';

const ExplorePage: React.FC = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchExploreImages = async () => {
      try {
        setError(null);
        setLoading(true);
        // Fetch public generations (no auth required)
        const response = await apiService.getExploreImages({ limit: 50 });
        setGenerations(response.images || []);
      } catch (error) {
        console.error('Failed to fetch explore images:', error);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchExploreImages();
  }, []);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleUseModel = (model: Generation) => {
    // Encode the model data to pass via URL
    const modelData = encodeURIComponent(JSON.stringify({
      generation_id: model.generation_id,
      image_url: model.image_url,
      prompt: model.prompt,
      enhanced_prompt: model.enhanced_prompt,
      image_model: model.image_model
    }));
    
    // Navigate to studio with the selected model
    router.push(`/studio?selectedModel=${modelData}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Marketplace</h1>
          <p className="text-lg text-gray-600">Discover AI influencer models shared by the community</p>
        </div>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && generations.length === 0 && (
          <p className="text-center text-gray-600">No public models yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {generations.map((gen) => (
            <div key={gen.generation_id} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <div className="relative aspect-square">
                <img src={gen.image_url} alt={gen.prompt} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700 line-clamp-2">{gen.enhanced_prompt || gen.prompt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" />{formatDate(gen.created_at)}</span>
                  <span>{gen.image_model}</span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUseModel(gen)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-black text-white rounded-xl text-sm hover:bg-gray-800 transition-colors"
                  >
                    <Wand2 className="h-4 w-4 mr-1" />
                    Use Model
                  </button>
                  
                  <button
                    onClick={async () => {
                      const res = await fetch(gen.image_url);
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `influencer-ai-${gen.generation_id}.png`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage; 