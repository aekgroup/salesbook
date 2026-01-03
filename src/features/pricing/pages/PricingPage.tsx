import React, { useEffect, useState } from 'react';
import { CheckCircle, Star, Clock, Zap, Shield, HeadphonesIcon, CreditCard } from 'lucide-react';
import { useSupabaseAuth } from '../../../hooks/useSupabaseAuth';
import { SubscriptionService, SubscriptionInfo } from '../../../data/supabase/subscriptionService';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

export const PricingPage: React.FC = () => {
  const { user } = useSupabaseAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    
    try {
      console.log('Loading subscription for user:', user.id);
      
      // Check if user has a subscription, create trial if not
      let subInfo = await SubscriptionService.getSubscriptionInfo(user.id);
      console.log('Subscription info:', subInfo);
      
      if (!subInfo) {
        console.log('No subscription found, creating trial...');
        await SubscriptionService.createTrialSubscription(user.id);
        subInfo = await SubscriptionService.getSubscriptionInfo(user.id);
        console.log('New subscription info:', subInfo);
      }
      
      setSubscriptionInfo(subInfo);
    } catch (error) {
      console.error('Error loading subscription:', error);
      // En cas d'erreur, on affiche quand même quelque chose pour le debug
      setSubscriptionInfo({
        id: 'debug',
        status: 'trial',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        planType: 'premium',
        daysLeftInTrial: 14,
        isExpired: false,
        canAccessApp: true
      });
    }
  };

  const plans: PricingPlan[] = [
    {
      name: 'Essai Gratuit',
      price: '0€',
      period: '14 jours',
      description: 'Testez toutes les fonctionnalités',
      features: [
        'Gestion illimitée des produits',
        'Suivi des ventes',
        'Rapports de base',
        'Support par email',
        'Export des données',
      ],
      current: subscriptionInfo?.status === 'trial',
    },
    {
      name: 'Premium',
      price: '19€',
      period: '/ mois',
      description: 'Pour les professionnels',
      features: [
        'Tout de l\'essai gratuit',
        'Rapports avancés',
        'Analytics détaillé',
        'Support prioritaire',
        'Sauvegarde automatique',
        'Multi-utilisateurs',
        'API d\'accès',
      ],
      popular: true,
      current: subscriptionInfo?.status === 'active',
    },
  ];

  const getPlanButton = (plan: PricingPlan) => {
    if (plan.current) {
      return (
        <button className="w-full bg-green-100 text-green-700 py-3 px-6 rounded-lg font-medium cursor-default">
          {subscriptionInfo?.status === 'trial' ? 'Essai actif' : 'Abonnement actif'}
        </button>
      );
    }

    if (subscriptionInfo?.status === 'trial') {
      return (
        <button className="w-full bg-slate-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-slate-800 transition-colors">
          S'abonner maintenant
        </button>
      );
    }

    if (subscriptionInfo?.status === 'expired') {
      return (
        <button className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors">
          Renouveler l'abonnement
        </button>
      );
    }

    return (
      <button className="w-full border border-slate-300 text-slate-700 py-3 px-6 rounded-lg font-medium hover:bg-slate-50 transition-colors">
        Choisir cette offre
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Tarifs Salesbook
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Choisissez le plan qui vous convient
        </p>
        
        {/* Statut d'abonnement actuel */}
        {subscriptionInfo && (
          <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            {subscriptionInfo.status === 'trial' && (
              <>
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="text-amber-700 font-medium">
                  Période d'essai : {subscriptionInfo.daysLeftInTrial} jours restants
                </span>
              </>
            )}
            {subscriptionInfo.status === 'active' && (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">
                  Abonnement Premium actif
                </span>
              </>
            )}
            {subscriptionInfo.status === 'expired' && (
              <>
                <CreditCard className="h-5 w-5 text-red-600" />
                <span className="text-red-700 font-medium">
                  Abonnement expiré
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 p-8 ${
              plan.popular
                ? 'border-slate-900 bg-slate-50'
                : 'border-slate-200 bg-white'
            } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Plus populaire
                </div>
              </div>
            )}

            {plan.current && (
              <div className="absolute -top-4 right-4">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Actif
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-slate-900">
                  {plan.price}
                </span>
                <span className="text-slate-600 ml-1">{plan.period}</span>
              </div>
              <p className="text-slate-600">{plan.description}</p>
            </div>

            <div className="mb-8">
              <ul className="space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {getPlanButton(plan)}
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-slate-50 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Toutes nos fonctionnalités
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Rapide et intuitif</h3>
            <p className="text-slate-600 text-sm">
              Interface moderne et facile à prendre en main
            </p>
          </div>
          <div className="text-center">
            <div className="bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Sécurisé</h3>
            <p className="text-slate-600 text-sm">
              Vos données sont protégées et sauvegardées
            </p>
          </div>
          <div className="text-center">
            <div className="bg-slate-900 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <HeadphonesIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Support dédié</h3>
            <p className="text-slate-600 text-sm">
              Notre équipe est là pour vous aider
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
          Questions fréquentes
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Puis-je changer de plan à tout moment ?
            </h3>
            <p className="text-slate-600">
              Oui, vous pouvez passer à un plan supérieur à tout moment. 
              Le changement sera effectif immédiatement.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Que se passe-t-il après ma période d'essai ?
            </h3>
            <p className="text-slate-600">
              Après 14 jours, votre essai expirera. Vous pourrez alors 
              souscrire à un abonnement Premium pour continuer à utiliser Salesbook.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="font-semibold text-slate-900 mb-2">
              Mes données sont-elles perdues si je ne m'abonne pas ?
            </h3>
            <p className="text-slate-600">
              Vos données sont conservées pendant 30 jours après l'expiration 
              de votre essai. Vous pourrez les exporter avant suppression.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
