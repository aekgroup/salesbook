import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zuttkjuntjxmjjlhmcwx.supabase.co";
const supabaseAnonKey = "sb_publishable_UvdhaWiiHoS3IVvvEF-Cjg_5D0MhHJm"; // Remplacez par votre vraie clé complète

// Debug: afficher les valeurs pour vérifier
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Présente' : 'Manquante');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
