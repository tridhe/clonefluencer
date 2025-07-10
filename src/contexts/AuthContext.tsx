'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AuthState } from '../lib/auth';

interface UserPrivileges {
  isJudge: boolean;
  unlimitedGenerations: boolean;
  priorityProcessing: boolean;
  accessToAllModels: boolean;
  maxGenerationsPerMonth: number;
  maxResolution: number;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  confirmPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  privileges: UserPrivileges;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

// List of judge email addresses
const JUDGE_EMAILS = [
  'genaihackathon2025@impetus.com',
  'testing@devpost.com'
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  // Initialize privileges with default values
  const [privileges, setPrivileges] = useState<UserPrivileges>({
    isJudge: false,
    unlimitedGenerations: false,
    priorityProcessing: false,
    accessToAllModels: false,
    maxGenerationsPerMonth: 10,
    maxResolution: 512
  });

  // Update privileges when user changes
  useEffect(() => {
    if (authState.user) {
      const isJudge = JUDGE_EMAILS.includes(authState.user.email);
      setPrivileges({
        isJudge,
        unlimitedGenerations: isJudge,
        priorityProcessing: isJudge,
        accessToAllModels: isJudge,
        maxGenerationsPerMonth: isJudge ? Infinity : 10,
        maxResolution: isJudge ? 1024 : 512
      });
    } else {
      // Reset privileges when user logs out
      setPrivileges({
        isJudge: false,
        unlimitedGenerations: false,
        priorityProcessing: false,
        accessToAllModels: false,
        maxGenerationsPerMonth: 10,
        maxResolution: 512
      });
    }
  }, [authState.user]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      setAuthState({
        isAuthenticated: !!user,
        user,
        loading: false
      });
    } catch {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (result.success && result.user) {
      setAuthState({
        isAuthenticated: true,
        user: result.user,
        loading: false
      });
    }
    return result;
  };

  const signUp = async (email: string, password: string, name: string) => {
    return await authService.signUp(email, password, name);
  };

  const signOut = async () => {
    await authService.signOut();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  const confirmSignUp = async (email: string, code: string) => {
    return await authService.confirmSignUp(email, code);
  };

  const forgotPassword = async (email: string) => {
    return await authService.forgotPassword(email);
  };

  const confirmPassword = async (email: string, code: string, newPassword: string) => {
    return await authService.confirmPassword(email, code, newPassword);
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    forgotPassword,
    confirmPassword,
    privileges
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 