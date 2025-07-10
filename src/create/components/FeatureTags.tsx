import { CharacterFeatures } from '../types';

interface FeatureTagsProps {
  characterFeatures: CharacterFeatures;
  selectedModel?: string;
  selectedLLM?: string;
}

const FeatureTags = ({ characterFeatures, selectedModel, selectedLLM }: FeatureTagsProps) => {
  // Get all non-empty features
  const getActiveFeatures = () => {
    const features: { label: string; value: string; category: string }[] = [];
    
    // Demographics
    if (characterFeatures.age) features.push({ label: 'Age', value: characterFeatures.age, category: 'Demographics' });
    if (characterFeatures.gender) features.push({ label: 'Gender', value: characterFeatures.gender, category: 'Demographics' });
    if (characterFeatures.ethnicity) features.push({ label: 'Ethnicity', value: characterFeatures.ethnicity, category: 'Demographics' });
    
    // Physical Features
    if (characterFeatures.bodyType) features.push({ label: 'Body Type', value: characterFeatures.bodyType, category: 'Physical' });
    if (characterFeatures.hairStyle) features.push({ label: 'Hair Style', value: characterFeatures.hairStyle, category: 'Physical' });
    if (characterFeatures.hairColor) features.push({ label: 'Hair Color', value: characterFeatures.hairColor, category: 'Physical' });
    
    // Personality & Traits
    if (characterFeatures.expression) features.push({ label: 'Expression', value: characterFeatures.expression, category: 'Personality' });
    if (characterFeatures.personality) features.push({ label: 'Personality', value: characterFeatures.personality, category: 'Personality' });
    if (characterFeatures.confidenceLevel) features.push({ label: 'Confidence', value: characterFeatures.confidenceLevel, category: 'Personality' });
    
    // Style & Aesthetic
    if (characterFeatures.fashionStyle) features.push({ label: 'Fashion', value: characterFeatures.fashionStyle, category: 'Style' });
    if (characterFeatures.overallVibe) features.push({ label: 'Vibe', value: characterFeatures.overallVibe, category: 'Style' });
    
    // Scene & Setting
    if (characterFeatures.background) features.push({ label: 'Background', value: characterFeatures.background, category: 'Scene' });
    if (characterFeatures.lightingStyle) features.push({ label: 'Lighting', value: characterFeatures.lightingStyle, category: 'Scene' });
    if (characterFeatures.photoType) features.push({ label: 'Photo Type', value: characterFeatures.photoType, category: 'Scene' });
    
    return features;
  };

  // Get model display names
  const getModelDisplayName = (modelId: string) => {
    const modelNames: { [key: string]: string } = {
      'titan-g1': 'Titan Image G1',
      'titan-g1-v2': 'Titan Image G1 v2',
      'nova-canvas': 'Nova Canvas',
      'sdxl': 'SDXL 1.0',
      'titan-express': 'Titan Text Express',
      'titan-premier': 'Titan Text Premier',
      'claude-3': 'Claude 3 Sonnet'
    };
    return modelNames[modelId] || modelId;
  };

  const activeFeatures = getActiveFeatures();
  const hasFeatures = activeFeatures.length > 0;
  const hasModels = selectedModel || selectedLLM;

  if (!hasFeatures && !hasModels) return null;

  return (
    <div className="space-y-3 pt-2">
      {hasFeatures && (
        <>
          <div className="text-sm font-medium text-gray-600">Selected Features:</div>
          <div className="flex flex-wrap gap-2">
            {activeFeatures.map((feature, index) => (
              <div 
                key={`${feature.label}-${index}`}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 flex items-center space-x-1"
              >
                <span className="text-xs text-gray-500">{feature.label}:</span>
                <span>{feature.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      {hasModels && (
        <>
          <div className="text-sm font-medium text-gray-600">Selected Models:</div>
          <div className="flex flex-wrap gap-2">
            {selectedLLM && (
              <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 flex items-center space-x-1">
                <span className="text-xs text-blue-600">LLM:</span>
                <span>{getModelDisplayName(selectedLLM)}</span>
              </div>
            )}
            {selectedModel && (
              <div className="bg-purple-50 text-purple-800 px-3 py-1 rounded-full text-sm font-medium border border-purple-200 flex items-center space-x-1">
                <span className="text-xs text-purple-600">Image:</span>
                <span>{getModelDisplayName(selectedModel)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FeatureTags; 