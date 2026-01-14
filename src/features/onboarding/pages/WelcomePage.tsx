import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Zap, Shield, HeadphonesIcon, ArrowRight, Crown, Star } from 'lucide-react';
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
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'premium'>('premium');

  const createTrialSubscription = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Creating trial subscription for user:', user.id);
      const subInfo = await SubscriptionService.createTrialSubscription(user.id);
      console.log('Trial subscription created:', subInfo);
    } catch (error) {
      console.error('Error creating trial subscription:', error);
    }
  }, [user]);

  const createPremiumSubscription = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('Creating premium subscription for user:', user.id);
      // Ici vous pourriez intégrer une solution de paiement comme Stripe
      // Pour l'instant, on crée juste un abonnement premium
      const subInfo = await SubscriptionService.createPremiumSubscription(user.id);
      console.log('Premium subscription created:', subInfo);
    } catch (error) {
      console.error('Error creating premium subscription:', error);
    }
  }, [user]);

  const handleContinue = async () => {
    setIsLoading(true);
    
    try {
      if (selectedPlan === 'trial') {
        await createTrialSubscription();
      } else {
        await createPremiumSubscription();
      }
      
      // Mark pricing as seen in database
      const result = await markPricingAsSeen();
      if (result.success) {
        // Reload the page to trigger normal app flow
        window.location.href = '/';
      } else {
        console.error('Error marking pricing as seen:', result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
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
            Choisissez l'offre qui vous convient pour démarrer
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Trial Plan */}
          <div 
            className={`bg-white rounded-2xl shadow-sm p-8 border-2 transition-all cursor-pointer ${
              selectedPlan === 'trial' 
                ? 'border-slate-900 shadow-lg' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => setSelectedPlan('trial')}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4">
                <Zap className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Essai Gratuit</h3>
              <p className="text-slate-600">Testez toutes les fonctionnalités</p>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-slate-900">0€</span>
              <span className="text-slate-600">/14 jours</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                'Accès complet à toutes les fonctionnalités',
                'Gestion illimitée des produits et stocks',
                'Suivi complet des ventes et revenus',
                'Rapports détaillés et analytics',
                'Gestion des dépenses et notes de frais',
                'Export des données en CSV',
                'Support par email'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlan('trial');
              }}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedPlan === 'trial'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {selectedPlan === 'trial' ? '✓ Sélectionné' : 'Choisir cette offre'}
            </button>
          </div>

          {/* Premium Plan */}
          <div 
            className={`bg-white rounded-2xl shadow-sm p-8 border-2 transition-all cursor-pointer relative ${
              selectedPlan === 'premium' 
                ? 'border-green-600 shadow-lg' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => setSelectedPlan('premium')}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Recommandé
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <Crown className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
              <p className="text-slate-600">Pour les professionnels sérieux</p>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-slate-900">19€</span>
              <span className="text-slate-600">/mois</span>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                'Tout ce qui est inclus dans l\'essai',
                'Accès illimité et permanent',
                'Sauvegarde automatique quotidienne',
                'Support prioritaire 24/7',
                'Fonctionnalités avancées futures',
                'Export avancé (Excel, PDF)',
                'Intégrations avec d\'outils',
                'Formation personnalisée'
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlan('premium');
              }}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedPlan === 'premium'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {selectedPlan === 'premium' ? '✓ Sélectionné' : 'Choisir cette offre'}
            </button>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-slate-50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {selectedPlan === 'premium' 
                ? '🚀 Démarrez immédiatement avec Premium' 
                : '🎯 Testez gratuitement pendant 14 jours'
              }
            </h2>
            <p className="text-slate-600 mb-6">
              {selectedPlan === 'premium'
                ? 'Accédez immédiatement à toutes les fonctionnalités premium et boostez votre activité.'
                : 'Explorez toutes les fonctionnalités sans engagement. Annulez à tout moment.'
              }
            </p>
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedPlan === 'premium'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Chargement...
                </>
              ) : (
                <>
                  {selectedPlan === 'premium' ? "S'abonner à Premium" : 'Commencer l\'essai gratuit'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            <p className="text-slate-500 text-sm mt-4">
              {selectedPlan === 'premium' 
                ? 'Paiement sécurisé • Annulation à tout moment'
                : 'Aucune carte de crédit requise • Annulation à tout moment'
              }
            </p>
          </div>

          {selectedPlan === 'trial' && (
            <div className="text-slate-500 text-sm">
              <p>Après votre essai, vous pourrez choisir de vous abonner à notre offre Premium à 19€/mois</p>
              <p>ou continuer avec certaines fonctionnalités limitées.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
