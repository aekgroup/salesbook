import { supabase } from './client';
import { SubscriptionRow, SubscriptionInsert } from './types';

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'canceled';

export interface SubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  planType: string;
  daysLeftInTrial?: number;
  isExpired: boolean;
  canAccessApp: boolean;
}

export class SubscriptionService {
  static async createTrialSubscription(userId: string): Promise<SubscriptionRow> {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 jours d'essai

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'trial',
        trial_ends_at: trialEndsAt.toISOString(),
        plan_type: 'premium'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createPremiumSubscription(userId: string): Promise<SubscriptionRow> {
    const subscriptionEndsAt = new Date();
    subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1); // 1 mois d'abonnement

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        status: 'active',
        subscription_ends_at: subscriptionEndsAt.toISOString(),
        plan_type: 'premium'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSubscription(userId: string): Promise<SubscriptionRow | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }
    
    return data || null;
  }

  static async updateSubscriptionStatus(
    userId: string, 
    status: SubscriptionStatus,
    subscriptionEndsAt?: Date
  ): Promise<SubscriptionRow> {
    const updateData: Partial<SubscriptionInsert> = { status };
    
    if (subscriptionEndsAt) {
      updateData.subscription_ends_at = subscriptionEndsAt.toISOString();
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSubscriptionInfo(userId: string): Promise<SubscriptionInfo | null> {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription) {
      return null;
    }

    const now = new Date();
    const trialEndsAt = subscription.trial_ends_at ? new Date(subscription.trial_ends_at) : null;
    const subscriptionEndsAt = subscription.subscription_ends_at ? new Date(subscription.subscription_ends_at) : null;
    
    let daysLeftInTrial: number | undefined;
    if (trialEndsAt && subscription.status === 'trial') {
      const diffTime = trialEndsAt.getTime() - now.getTime();
      daysLeftInTrial = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysLeftInTrial = Math.max(0, daysLeftInTrial);
    }

    const isExpired = 
      (subscription.status === 'trial' && trialEndsAt && now > trialEndsAt) ||
      (subscription.status === 'active' && subscriptionEndsAt && now > subscriptionEndsAt) ||
      subscription.status === 'expired';

    const canAccessApp = 
      subscription.status === 'trial' && (!trialEndsAt || now <= trialEndsAt) ||
      subscription.status === 'active' && (!subscriptionEndsAt || now <= subscriptionEndsAt);

    return {
      id: subscription.id,
      status: subscription.status,
      trialEndsAt: subscription.trial_ends_at || undefined,
      subscriptionEndsAt: subscription.subscription_ends_at || undefined,
      planType: subscription.plan_type,
      daysLeftInTrial,
      isExpired,
      canAccessApp
    };
  }

  static async checkAndExpireTrials(): Promise<void> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'expired' })
      .eq('status', 'trial')
      .lt('trial_ends_at', now);

    if (error) {
      console.error('Error expiring trials:', error);
    }
  }
}
