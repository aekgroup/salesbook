import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { SubscriptionService, SubscriptionInfo } from '../data/supabase/subscriptionService';

export const SubscriptionBanner: React.FC = () => {
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

  if (!subscriptionInfo) {
    return null;
  }

  const getBannerContent = () => {
    switch (subscriptionInfo.status) {
      case 'trial':
        return {
          icon: <Clock className="h-4 w-4" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          message: `🎉 Période d'essai gratuite - ${subscriptionInfo.daysLeftInTrial} jours restants`,
        };
      case 'active':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          message: '✨ Abonnement Premium actif',
        };
      case 'expired':
        return {
          icon: <XCircle className="h-4 w-4" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          message: '⚠️ Abonnement expiré - Veuillez renouveler pour continuer',
        };
      case 'canceled':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200',
          textColor: 'text-slate-800',
          message: 'Abonnement annulé',
        };
      default:
        return null;
    }
  };

  const banner = getBannerContent();
  if (!banner) return null;

  return (
    <div className={`border-b ${banner.bgColor} ${banner.borderColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          {banner.icon}
          <span className={`font-medium ${banner.textColor}`}>
            {banner.message}
          </span>
          {subscriptionInfo.status === 'trial' && (
            <button 
              onClick={() => window.location.href = '/pricing'}
              className="ml-4 px-3 py-1 bg-amber-600 text-white rounded-md text-xs font-medium hover:bg-amber-700 transition-colors"
            >
              S'abonner maintenant
            </button>
          )}
          {subscriptionInfo.status === 'expired' && (
            <button 
              onClick={() => window.location.href = '/pricing'}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 transition-colors"
            >
              Renouveler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
