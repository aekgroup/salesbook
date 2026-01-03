import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { MigrationService } from '../data/supabase/migration';
import { MigrationDialog } from '../components/MigrationDialog';
import { LoginForm } from '../components/LoginForm';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSupabaseAuth();
  const [showMigration, setShowMigration] = useState(false);
  const [migrationChecked, setMigrationChecked] = useState(false);

  useEffect(() => {
    // Check if migration is needed when user is authenticated
    if (isAuthenticated && !migrationChecked) {
      checkMigrationStatus();
    }
  }, [isAuthenticated, migrationChecked]);

  const checkMigrationStatus = async () => {
    try {
      const needed = await MigrationService.checkMigrationNeeded();
      setShowMigration(needed);
      setMigrationChecked(true);
    } catch (error) {
      console.error('Error checking migration status:', error);
      setMigrationChecked(true);
    }
  };

  const handleMigrationComplete = () => {
    setShowMigration(false);
  };

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

  return (
    <>
      {children}
      <MigrationDialog
        isOpen={showMigration}
        onClose={() => setShowMigration(false)}
        onComplete={handleMigrationComplete}
      />
    </>
  );
};
