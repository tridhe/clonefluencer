import { ArrowRight, Settings, User } from 'lucide-react';

interface ActionButtonsProps {
  onOpenCharacterBuilder: () => void;
  onOpenAdvanced: () => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  isPromptOverLimit?: boolean;
}

const ActionButtons = ({ onOpenCharacterBuilder, onOpenAdvanced, onGenerate, isGenerating = false, isPromptOverLimit = false }: ActionButtonsProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex space-x-4">
        {/* Character Builder Button */}
        <button
          onClick={onOpenCharacterBuilder}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors border border-gray-200"
          tabIndex={0}
          aria-label="Open AI Persona Studio"
        >
          <User className="w-4 h-4" />
          <span>AI Persona Studio</span>
        </button>

        {/* Advanced Settings Button */}
        <button
          onClick={onOpenAdvanced}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium transition-colors border border-gray-200"
          tabIndex={0}
          aria-label="Open advanced settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || isPromptOverLimit}
        className={`ml-auto px-8 py-3 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
          isGenerating || isPromptOverLimit
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-black hover:bg-gray-800 text-white'
        }`}
        tabIndex={0}
        aria-label={isPromptOverLimit ? 'Prompt too long - please shorten' : 'Generate AI influencer'}
        title={isPromptOverLimit ? 'Please shorten your prompt to meet the character limit' : ''}
      >
        <span>{isGenerating ? 'Generating...' : isPromptOverLimit ? 'Prompt Too Long' : 'Generate'}</span>
        <ArrowRight className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
};

export default ActionButtons; 