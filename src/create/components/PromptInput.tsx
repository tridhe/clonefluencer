import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { apiService } from '../../lib/api';
import { enhancementWords } from '../types';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  llmModel?: string;
  imageModel?: string;
}

const PromptInput = ({ prompt, setPrompt, onGenerate, llmModel = 'claude', imageModel = 'titan-g1' }: PromptInputProps) => {
  const [showEnhanceTooltip, setShowEnhanceTooltip] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

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

  const characterLimit = getCharacterLimit(imageModel);
  const isOverLimit = prompt.length > characterLimit;
  const isNearLimit = prompt.length > characterLimit * 0.8;

  const handleEnhancePrompt = async () => {
    if (isEnhancing) return;

    if (!prompt.trim()) {
      setPrompt('A charismatic AI influencer, photorealistic, professional lighting, modern aesthetic');
      return;
    }

    setIsEnhancing(true);
    try {
      const response = await apiService.enhancePrompt({ 
        prompt,
        llm_model: llmModel 
      });
      setPrompt(response.enhanced_prompt);
    } catch (error) {
      console.error('Failed to enhance prompt:', error);
      // Fallback to local enhancement
      const randomEnhancements = enhancementWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .join(', ');
      setPrompt(`${prompt}, ${randomEnhancements}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      onGenerate();
    }
  };

  return (
    <div className="relative">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe your AI influencer..."
        className={`w-full h-48 resize-none border outline-none text-lg placeholder-gray-400 bg-gray-50 rounded-2xl p-6 pr-20 focus:bg-white transition-colors ${
          isOverLimit 
            ? 'border-red-300 focus:border-red-400 bg-red-50' 
            : isNearLimit 
            ? 'border-yellow-300 focus:border-yellow-400 bg-yellow-50'
            : 'border-gray-200 focus:border-gray-300'
        }`}
        tabIndex={0}
        aria-label="Enter your AI influencer description"
      />
      
      {/* Character Counter */}
      <div className={`absolute top-4 right-4 text-sm font-medium ${
        isOverLimit 
          ? 'text-red-600' 
          : isNearLimit 
          ? 'text-yellow-600'
          : 'text-gray-500'
      }`}>
        {prompt.length}/{characterLimit}
      </div>
      
      {/* Warning Message */}
      {isOverLimit && (
        <div className="absolute top-12 right-4 bg-red-100 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 max-w-xs">
          <p className="font-medium">Prompt too long!</p>
          <p>The {imageModel} model has a {characterLimit} character limit. Please shorten your prompt by {prompt.length - characterLimit} characters.</p>
        </div>
      )}
      
      {/* Enhance Prompt Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleEnhancePrompt}
          onMouseEnter={() => setShowEnhanceTooltip(true)}
          onMouseLeave={() => setShowEnhanceTooltip(false)}
          disabled={isEnhancing}
          className={`p-3 rounded-xl transition-colors relative border border-gray-200 ${
            isEnhancing 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          tabIndex={0}
          aria-label="Enhance prompt with AI"
        >
          <Wand2 className={`w-5 h-5 ${isEnhancing ? 'animate-spin' : ''}`} />
          
          {/* Tooltip */}
          {showEnhanceTooltip && (
            <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
              Enhance Prompt
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptInput; 