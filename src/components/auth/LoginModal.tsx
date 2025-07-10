'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    verificationCode: ''
  });

  const { signIn, signUp, confirmSignUp } = useAuth();

  // Reset to initial mode when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setMessage('');
      setNeedsVerification(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (needsVerification) {
        // Handle verification
        const result = await confirmSignUp(formData.email, formData.verificationCode);
        setMessage(result.message);
        if (result.success) {
          setNeedsVerification(false);
          setIsSignUp(false);
          setMessage('Account verified! Please sign in.');
        }
      } else if (isSignUp) {
        // Handle sign up
        if (formData.password !== formData.confirmPassword) {
          setMessage('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        const result = await signUp(formData.email, formData.password, formData.name);
        setMessage(result.message);
        if (result.success) {
          setNeedsVerification(true);
        }
      } else {
        // Handle sign in
        const result = await signIn(formData.email, formData.password);
        if (result.success) {
          onClose();
          resetForm();
        } else {
          // Show user-friendly error message
          if (result.message.includes('SECRET_HASH')) {
            setMessage('Configuration error. Please contact support.');
          } else if (result.message.includes('NotAuthorizedException') || result.message.includes('incorrect')) {
            setMessage('Invalid email or password. Please try again.');
          } else {
            setMessage(result.message);
          }
        }
      }
         } catch {
       setMessage('An error occurred. Please try again.');
     } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
      verificationCode: ''
    });
    setMessage('');
    setNeedsVerification(false);
    setIsSignUp(initialMode === 'signup');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {needsVerification ? 'Verify Email' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {needsVerification ? (
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-4">
                We've sent a verification code to <strong>{formData.email}</strong>
              </p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isSignUp ? 'Join Clonefluencer' : 'Sign in to Clonefluencer'}
              </h3>
              <p className="text-gray-600">
                {isSignUp 
                  ? 'Create your account to start generating virtual influencers' 
                  : 'Welcome back! Please sign in to your account'
                }
              </p>
            </div>
          )}

          {/* Error/Success Message */}
          {message && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${
              message.includes('successful') || message.includes('verified') 
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {needsVerification ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Verification Code</label>
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
            ) : (
              <>
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              {isLoading ? 'Loading...' : needsVerification ? 'Verify Email' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!needsVerification && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(''); // Clear error when switching between sign in/up
                }}
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don&apos;t have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 