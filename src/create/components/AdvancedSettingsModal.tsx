import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  selectedLLM: string;
  setSelectedLLM: (model: string) => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  setSelectedModel,
  selectedLLM,
  setSelectedLLM
}) => {
  const { privileges } = useAuth();

  if (!isOpen) return null;

  const imageModels = [
    { id: 'titan-g1', name: 'Titan Image Generator G1', description: 'High-quality realistic', pro: false },
    { id: 'titan-g1-v2', name: 'Titan Image Generator G1 v2', description: 'Enhanced quality', pro: true },
    { id: 'nova-canvas', name: 'Nova Canvas', description: 'Creative styles', pro: true },
    { id: 'sdxl', name: 'SDXL 1.0', description: 'Ultra-high resolution', pro: true }
  ];

  const llmModels = [
    { id: 'titan-express', name: 'Titan Text G1 - Express', description: 'Fast and reliable', pro: false },
    { id: 'titan-premier', name: 'Titan Text G1 - Premier', description: 'Enhanced reasoning', pro: true },
    { id: 'claude-3', name: 'Claude 3 Sonnet', description: 'Advanced reasoning', pro: true }
  ];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-[800px] animate-in slide-in-from-bottom-4 duration-300">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Advanced Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={0}
            aria-label="Close advanced settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          {/* LLM Models */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Language Model
            </h3>
            <div className="space-y-3">
              {llmModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    if (!model.pro || privileges.isJudge || privileges.accessToAllModels) {
                      setSelectedLLM(model.id);
                    }
                  }}
                  disabled={model.pro && !privileges.isJudge && !privileges.accessToAllModels}
                  className={`w-full p-3 rounded-xl border transition-colors text-left ${
                    selectedLLM === model.id
                      ? 'bg-black text-white border-black'
                      : model.pro && !privileges.isJudge && !privileges.accessToAllModels
                      ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{model.name}</span>
                    {model.pro && !privileges.isJudge && !privileges.accessToAllModels ? (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded">
                        PRO
                      </span>
                    ) : !model.pro && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1 text-inherit opacity-80">{model.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Image Models */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Image Generation Model
            </h3>
            <div className="space-y-3">
              {imageModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    if (!model.pro || privileges.isJudge || privileges.accessToAllModels) {
                      setSelectedModel(model.id);
                    }
                  }}
                  disabled={model.pro && !privileges.isJudge && !privileges.accessToAllModels}
                  className={`w-full p-3 rounded-xl border transition-colors text-left ${
                    selectedModel === model.id
                      ? 'bg-black text-white border-black'
                      : model.pro && !privileges.isJudge && !privileges.accessToAllModels
                      ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{model.name}</span>
                    {model.pro && !privileges.isJudge && !privileges.accessToAllModels ? (
                      <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium rounded">
                        PRO
                      </span>
                    ) : !model.pro && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        FREE
                      </span>
                    )}
                  </div>
                  <p className="text-sm mt-1 text-inherit opacity-80">{model.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white bg-black hover:bg-gray-800 rounded-lg transition-colors"
            tabIndex={0}
            aria-label="Apply settings"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsModal; 