import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { LoginForm } from '../components/LoginForm';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAuthenticated, loading, isFirstLogin } = useSupabaseAuth();
  const [shouldRedirectToPricing, setShouldRedirectToPricing] = useState(false);

  useEffect(() => {
    // Check if it's the first login based on database metadata
    if (isAuthenticated && isFirstLogin()) {
      setShouldRedirectToPricing(true);
    }
  }, [isAuthenticated, isFirstLogin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // If first login, show welcome page instead of children
  if (shouldRedirectToPricing) {
    // Import WelcomePage dynamically to avoid circular imports
    const WelcomePage = React.lazy(() => import('../features/onboarding/pages/WelcomePage').then(module => ({ default: module.WelcomePage })));
    return (
      <React.Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement...</p>
          </div>
        </div>
      }>
        <WelcomePage />
      </React.Suspense>
    );
  }

  return <>{children}</>;
};
