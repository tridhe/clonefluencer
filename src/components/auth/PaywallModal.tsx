'use client';

import React from 'react';
import { X, Sparkles, Check, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
  const { privileges } = useAuth();

  // If user is a judge, don't show the paywall
  if (privileges.isJudge) {
    return null;
  }

  if (!isOpen) return null;

  const handleUpgrade = () => {
    // TODO: Integrate with payment processor (Stripe, etc.)
    alert('Payment integration coming soon!');
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade to Pro</h2>
          <p className="text-gray-600 mb-6">
            Get unlimited access to all features and create amazing AI influencers.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Unlimited generations</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Priority processing</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Access to all AI models</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>High resolution images</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={handleUpgrade}
              className="w-full bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Upgrade Now
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal; 