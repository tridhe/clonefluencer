'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Upload, X, Sparkles, User, Package, Image as ImageIcon, Download, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storageService, Generation } from '@/lib/storage';
import { apiService } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

type TabType = 'my-models' | 'marketplace';

const StudioPageContent = () => {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('my-models');
  const [myModels, setMyModels] = useState<Generation[]>([]);
  const [marketplaceModels, setMarketplaceModels] = useState<Generation[]>([]);
  const [selectedModel, setSelectedModel] = useState<Generation | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [, setMergedImage] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState('');
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);
  
  // Ref for auto-scrolling to generation section
  const generationSectionRef = useRef<HTMLDivElement>(null);

  // Handle URL parameters from marketplace
  useEffect(() => {
    const selectedModelParam = searchParams.get('selectedModel');
    if (selectedModelParam) {
      try {
        const modelData = JSON.parse(decodeURIComponent(selectedModelParam));
        // Set the model as selected and switch to marketplace tab
        setSelectedModel(modelData);
        setActiveTab('marketplace');
      } catch (error) {
        console.error('Failed to parse selected model data:', error);
      }
    }
  }, [searchParams]);

  // Load user's models
  const loadMyModels = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await storageService.getUserGenerations(50);
      if (response.success) {
        // Filter only AI influencer models (exclude Studio Magic/flux-kontext-pro)
        const aiModels = response.generations.filter(gen => gen.image_model !== 'flux-kontext-pro');
        setMyModels(aiModels);
      }
    } catch (error) {
      console.error('Failed to load my models:', error);
    }
  };

  // Load marketplace models
  const loadMarketplaceModels = async () => {
    try {
      const response = await apiService.getExploreImages({ limit: 50 });
      setMarketplaceModels(response.generations || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load models on mount and when tab changes
  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      if (activeTab === 'my-models') {
        await loadMyModels();
      } else {
        await loadMarketplaceModels();
      }
      setLoading(false);
    };

    loadModels();
  }, [isAuthenticated, activeTab]);

  const handleProductUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedModel || !productImage || !prompt.trim()) return;
    
    setIsGenerating(true);
    setHasStartedGeneration(true);
    setMergedImage(null);
    setFinalImage(null);
    setGenerationStep('Merging images...');
    
    // Auto-scroll to generation section
    setTimeout(() => {
      generationSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
    
    try {
      // Step 1: Merge the images side by side
      const merged = await apiService.mergeImages({
        left_url: selectedModel.image_url,
        right_url: productImage,
        target_width: 512,
        target_height: 512
      });
      
      setMergedImage(merged.merged_image);
      setGenerationStep('Generating with FLUX...');
      
      // Step 2: Send merged image to FLUX Kontext for final generation with optimization
      const fluxPrompt = `${prompt}. Make the person on the left wear or use the item on the right. Create a cohesive, natural-looking image where the AI model is showcasing the product.`;
      
      const fluxResponse = await apiService.editImageWithFlux({
        input_image: merged.merged_image,
        prompt: fluxPrompt,
        llm_model: 'claude', // Use Claude for Kontext optimization
        aspect_ratio: "1:1",
        output_format: "jpeg"
      });
      
      if (fluxResponse.success) {
        setFinalImage(fluxResponse.image);
        setGenerationStep('');
        
        // Save the final result to gallery
        try {
          await storageService.storeGeneration({
            prompt: fluxPrompt,
            image_model: 'flux-kontext-pro',
            llm_model: 'none',
            image_data: fluxResponse.image.split(',')[1], // Extract base64 part
            enhanced_prompt: fluxPrompt
          });
        } catch (saveError) {
          console.warn('Failed to save to gallery:', saveError);
        }
      } else {
        throw new Error('FLUX generation failed');
      }
      
    } catch (error) {
      console.error('Failed to generate studio content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate studio content: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleStartOver = () => {
    setHasStartedGeneration(false);
    setMergedImage(null);
    setFinalImage(null);
    setSelectedModel(null);
    setProductImage(null);
    setPrompt('');
  };

  const removeProductImage = () => {
    setProductImage(null);
  };

  const currentModels = activeTab === 'my-models' ? myModels : marketplaceModels;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in required</h3>
          <p className="text-gray-600">Please sign in to access the Studio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Studio</h1>
          <p className="text-gray-600">Combine your AI models with product images</p>
        </div>

        {/* Main Content - Three Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Left: Model Selection with Tabs */}
          <div>
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('my-models')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'my-models'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-3 h-3" />
                <span>My Models</span>
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'marketplace'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Marketplace</span>
              </button>
            </div>

            {/* Model Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl aspect-square animate-pulse"></div>
                ))}
              </div>
            ) : currentModels.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <ImageIcon className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  {activeTab === 'my-models' ? 'No AI models found' : 'No marketplace models available'}
                </p>
                <p className="text-xs text-gray-500">
                  {activeTab === 'my-models' ? 'Create some AI influencers first' : 'Check back later for new models'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {currentModels.map((model) => (
                  <div
                    key={model.generation_id}
                    onClick={() => setSelectedModel(model)}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      selectedModel?.generation_id === model.generation_id
                        ? 'border-black shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={model.image_url}
                      alt={model.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    {selectedModel?.generation_id === model.generation_id && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1">
                          <User className="w-3 h-3 text-black" />
                        </div>
                      </div>
                    )}
                    {/* Show badge for marketplace models */}
                    {activeTab === 'marketplace' && (
                      <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Public
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Product Upload */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Upload Product</h2>
            </div>

            {!productImage ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer hover:border-gray-300 transition-colors">
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload className="w-6 h-6 mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500 text-center">
                    <span className="font-medium">Click to upload</span>
                    <br />PNG, JPG or WEBP
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleProductUpload}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={productImage}
                  alt="Product"
                  className="w-full h-64 object-contain rounded-xl border border-gray-200 bg-gray-50"
                />
                <button
                  onClick={removeProductImage}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 hover:bg-white transition-colors"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Preview */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Preview</h2>
            </div>

            {selectedModel && productImage ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      {activeTab === 'my-models' ? 'My AI Model' : 'Marketplace Model'}
                    </p>
                    <img
                      src={selectedModel.image_url}
                      alt="Selected model"
                      className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Product</p>
                    <img
                      src={productImage}
                      alt="Product"
                      className="w-full aspect-square object-contain rounded-lg border border-gray-200 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center space-x-2 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-gray-400">+</div>
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Select model & upload product</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Prompt Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-semibold text-gray-900">Creative Prompt</h2>
          </div>

          <div className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want your AI model to showcase the product..."
              className="w-full h-20 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
            />

            {/* Quick Prompt Examples - Horizontal */}
            <div className="flex flex-wrap gap-2">
              {[
                "Wearing with confidence",
                "Elegant showcase",
                "Lifestyle setting",
                "Professional styling"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(`${example} - ${selectedModel ? 'AI model' : 'your model'} ${productImage ? 'with this product' : 'with your product'} in a modern environment`)}
                  className="px-3 py-1 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleGenerate}
              disabled={!selectedModel || !productImage || !prompt.trim() || isGenerating}
              className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{generationStep || 'Creating...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate with FLUX</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Inline Generation Section */}
        {hasStartedGeneration && (
          <div ref={generationSectionRef} className="mt-12 p-6 bg-gray-50 rounded-2xl">
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {finalImage ? 'Studio Creation Complete!' : 'Generating Your Studio Creation...'}
              </h2>
              <p className="text-sm text-gray-600">
                {finalImage ? 'AI-generated image using FLUX Kontext' : (generationStep || 'Processing your request')}
              </p>
            </div>
            
            <div className="flex justify-center mb-6">
              {finalImage ? (
                <div className="relative">
                  <img
                    src={finalImage}
                    alt="Final studio creation"
                    className="max-w-2xl w-full border border-gray-200 rounded-xl shadow-lg"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    FLUX Kontext Pro
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl w-full border border-gray-200 rounded-xl shadow-lg bg-white flex items-center justify-center" style={{ aspectRatio: '1/1', minHeight: '400px' }}>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {generationStep || 'Initializing...'}
                    </p>
                    <p className="text-sm text-gray-500">
                      This may take a few moments
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {finalImage ? (
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={() => {
                    if (!finalImage) return;
                    const link = document.createElement('a');
                    link.href = finalImage;
                    link.download = 'studio-creation.jpg';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Image</span>
                </button>
                
                <button
                  onClick={handleStartOver}
                  className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create New</span>
                </button>
              </div>
            ) : null}

            {/* Show prompt when complete */}
            {finalImage && prompt && (
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Prompt:</p>
                <p className="text-sm text-gray-600">{prompt}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StudioPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Studio...</p>
      </div>
    </div>}>
      <StudioPageContent />
    </Suspense>
  );
};

export default StudioPage; 