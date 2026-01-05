import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Zap, Shield, HeadphonesIcon, ArrowRight } from 'lucide-react';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { SubscriptionService, SubscriptionInfo } from '../../../data/supabase/subscriptionService';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </div>
);

export const WelcomePage: React.FC = () => {
  const { user, markPricingAsSeen } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createTrialSubscription = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Creating trial subscription for user:', user.id);
      
      // Create trial subscription
      const subInfo = await SubscriptionService.createTrialSubscription(user.id);
      console.log('Trial subscription created:', subInfo);
    } catch (error) {
      console.error('Error creating trial subscription:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      createTrialSubscription();
    }
  }, [user, createTrialSubscription]);

  const handleContinueWithTrial = async () => {
    setIsLoading(true);
    
    // Mark pricing as seen in database
    const result = await markPricingAsSeen();
    if (result.success) {
      // Reload the page to trigger normal app flow
      window.location.href = '/';
    } else {
      console.error('Error marking pricing as seen:', result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center mb-6">
            <span className="text-white text-2xl font-bold">SB</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            🎉 Bienvenue dans Salesbook !
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Votre essai gratuit de 14 jours commence maintenant
          </p>
          
          {/* Trial status card */}
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-6 py-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <span className="text-green-800 font-semibold text-lg">
                Essai Gratuit Activé
              </span>
              <p className="text-green-700 text-sm">
                Accès complet à toutes les fonctionnalités pendant 14 jours
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Ce que vous obtenez avec votre essai
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature
              icon={<Zap className="h-6 w-6 text-white" />}
              title="Rapide et intuitif"
              description="Interface moderne et facile à prendre en main"
            />
            <Feature
              icon={<Shield className="h-6 w-6 text-white" />}
              title="Sécurisé"
              description="Vos données sont protégées et sauvegardées dans le cloud"
            />
            <Feature
              icon={<HeadphonesIcon className="h-6 w-6 text-white" />}
              title="Support dédié"
              description="Notre équipe est là pour vous aider à démarrer"
            />
          </div>
        </div>

        {/* Trial Features List */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Fonctionnalités incluses dans votre essai
          </h2>
          <div className="max-w-2xl mx-auto">
            <ul className="space-y-4">
              {[
                'Gestion illimitée des produits et stocks',
                'Suivi complet des ventes et des revenus',
                'Rapports détaillés et analytics',
                'Gestion des dépenses et des notes de frais',
                'Personnalisation des statuts et catégories',
                'Export des données en CSV',
                'Support par email',
                'Sauvegarde automatique'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-slate-50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-slate-600 mb-6">
              Accédez immédiatement à votre tableau de bord et commencez à gérer votre activité.
            </p>
            <button
              onClick={handleContinueWithTrial}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Chargement...
                </>
              ) : (
                <>
                  Continuer avec l'essai gratuit
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            <p className="text-slate-500 text-sm mt-4">
              Aucune carte de crédit requise • Annulation à tout moment
            </p>
          </div>

          <div className="text-slate-500 text-sm">
            <p>Après votre essai, vous pourrez choisir de vous abonner à notre offre Premium à 19€/mois</p>
            <p>ou continuer avec certaines fonctionnalités limitées.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
