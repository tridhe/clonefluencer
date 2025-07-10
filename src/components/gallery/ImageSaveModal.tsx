'use client';

import React, { useState, useEffect } from 'react';
import { Download, Save, X, Trash2, Heart, Share2 } from 'lucide-react';
import { storageService } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface ImageSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: {
    image: string; // base64
    prompt: string;
    enhanced_prompt?: string;
    model: string;
    llm_model?: string;
    character_data?: any;
    width: number;
    height: number;
  };
  onSaved?: (generationId: string) => void;
  onDiscarded?: () => void;
  isAlreadySaved?: boolean;
}

const ImageSaveModal: React.FC<ImageSaveModalProps> = ({
  isOpen,
  onClose,
  imageData,
  onSaved,
  onDiscarded,
  isAlreadySaved = false
}) => {
  const { isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isAlreadySaved);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSaved(isAlreadySaved);
  }, [isAlreadySaved]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to save images');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await storageService.storeGeneration({
        prompt: imageData.prompt,
        image_model: imageData.model,
        llm_model: imageData.llm_model || 'claude-3-sonnet',
        image_data: imageData.image,
        character_data: imageData.character_data,
        enhanced_prompt: imageData.enhanced_prompt
      });

      if (response.success && response.data) {
        setSaved(true);
        onSaved?.(response.data.generation_id);
        
        // Auto close after 2 seconds
        setTimeout(() => {
          onClose();
          setSaved(false);
        }, 2000);
      } else {
        setError(response.error || 'Failed to save image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${imageData.image}`;
      link.download = `influencer-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleDiscard = () => {
    onDiscarded?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl max-h-[90vh] overflow-auto shadow-lg border border-gray-200">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900">
              {saved ? 'Already Saved to Gallery' : 'Save Image'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image Preview */}
            <div className="space-y-6">
              <div className="relative">
                <img
                  src={`data:image/png;base64,${imageData.image}`}
                  alt="Generated image"
                  className="w-full rounded-2xl border border-gray-200"
                />
              </div>
              
              {/* Image Info */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Model</span>
                  <span className="text-gray-900 font-medium">{imageData.model}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Resolution</span>
                  <span className="text-gray-900 font-medium">{imageData.width}×{imageData.height}</span>
                </div>
              </div>
            </div>

            {/* Actions & Details */}
            <div className="space-y-6">
              {/* Prompt Display */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  {imageData.enhanced_prompt ? 'Enhanced Prompt' : 'Prompt'}
                </label>
                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 max-h-32 overflow-y-auto border border-gray-200">
                  {imageData.enhanced_prompt || imageData.prompt}
                </div>
              </div>

              {imageData.enhanced_prompt && imageData.enhanced_prompt !== imageData.prompt && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Original Prompt
                  </label>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 max-h-20 overflow-y-auto border border-gray-200">
                    {imageData.prompt}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {saved && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-medium">
                    {isAlreadySaved ? 'This image is already in your gallery' : 'Image saved to your gallery'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {!saved && (
                <div className="space-y-4">
                  {isAuthenticated ? (
                    <>
                      {/* Primary Action - Save */}
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save to Gallery'}
                      </button>

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleDownload}
                          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </button>
                        <button
                          onClick={handleDiscard}
                          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Discard
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-gray-600 text-sm text-center">
                          Sign in to save images to your gallery
                        </p>
                      </div>
                      
                      <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-xs text-gray-400 text-center">
                  Saved images can be managed in your gallery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSaveModal; 