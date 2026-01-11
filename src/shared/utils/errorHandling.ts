/**
 * Système de gestion des erreurs user-friendly pour SalesBook
 * Convertit les erreurs techniques en messages compréhensibles pour l'utilisateur
 */

export interface DatabaseError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface ErrorMapping {
  [key: string]: {
    title: string;
    description: string;
    action?: string;
  };
}

// Mapping des codes d'erreur PostgreSQL vers messages user-friendly
const DATABASE_ERROR_MAPPING: ErrorMapping = {
  // Foreign key violations
  '23503': {
    title: 'Suppression impossible',
    description: 'Cet élément est utilisé par d\'autres enregistrements et ne peut pas être supprimé.',
    action: 'Supprimez d\'abord les enregistrements associés ou archivez cet élément.'
  },
  
  // Unique constraint violations
  '23505': {
    title: 'Doublon détecté',
    description: 'Un enregistrement avec ces informations existe déjà.',
    action: 'Vérifiez les valeurs uniques comme le SKU ou l\'email.'
  },
  
  // Not null violation
  '23502': {
    title: 'Champ obligatoire manquant',
    description: 'Un champ requis n\'a pas été rempli.',
    action: 'Vérifiez que tous les champs marqués comme obligatoires sont complétés.'
  },
  
  // Check constraint violation
  '23514': {
    title: 'Valeur invalide',
    description: 'La valeur fournie ne respecte pas les règles de validation.',
    action: 'Vérifiez le format et les valeurs autorisées pour ce champ.'
  },
  
  // String data right truncation
  '22001': {
    title: 'Texte trop long',
    description: 'Le texte saisi dépasse la longueur maximale autorisée.',
    action: 'Réduisez la longueur du texte.'
  },
  
  // Numeric value out of range
  '22003': {
    title: 'Valeur numérique hors limites',
    description: 'Le nombre saisi est trop grand ou trop petit.',
    action: 'Vérifiez les valeurs minimales et maximales autorisées.'
  },
  
  // Invalid text representation
  '22P02': {
    title: 'Format invalide',
    description: 'Le format des données n\'est pas correct.',
    action: 'Vérifiez le format attendu (nombre, date, etc.).'
  },
  
  // Connection errors
  '08006': {
    title: 'Connexion perdue',
    description: 'La connexion à la base de données a été interrompue.',
    action: 'Vérifiez votre connexion internet et réessayez.'
  },
  
  '08001': {
    title: 'Connexion impossible',
    description: 'Impossible de se connecter à la base de données.',
    action: 'Vérifiez votre connexion internet et réessayez plus tard.'
  },
  
  // Permission denied
  '42501': {
    title: 'Accès refusé',
    description: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
    action: 'Contactez votre administrateur.'
  }
};

// Mapping des erreurs Supabase spécifiques
const SUPABASE_ERROR_MAPPING: ErrorMapping = {
  // JWT errors
  'JWT_EXPIRED': {
    title: 'Session expirée',
    description: 'Votre session a expiré, veuillez vous reconnecter.',
    action: 'Reconnectez-vous à votre compte.'
  },
  
  'JWT_INVALID': {
    title: 'Session invalide',
    description: 'Votre session n\'est plus valide.',
    action: 'Reconnectez-vous à votre compte.'
  },
  
  // Auth errors
  'invalid_credentials': {
    title: 'Identifiants incorrects',
    description: 'L\'email ou le mot de passe est incorrect.',
    action: 'Vérifiez vos identifiants et réessayez.'
  },
  
  'email_already_exists': {
    title: 'Email déjà utilisé',
    description: 'Un compte avec cet email existe déjà.',
    action: 'Utilisez un autre email ou connectez-vous.'
  },
  
  'weak_password': {
    title: 'Mot de passe faible',
    description: 'Le mot de passe choisi n\'est pas assez sécurisé.',
    action: 'Choisissez un mot de passe plus complexe (8+ caractères, majuscules, chiffres).'
  },
  
  // Storage errors
  'storage_quota_exceeded': {
    title: 'Espace de stockage plein',
    description: 'L\'espace de stockage disponible est épuisé.',
    action: 'Supprimez des fichiers ou contactez votre administrateur.'
  }
};

/**
 * Détecte si une erreur est une erreur de base de données PostgreSQL
 */
export function isDatabaseError(error: any): error is DatabaseError {
  return error && typeof error === 'object' && 'code' in error;
}

/**
 * Détecte si une erreur est une erreur Supabase
 */
export function isSupabaseError(error: any): boolean {
  return error && typeof error === 'object' && 'error' in error;
}

/**
 * Extrait le code d'erreur d'une erreur Supabase ou PostgreSQL
 */
function extractErrorCode(error: any): string | undefined {
  if (isDatabaseError(error)) {
    return error.code;
  }
  
  if (isSupabaseError(error)) {
    return error.error?.error_code || error.error?.code;
  }
  
  if (error?.code) {
    return error.code;
  }
  
  return undefined;
}

/**
 * Obtient un message d'erreur user-friendly à partir d'une erreur technique
 */
export function getUserFriendlyError(error: unknown): { title: string; description: string; action?: string } {
  // Erreurs de base de données PostgreSQL/Supabase
  if (error && typeof error === 'object') {
    const errorCode = extractErrorCode(error);
    
    if (errorCode) {
      // Priorité au mapping des erreurs de base de données
      if (errorCode in DATABASE_ERROR_MAPPING) {
        return DATABASE_ERROR_MAPPING[errorCode];
      }
      
      // Ensuite au mapping des erreurs Supabase
      if (errorCode in SUPABASE_ERROR_MAPPING) {
        return SUPABASE_ERROR_MAPPING[errorCode];
      }
    }
    
    // Erreurs Supabase avec message d'erreur
    if ('message' in error && typeof error.message === 'string') {
      const message = error.message.toLowerCase();
      
      // Recherche de mots-clés dans le message
      if (message.includes('foreign key constraint')) {
        return DATABASE_ERROR_MAPPING['23503'];
      }
      
      if (message.includes('unique constraint') || message.includes('duplicate')) {
        return DATABASE_ERROR_MAPPING['23505'];
      }
      
      if (message.includes('not null')) {
        return DATABASE_ERROR_MAPPING['23502'];
      }
      
      if (message.includes('connection') || message.includes('network')) {
        return DATABASE_ERROR_MAPPING['08006'];
      }
    }
  }
  
  // Erreurs JavaScript standards
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return DATABASE_ERROR_MAPPING['08006'];
    }
    
    if (message.includes('permission') || message.includes('forbidden')) {
      return DATABASE_ERROR_MAPPING['42501'];
    }
  }
  
  // Message par défaut
  return {
    title: 'Erreur inattendue',
    description: 'Une erreur inattendue est survenue.',
    action: 'Réessayez ou contactez le support si le problème persiste.'
  };
}

/**
 * Formate un message d'erreur pour l'affichage dans un toast
 */
export function formatErrorForToast(error: unknown): { title: string; description: string } {
  const userError = getUserFriendlyError(error);
  
  return {
    title: userError.title,
    description: userError.action 
      ? `${userError.description} ${userError.action}`
      : userError.description
  };
}

/**
 * Formate un message d'erreur pour l'affichage dans un modal
 */
export function formatErrorForModal(error: unknown): { title: string; description: string; action?: string } {
  return getUserFriendlyError(error);
}
