import React, { useState, useContext, createContext, useEffect } from 'react';
import apiService from '../services/ApiService';

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiService.setToken(token);
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    setIsLoading(false);
    setIsInitialized(true);
  };

  const login = async (email, password, userType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login({
        email,
        password,
        user_type: userType,
      });
      
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use apiService instead of direct fetch
      const response = await apiService.register(formData);
      
      // Store user in context
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.message || error.detail || "Registration failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    }
    setUser(null);
    setIsLoading(false);
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await apiService.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!apiService.getToken();
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.userType === role;
  };

  // Get user's blood group compatibility info
  const getBloodCompatibility = () => {
    if (!user?.bloodGroup) return null;
    
    const compatibility = {
      'O-': { canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
      'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
      'A-': { canDonateTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
      'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
      'B-': { canDonateTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
      'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
      'AB-': { canDonateTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
      'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
    };
    
    return compatibility[user.bloodGroup] || null;
  };

  // Calculate days until next donation eligibility (for donors)
  const getDaysUntilEligible = () => {
    if (user?.userType !== 'donor' || !user?.lastDonation) return null;
    
    const lastDonation = new Date(user.lastDonation);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(lastDonation.getDate() + 90); // 90 days between donations
    
    const today = new Date();
    const diffTime = nextEligible - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate urgency level based on last transfusion (for patients)
  const calculateUrgency = () => {
    if (user?.userType !== 'patient' || !user?.lastTransfusion) return 'Unknown';
    
    const lastTransfusion = new Date(user.lastTransfusion);
    const today = new Date();
    const daysSince = Math.floor((today - lastTransfusion) / (1000 * 60 * 60 * 24));
    
    if (daysSince > 28) return 'High';
    if (daysSince > 21) return 'Medium';
    return 'Low';
  };

  const contextValue = {
    user,
    isLoading,
    isInitialized,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    clearError,
    isAuthenticated,
    hasRole,
    getBloodCompatibility,
    getDaysUntilEligible,
    calculateUrgency,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};