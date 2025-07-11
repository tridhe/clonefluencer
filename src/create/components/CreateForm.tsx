import { useState } from 'react';
import { CharacterFeatures } from '../types';
import { apiService } from '../../lib/api';
import PromptInput from './PromptInput';
import ActionButtons from './ActionButtons';
import FeatureTags from './FeatureTags';
import CharacterBuilderModal from './CharacterBuilderModal';
import ImageSaveModal from '../../components/gallery/ImageSaveModal';
import AdvancedSettingsModal from './AdvancedSettingsModal';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../lib/storage';


const CreateForm = () => {
  const { isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('titan-g1');
  const [selectedLLM, setSelectedLLM] = useState('titan-express');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isImageSaved, setIsImageSaved] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);

  // Character limits based on image model
  const getCharacterLimit = (model: string) => {
    const limits: { [key: string]: number } = {
      'titan-g1': 512,
      'titan-g2': 512,
      'nova-canvas': 1000,
      'sdxl': 1000
    };
    return limits[model] || 512;
  };

  const isPromptOverLimit = prompt.length > getCharacterLimit(selectedModel);
  
  // Studio workflow states
  const [showStudioWorkflow, setShowStudioWorkflow] = useState(false);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [studioPrompt, setStudioPrompt] = useState('');
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  
  const [characterFeatures, setCharacterFeatures] = useState<CharacterFeatures>({
    // Demographics
    age: '',
    gender: '',
    ethnicity: '',
    
    // Physical Features
    bodyType: '',
    hairStyle: '',
    hairColor: '',
    
    // Personality & Traits
    expression: '',
    personality: '',
    confidenceLevel: '',
    
    // Style & Aesthetic
    fashionStyle: '',
    overallVibe: '',
    
    // Scene & Setting
    background: '',
    lightingStyle: '',
    photoType: ''
  });

  const handleGenerate = async () => {
    if (!prompt.trim() || isPromptOverLimit) return;
    
    setIsGeneratingImage(true);
    setGeneratedImage(null);
    setIsImageSaved(false); // Reset saved state for new image
    setSaveSuccess(false);

    try {
      const response = await apiService.generateImage({
        prompt: prompt.trim(),
        model: selectedModel,
        width: 1024,
        height: 1024
      });

      setGeneratedImage(response.image);
      setEnhancedPrompt(response.prompt || prompt);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateFromPersona = async () => {
    if (isGeneratingPrompt) return;

    setIsGeneratingPrompt(true);
    try {
      // Generate prompt based on character features using selected LLM
      const response = await apiService.generateCharacterPrompt({
        base_prompt: prompt,
        llm_model: selectedLLM,
        character_features: {
          age: characterFeatures.age,
          gender: characterFeatures.gender,
          ethnicity: characterFeatures.ethnicity,
          body_type: characterFeatures.bodyType,
          hair_style: characterFeatures.hairStyle,
          hair_color: characterFeatures.hairColor,
          expression: characterFeatures.expression,
          personality: characterFeatures.personality,
          confidence_level: characterFeatures.confidenceLevel,
          fashion_style: characterFeatures.fashionStyle,
          overall_vibe: characterFeatures.overallVibe,
          background: characterFeatures.background,
          lighting_style: characterFeatures.lightingStyle,
          photo_type: characterFeatures.photoType
        }
      });
      console.log('Generated character prompt:', response.generated_prompt);
      setPrompt(response.generated_prompt);
      // Close the modal after successful prompt generation
      setIsCharacterModalOpen(false);
    } catch (error) {
      console.error('Failed to generate character prompt:', error);
      // Fallback: create a simple prompt from selected features
      const selectedFeatures = Object.entries(characterFeatures)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      if (selectedFeatures) {
        setPrompt(prompt + (prompt ? ', ' : '') + selectedFeatures);
      }
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleOpenCharacterBuilder = () => {
    setIsCharacterModalOpen(true);
  };

  const handleCloseCharacterBuilder = () => {
    setIsCharacterModalOpen(false);
  };

  const handleOpenAdvanced = () => {
    setIsAdvancedOpen(true);
  };

  const handleCloseAdvanced = () => {
    setIsAdvancedOpen(false);
  };

  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
  };

  const handleImageSaved = (generationId: string) => {
    console.log('Image saved with ID:', generationId);
    // Could show a success toast here
  };

  const handleImageDiscarded = () => {
    setGeneratedImage(null);
    setIsImageSaved(false);
    setSaveSuccess(false);
  };

  const handleStartStudioWorkflow = () => {
    setShowStudioWorkflow(true);
    setStudioPrompt(`Create a professional photo of a person wearing the product. The person should be ${characterFeatures.age || 'young'}, ${characterFeatures.gender || 'female'}, with ${characterFeatures.ethnicity || 'mixed'} ethnicity. Style: ${characterFeatures.fashionStyle || 'modern casual'}, ${characterFeatures.overallVibe || 'confident and approachable'}.`);
  };

  const handleProductUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Convert to base64 without data URL prefix
        const base64 = result.split(',')[1];
        setProductImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateFinalImage = async () => {
    if (!generatedImage || !productImage || !studioPrompt.trim()) {
      return;
    }

    setIsGeneratingFinal(true);
    setFinalImage(null);

    try {
      // First merge the images
      const mergeData = await apiService.mergeImages({
        left_url: `data:image/png;base64,${generatedImage}`,
        right_url: `data:image/png;base64,${productImage}`,
        target_width: 512,
        target_height: 512,
      });
      
      // Then send to FLUX for final generation with Kontext optimization
      const fluxResponse = await apiService.editImageWithFlux({
        input_image: mergeData.merged_image,
        prompt: studioPrompt.trim(),
        llm_model: selectedLLM,
        aspect_ratio: '1:1',
        safety_tolerance: 2,
        output_format: 'png'
      });

      if (fluxResponse.success && fluxResponse.image) {
        setFinalImage(fluxResponse.image);
      } else {
        console.error('FLUX generation failed');
      }
    } catch (error) {
      console.error('Error generating final image:', error);
    } finally {
      setIsGeneratingFinal(false);
    }
  };

  const handleOpenSaveModal = () => {
    if (generatedImage) {
      setIsSaveModalOpen(true);
    }
  };

  const handleDirectSave = async () => {
    if (!generatedImage || !isAuthenticated || isImageSaved) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await storageService.storeGeneration({
        prompt: prompt,
        image_model: selectedModel,
        llm_model: selectedLLM,
        image_data: generatedImage,
        character_data: characterFeatures,
        enhanced_prompt: enhancedPrompt || undefined
      });

      if (response.success && response.data) {
        // Show success feedback
        console.log('Image saved successfully');
        handleImageSaved(response.data.generation_id);
        setIsImageSaved(true); // Mark image as saved
      } else {
        console.error('Failed to save image:', response.error);
      }
    } catch (err) {
      console.error('Error saving image:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full flex gap-6 justify-center">
        {/* Main Form */}
        <div className={`transition-all duration-500 ease-in-out ${
          (isGeneratingImage || generatedImage) ? 'max-w-xl' : 'max-w-2xl'
        }`}>
          {/* Animated Silver Border Container */}
          <div className="relative p-[2px] rounded-[26px] bg-gradient-to-r from-silver-400 via-silver-300 to-silver-400 animate-border-rotate">
            <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6 relative">
              <PromptInput 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onGenerate={handleGenerate}
                llmModel={selectedLLM}
                imageModel={selectedModel}
              />
              
              <ActionButtons 
                onOpenCharacterBuilder={handleOpenCharacterBuilder}
                onOpenAdvanced={handleOpenAdvanced}
                onGenerate={handleGenerate}
                isGenerating={isGeneratingImage}
                isPromptOverLimit={isPromptOverLimit}
              />
              
              <FeatureTags 
                characterFeatures={characterFeatures} 
                selectedModel={selectedModel}
                selectedLLM={selectedLLM}
              />
            </div>
          </div>
        </div>

        {/* Generated Image Panel - First in sequence */}
        <div className={`transition-all duration-500 ease-in-out ${
          (isGeneratingImage || generatedImage) 
            ? 'w-96 opacity-100 translate-x-0' 
            : 'w-0 opacity-0 translate-x-full'
        } overflow-hidden`}>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Image</h3>
            
            {isGeneratingImage ? (
              <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">Generating your AI influencer...</p>
                    <p className="text-sm text-gray-500">Using {selectedModel}</p>
                  </div>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <img
                  src={`data:image/png;base64,${generatedImage}`}
                  alt="Generated AI Influencer"
                  className="w-full rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleOpenSaveModal}
                />
                
                <div className="text-xs text-gray-500 text-center">
                  Model: {selectedModel}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={handleDirectSave}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-xl transition-colors text-sm font-medium ${
                          isImageSaved 
                            ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                            : 'bg-black text-white hover:bg-gray-800'
                        }`}
                        disabled={isSaving || isImageSaved}
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                        ) : isImageSaved ? (
                          '✓ Saved to Gallery'
                        ) : (
                          'Save to Gallery'
                        )}
                      </button>
                      
                      <button
                        onClick={handleStartStudioWorkflow}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Use This Model
                      </button>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = `data:image/png;base64,${generatedImage}`;
                            link.download = `ai-influencer-${Date.now()}.png`;
                            link.click();
                          }}
                          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Download
                        </button>
                        <button
                          onClick={handleImageDiscarded}
                          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Discard
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <p className="text-gray-600 text-xs text-center">
                          Sign in to save images to your gallery
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `data:image/png;base64,${generatedImage}`;
                          link.download = `ai-influencer-${Date.now()}.png`;
                          link.click();
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                      >
                        Download Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Product Upload Panel - Second in sequence */}
        <div className={`transition-all duration-500 ease-in-out ${
          showStudioWorkflow 
            ? 'w-96 opacity-100 translate-x-0' 
            : 'w-0 opacity-0 translate-x-full'
        } overflow-hidden`}>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Product</h3>
            
            {!productImage ? (
              <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">Upload Product Image</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-square w-full rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={`data:image/png;base64,${productImage}`}
                    alt="Product"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                <button
                  onClick={() => setProductImage(null)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Remove Product
                </button>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleProductUpload}
              className="hidden"
              id="product-upload"
            />
            <label
              htmlFor="product-upload"
              className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer"
            >
              {productImage ? 'Change Product' : 'Choose Product'}
            </label>

            {/* Studio Prompt */}
            {productImage && (
              <div className="mt-4 space-y-3">
                <label className="text-sm font-medium text-gray-700 block">
                  Final Image Prompt
                </label>
                <textarea
                  value={studioPrompt}
                  onChange={(e) => setStudioPrompt(e.target.value)}
                  placeholder="Describe how the person should wear/use the product..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-sm"
                  rows={4}
                />
                
                <button
                  onClick={handleGenerateFinalImage}
                  disabled={isGeneratingFinal || !studioPrompt.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isGeneratingFinal ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Final Image'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Final Image Panel - Third in sequence */}
        <div className={`transition-all duration-500 ease-in-out ${
          (isGeneratingFinal || finalImage) 
            ? 'w-96 opacity-100 translate-x-0' 
            : 'w-0 opacity-0 translate-x-full'
        } overflow-hidden`}>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Result</h3>
            
            {isGeneratingFinal ? (
              <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">Creating final image...</p>
                    <p className="text-sm text-gray-500">Using FLUX AI</p>
                  </div>
                </div>
              </div>
            ) : finalImage ? (
              <div className="space-y-4">
                <img
                  src={finalImage.startsWith('data:') ? finalImage : `data:image/png;base64,${finalImage}`}
                  alt="Final Generated Image"
                  className="w-full rounded-xl border border-gray-200 shadow-sm"
                />
                
                <div className="text-xs text-gray-500 text-center">
                  Generated with FLUX.1 Kontext
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = finalImage.startsWith('data:') ? finalImage : `data:image/png;base64,${finalImage}`;
                      link.download = `final-result-${Date.now()}.png`;
                      link.click();
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Download Final Image
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowStudioWorkflow(false);
                      setProductImage(null);
                      setStudioPrompt('');
                      setFinalImage(null);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CharacterBuilderModal
        isOpen={isCharacterModalOpen}
        onClose={handleCloseCharacterBuilder}
        characterFeatures={characterFeatures}
        setCharacterFeatures={setCharacterFeatures}
        onGeneratePrompt={handleGenerateFromPersona}
        isGenerating={isGeneratingPrompt}
      />

      <AdvancedSettingsModal
        isOpen={isAdvancedOpen}
        onClose={handleCloseAdvanced}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedLLM={selectedLLM}
        setSelectedLLM={setSelectedLLM}
      />

        <ImageSaveModal
          isOpen={isSaveModalOpen}
          onClose={handleCloseSaveModal}
          imageData={{
          image: generatedImage || '',
            prompt: prompt,
            enhanced_prompt: enhancedPrompt || undefined,
            model: selectedModel,
            llm_model: selectedLLM,
            character_data: characterFeatures,
            width: 1024,
            height: 1024
          }}
          onSaved={handleImageSaved}
        />
    </main>
  );
};

export default CreateForm; 