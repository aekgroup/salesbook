import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { MigrationService, MigrationResult } from '../data/supabase/migration';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface MigrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function MigrationDialog({ isOpen, onClose, onComplete }: MigrationDialogProps) {
  const { isAuthenticated } = useSupabaseAuth();
  const [migrationNeeded, setMigrationNeeded] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      checkMigrationNeeded();
    }
  }, [isOpen, isAuthenticated]);

  const checkMigrationNeeded = async () => {
    try {
      const needed = await MigrationService.checkMigrationNeeded();
      setMigrationNeeded(needed);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await MigrationService.migrateFromDexie();
      setMigrationResult(result);

      if (result.success) {
        setTimeout(() => {
          onComplete();
          onClose();
        }, 2000);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: `Erreur de migration: ${error}`,
        migrated: { products: 0, statuses: 0, sales: 0, saleItems: 0, preferences: 0 },
        errors: [`${error}`]
      });
    } finally {
      setIsMigrating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Migration des données</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isMigrating}
          >
            <X size={20} />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
            <p className="text-gray-600 mb-4">
              Veuillez vous connecter pour migrer vos données locales vers Supabase.
            </p>
          </div>
        ) : !migrationNeeded ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <p className="text-gray-600">
              Vos données sont déjà synchronisées avec Supabase.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Upload className="mr-3 text-blue-500" size={24} />
                <div>
                  <h3 className="font-medium">Migration vers Supabase</h3>
                  <p className="text-sm text-gray-600">
                    Transférez vos données locales (produits, ventes, statuts) vers le cloud pour un accès multi-appareils.
                  </p>
                </div>
              </div>

              {migrationResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  migrationResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center mb-2">
                    {migrationResult.success ? (
                      <CheckCircle className="text-green-500 mr-2" size={20} />
                    ) : (
                      <AlertCircle className="text-red-500 mr-2" size={20} />
                    )}
                    <span className={`font-medium ${
                      migrationResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {migrationResult.message}
                    </span>
                  </div>

                  {migrationResult.success && (
                    <div className="text-sm text-green-700">
                      <ul className="space-y-1">
                        <li>• {migrationResult.migrated.products} produits migrés</li>
                        <li>• {migrationResult.migrated.statuses} statuts migrés</li>
                        <li>• {migrationResult.migrated.sales} ventes migrées</li>
                        <li>• {migrationResult.migrated.saleItems} articles de vente migrés</li>
                        {migrationResult.migrated.preferences > 0 && (
                          <li>• Préférences migrées</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {!migrationResult.success && migrationResult.errors.length > 0 && (
                    <div className="text-sm text-red-700 mt-2">
                      <ul className="space-y-1">
                        {migrationResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                disabled={isMigrating}
              >
                {migrationResult?.success ? 'Terminé' : 'Annuler'}
              </button>
              
              {!migrationResult?.success && (
                <button
                  onClick={handleMigration}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
                  disabled={isMigrating}
                >
                  {isMigrating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Migration...
                    </>
                  ) : (
                    'Migrer les données'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
