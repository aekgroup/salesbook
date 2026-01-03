import React from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { useApp } from '../app/AppProvider';

export const SubscriptionStatus: React.FC = () => {
  const { subscriptionInfo } = useApp();

  if (!subscriptionInfo) {
    return null;
  }

  const getStatusIcon = () => {
    switch (subscriptionInfo.status) {
      case 'trial':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-slate-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-600" />;
    }
  };

  const getStatusText = () => {
    switch (subscriptionInfo.status) {
      case 'trial':
        return `Période d'essai (${subscriptionInfo.daysLeftInTrial} jours restants)`;
      case 'active':
        return 'Abonnement actif';
      case 'expired':
        return 'Abonnement expiré';
      case 'canceled':
        return 'Abonnement annulé';
      default:
        return 'Statut inconnu';
    }
  };

  const getStatusColor = () => {
    switch (subscriptionInfo.status) {
      case 'trial':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'active':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'expired':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'canceled':
        return 'bg-slate-50 border-slate-200 text-slate-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getTrialEndsAt = () => {
    if (subscriptionInfo.trialEndsAt) {
      return new Date(subscriptionInfo.trialEndsAt).toLocaleDateString('fr-FR');
    }
    return null;
  };

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${getStatusColor()}`}>
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </div>
      
      {subscriptionInfo.status === 'trial' && subscriptionInfo.daysLeftInTrial !== undefined && (
        <div className="mt-1 text-xs opacity-75">
          {subscriptionInfo.daysLeftInTrial > 0 
            ? `L'essai se termine le ${getTrialEndsAt()}`
            : 'L\'essai se termine aujourd\'hui'
          }
        </div>
      )}
      
      {subscriptionInfo.status === 'expired' && (
        <div className="mt-2 text-xs">
          <button className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50">
            <CreditCard className="h-3 w-3" />
            Renouveler l'abonnement
          </button>
        </div>
      )}
    </div>
  );
};
