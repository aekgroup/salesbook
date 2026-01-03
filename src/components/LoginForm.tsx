import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, User, Globe, CheckCircle } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { SignUpFormValues } from '../data/supabase/user-types';

const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Luxembourg', 'Monaco',
  'Maroc', 'Algérie', 'Tunisie', 'Sénégal', 'Côte d\'Ivoire', 'Mali',
  'Burkina Faso', 'Niger', 'Togo', 'Bénin', 'Guinée', 'Cameroun',
  'Tchad', 'République Démocratique du Congo', 'Congo', 'Gabon',
  'Madagascar', 'Maurice', 'Île Maurice', 'Autre'
];

export const LoginForm: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState<SignUpFormValues>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
    country: 'France'
  });

  const { signIn, signUp } = useSupabaseAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Validate form
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('Le nom et le prénom sont requis');
          setIsLoading(false);
          return;
        }
        if (!formData.country) {
          setError('Le pays est requis');
          setIsLoading(false);
          return;
        }

        const result = await signUp(formData);
        if (!result.success) {
          setError(result.error || 'Erreur lors de l\'inscription');
        } else {
          // Show success message and redirect to login
          setShowSuccessMessage(true);
          setTimeout(() => {
            setIsSignUp(false);
            resetForm();
            setShowSuccessMessage(false);
          }, 5000);
        }
      } else {
        const result = await signIn(formData.email, formData.password);
        if (!result.success) {
          setError(result.error || 'Erreur lors de l\'authentification');
        }
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      username: '',
      country: 'France'
    });
    setError('');
    setShowSuccessMessage(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">SB</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            {showSuccessMessage ? 'Inscription réussie !' : (isSignUp ? 'Créer un compte' : 'Connexion à Salesbook')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {showSuccessMessage 
              ? 'Un email de confirmation a été envoyé à votre adresse email.'
              : (isSignUp 
                ? 'Rejoignez-nous pour gérer votre activité commerciale'
                : 'Connectez-vous pour accéder à votre gestionnaire de ventes'
              )
            }
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium">Inscription réussie !</p>
                <p className="text-sm mt-1">
                  Un email de vérification a été envoyé à <strong>{formData.email}</strong>. 
                  Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.
                </p>
                <p className="text-sm mt-2 text-green-600">
                  Redirection vers la page de connexion dans quelques instants...
                </p>
              </div>
            </div>
          </div>
        )}

        {!showSuccessMessage && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">
                      Prénom
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required={isSignUp}
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="Jean"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">
                      Nom
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required={isSignUp}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        placeholder="Dupont"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                    Nom d'utilisateur (optionnel)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="jeandupont"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Si non renseigné, votre prénom sera utilisé
                  </p>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-slate-700">
                    Pays
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                      id="country"
                      name="country"
                      required={isSignUp}
                      value={formData.country}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-8 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    >
                      {COUNTRIES.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-slate-500">
                  Minimum 6 caractères
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <>
                  {isSignUp ? (
                    <UserPlus className="h-5 w-5 mr-2" />
                  ) : (
                    <LogIn className="h-5 w-5 mr-2" />
                  )}
                </>
              )}
              {isLoading ? 'Chargement...' : (isSignUp ? 'Créer un compte' : 'Se connecter')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {isSignUp 
                ? 'Déjà un compte ? Connectez-vous'
                : 'Pas de compte ? Créez-en un'
              }
            </button>
          </div>
          </form>
        )}
      </div>
    </div>
  );
};
