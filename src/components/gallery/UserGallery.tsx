'use client';

import React, { useState, useEffect } from 'react';
import { storageService, Generation, GenerationsResponse } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Download, Eye, Calendar, Sparkles, Lock, Unlock, User, Wand2, Grid3X3 } from 'lucide-react';
import FeatureTags from '@/create/components/FeatureTags';
import { CharacterFeatures } from '@/create/types';

interface UserGalleryProps {
  className?: string;
}

type FilterType = 'all' | 'models' | 'studio';

const UserGallery: React.FC<UserGalleryProps> = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Generation | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const loadGenerations = async (reset: boolean = false) => {
    if (!isAuthenticated) return;

    try {
      setError(null);
      if (reset) {
        setLoading(true);
        setGenerations([]);
        setLastKey(undefined);
      }

      const response: GenerationsResponse = await storageService.getUserGenerations(
        20,
        reset ? undefined : lastKey
      );

      if (response.success) {
        if (reset) {
          setGenerations(response.generations);
        } else {
          setGenerations(prev => [...prev, ...response.generations]);
        }
        setLastKey(response.last_key);
        setHasMore(!!response.last_key);
      } else {
        setError(response.error || 'Failed to load generations');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load generations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (generationId: string) => {
    if (!confirm('Are you sure you want to delete this generation?')) return;

    setDeleting(generationId);
    try {
      const response = await storageService.deleteGeneration(generationId);
      if (response.success) {
        setGenerations(prev => prev.filter(gen => gen.generation_id !== generationId));
        if (selectedImage?.generation_id === generationId) {
          setSelectedImage(null);
        }
      } else {
        alert(response.error || 'Failed to delete generation');
      }
    } catch (err) {
      alert('Failed to delete generation');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (generation: Generation) => {
    try {
      const response = await fetch(generation.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `influencer-ai-${generation.generation_id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download image');
    }
  };

  const handleTogglePublish = async (generation: Generation) => {
    try {
      let response;
      if (generation.is_public) {
        response = await storageService.unpublishGeneration(generation.generation_id);
      } else {
        response = await storageService.publishGeneration(generation.generation_id);
      }

      if (response.success) {
        setGenerations(prev => prev.map(gen => gen.generation_id === generation.generation_id ? { ...gen, is_public: !generation.is_public } : gen));
      } else {
        alert(response.error || 'Action failed');
      }
    } catch (err) {
      alert('Action failed');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter generations based on active filter
  const filteredGenerations = generations.filter(generation => {
    switch (activeFilter) {
      case 'models':
        return generation.image_model !== 'flux-kontext-pro';
      case 'studio':
        return generation.image_model === 'flux-kontext-pro';
      default:
        return true;
    }
  });

  // Get counts for each filter
  const getCounts = () => {
    const modelCount = generations.filter(g => g.image_model !== 'flux-kontext-pro').length;
    const studioCount = generations.filter(g => g.image_model === 'flux-kontext-pro').length;
    return {
      all: generations.length,
      models: modelCount,
      studio: studioCount
    };
  };

  const counts = getCounts();

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadGenerations(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="max-w-md mx-auto">
          <Sparkles className="mx-auto h-8 w-8 text-gray-400 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign in to view your gallery</h3>
          <p className="text-gray-600">Create an account to save and manage your AI-generated images.</p>
        </div>
      </div>
    );
  }

  if (loading && generations.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl aspect-square"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="max-w-md mx-auto">
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadGenerations(true)}
            className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="max-w-md mx-auto">
          <Sparkles className="mx-auto h-8 w-8 text-gray-400 mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No images yet</h3>
          <p className="text-gray-600">Start creating AI influencer images to build your gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filter Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => handleFilterChange('all')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors font-medium ${
              activeFilter === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>All Creations</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === 'all' ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {counts.all}
            </span>
          </button>
          
          <button
            onClick={() => handleFilterChange('models')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors font-medium ${
              activeFilter === 'models'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>AI Influencers</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === 'models' ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {counts.models}
            </span>
          </button>
          
          <button
            onClick={() => handleFilterChange('studio')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors font-medium ${
              activeFilter === 'studio'
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Studio Magic</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeFilter === 'studio' ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {counts.studio}
            </span>
          </button>
        </div>
      </div>

      {/* Empty state for filtered results */}
      {filteredGenerations.length === 0 && generations.length > 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            {activeFilter === 'models' ? (
              <>
                <User className="mx-auto h-8 w-8 text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No AI Influencers yet</h3>
                <p className="text-gray-600">Create your first AI influencer to get started.</p>
              </>
            ) : (
              <>
                <Wand2 className="mx-auto h-8 w-8 text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Studio Magic yet</h3>
                <p className="text-gray-600">Use the Studio to create product showcases with your AI models.</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {filteredGenerations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {filteredGenerations.map((generation) => (
            <div
              key={generation.generation_id}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all"
            >
              {generation.is_public ? (
                <Unlock className="absolute top-2 left-2 w-5 h-5 text-green-500 z-10" />
              ) : (
                <Lock className="absolute top-2 left-2 w-5 h-5 text-gray-400 z-10" />
              )}
              
              {/* Studio Magic Badge */}
              {generation.image_model === 'flux-kontext-pro' && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium z-10 flex items-center space-x-1">
                  <Wand2 className="w-3 h-3" />
                  <span>Studio</span>
                </div>
              )}
              
              {/* Image */}
              <div className="relative aspect-square">
                <img
                  src={generation.image_url}
                  alt={generation.prompt}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(generation)}
                />
                <div 
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
                  onClick={() => setSelectedImage(generation)}
                >
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Eye className="h-4 w-4 text-gray-700" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                  {generation.enhanced_prompt || generation.prompt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(generation.created_at)}
                  </span>
                  <span className="bg-gray-50 px-2 py-1 rounded-lg font-medium">
                    {generation.image_model === 'flux-kontext-pro' ? 'Studio Magic' : generation.image_model}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {generation.image_model !== 'flux-kontext-pro' && (
                    <button
                      onClick={() => handleTogglePublish(generation)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors text-sm font-medium"
                    >
                      {generation.is_public ? <Lock className="h-4 w-4 mr-1" /> : <Unlock className="h-4 w-4 mr-1" />}
                      {generation.is_public ? 'Unpublish' : 'Publish'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(generation)}
                    className={`${generation.image_model === 'flux-kontext-pro' ? 'flex-1' : 'flex-1'} flex items-center justify-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors text-sm font-medium`}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  
                  <button
                    onClick={() => handleDelete(generation.generation_id)}
                    disabled={deleting === generation.generation_id}
                    className="flex items-center justify-center px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => loadGenerations(false)}
            disabled={loading}
            className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-auto shadow-lg border border-gray-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900">Image Details</h3>
                  {selectedImage.image_model === 'flux-kontext-pro' && (
                    <div className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1">
                      <Wand2 className="w-4 h-4" />
                      <span>Studio Magic</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <div className="w-6 h-6 flex items-center justify-center">✕</div>
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Image */}
                <div>
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.prompt}
                    className="w-full rounded-2xl border border-gray-200"
                  />
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Prompt
                    </label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed">
                      {selectedImage.enhanced_prompt || selectedImage.prompt}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Creation Type</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {selectedImage.image_model === 'flux-kontext-pro' ? 'Studio Magic' : selectedImage.image_model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">LLM Model</span>
                      <span className="text-sm text-gray-900 font-medium">{selectedImage.llm_model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created</span>
                      <span className="text-sm text-gray-900 font-medium">{formatDate(selectedImage.created_at)}</span>
                    </div>
                  </div>

                  {selectedImage.character_data && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Character Features
                      </label>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <FeatureTags characterFeatures={selectedImage.character_data as CharacterFeatures} />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => handleDownload(selectedImage)}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    
                    <button
                      onClick={() => handleDelete(selectedImage.generation_id)}
                      disabled={deleting === selectedImage.generation_id}
                      className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition-colors font-medium"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting === selectedImage.generation_id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGallery; 