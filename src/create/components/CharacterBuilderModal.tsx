import { X } from 'lucide-react';
import { 
  CharacterFeatures, 
  ageRanges, 
  genderOptions, 
  ethnicityOptions,
  bodyTypeOptions,
  hairStyleOptions,
  hairColorOptions,
  expressionOptions,
  personalityOptions,
  confidenceLevelOptions,
  fashionStyleOptions,
  overallVibeOptions,
  backgroundOptions,
  lightingStyleOptions,
  photoTypeOptions
} from '../types';

interface CharacterBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterFeatures: CharacterFeatures;
  setCharacterFeatures: (features: CharacterFeatures) => void;
  onGeneratePrompt: () => void;
  isGenerating?: boolean;
}

const CharacterBuilderModal = ({ isOpen, onClose, characterFeatures, setCharacterFeatures, onGeneratePrompt, isGenerating = false }: CharacterBuilderModalProps) => {
  const updateFeature = (key: keyof CharacterFeatures, value: string) => {
    setCharacterFeatures({
      ...characterFeatures,
      [key]: value
    });
  };

  if (!isOpen) return null;

  const sections = [
    {
      title: "Demographics",
      fields: [
        { key: 'age' as keyof CharacterFeatures, label: 'Age Range', options: ageRanges },
        { key: 'gender' as keyof CharacterFeatures, label: 'Gender', options: genderOptions },
        { key: 'ethnicity' as keyof CharacterFeatures, label: 'Ethnicity', options: ethnicityOptions }
      ]
    },
    {
      title: "Physical Features",
      fields: [
        { key: 'bodyType' as keyof CharacterFeatures, label: 'Body Type', options: bodyTypeOptions },
        { key: 'hairStyle' as keyof CharacterFeatures, label: 'Hair Style', options: hairStyleOptions },
        { key: 'hairColor' as keyof CharacterFeatures, label: 'Hair Color', options: hairColorOptions }
      ]
    },
    {
      title: "Personality & Style",
      fields: [
        { key: 'personality' as keyof CharacterFeatures, label: 'Personality', options: personalityOptions },
        { key: 'fashionStyle' as keyof CharacterFeatures, label: 'Fashion Style', options: fashionStyleOptions },
        { key: 'overallVibe' as keyof CharacterFeatures, label: 'Overall Vibe', options: overallVibeOptions }
      ]
    },
    {
      title: "Scene & Setting",
      fields: [
        { key: 'background' as keyof CharacterFeatures, label: 'Background', options: backgroundOptions },
        { key: 'lightingStyle' as keyof CharacterFeatures, label: 'Lighting Style', options: lightingStyleOptions },
        { key: 'photoType' as keyof CharacterFeatures, label: 'Photo Type', options: photoTypeOptions }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">AI Persona Studio</h2>
          <button
            onClick={() => {
              // Clear all selections when closing
              setCharacterFeatures({
                age: '', gender: '', ethnicity: '',
                bodyType: '', hairStyle: '', hairColor: '',
                expression: '', personality: '', confidenceLevel: '',
                fashionStyle: '', overallVibe: '',
                background: '', lightingStyle: '', photoType: ''
              });
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={0}
            aria-label="Close AI Persona Studio"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-100 pb-2">
                {section.title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.fields.map((field) => (
                  <div key={field.key} className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 block">
                      {field.label}
                    </label>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {field.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateFeature(field.key, option)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                            characterFeatures[field.key] === option
                              ? 'bg-black text-white border-black'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                          tabIndex={0}
                          aria-label={`Select ${option} for ${field.label}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center rounded-b-2xl flex-shrink-0">
          <button
            onClick={() => {
              // Clear all selections
              setCharacterFeatures({
                age: '', gender: '', ethnicity: '',
                bodyType: '', hairStyle: '', hairColor: '',
                expression: '', personality: '', confidenceLevel: '',
                fashionStyle: '', overallVibe: '',
                background: '', lightingStyle: '', photoType: ''
              });
            }}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
            tabIndex={0}
            aria-label="Clear all selections"
          >
            Clear All
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Clear all selections when canceling
                setCharacterFeatures({
                  age: '', gender: '', ethnicity: '',
                  bodyType: '', hairStyle: '', hairColor: '',
                  expression: '', personality: '', confidenceLevel: '',
                  fashionStyle: '', overallVibe: '',
                  background: '', lightingStyle: '', photoType: ''
                });
                onClose();
              }}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
              tabIndex={0}
              aria-label="Cancel"
            >
              Cancel
            </button>
            
            <button
              onClick={onGeneratePrompt}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
              tabIndex={0}
              aria-label="Generate prompt from selected features"
            >
              {isGenerating ? 'Generating...' : 'Generate Prompt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterBuilderModal; 