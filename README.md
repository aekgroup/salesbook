# SalesBook

Une application de gestion de ventes et de stocks moderne avec React, TypeScript et Supabase.

## Fonctionnalités

- 📦 Gestion des produits (stock, prix, catégories)
- 💰 Suivi des ventes et des profits
- 📊 Tableaux de bord et rapports
- 🔐 Authentification utilisateur avec Supabase
- 🔄 Synchronisation cloud/multi-appareils
- 📱 Interface responsive et moderne

## Stack Technique

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Base de données**: Supabase (PostgreSQL)
- **Stockage local**: Dexie (IndexedDB) pour la migration
- **État**: React Query, React Hook Form
- **UI**: Lucide React, Headless UI

## Démarrage Rapide

### 1. Cloner le projet

```bash
git clone <repository-url>
cd salesbook
npm install
```

### 2. Configuration Supabase

1. Créez un nouveau projet sur [supabase.com](https://supabase.com)
2. Allez dans le SQL Editor de votre projet Supabase
3. Exécutez le script `supabase-schema.sql` pour créer les tables
4. Récupérez vos clés depuis Settings > API

### 3. Variables d'environnement

Copiez `.env.example` vers `.env.local` et configurez vos clés Supabase:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

### 4. Lancer l'application

```bash
npm start
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Migration depuis Dexie

L'application détecte automatiquement si vous avez des données locales (Dexie) et vous proposera de les migrer vers Supabase lors de votre première connexion.

## Scripts Disponibles

- `npm start` - Lance l'application en mode développement
- `npm run build` - Build pour la production
- `npm test` - Lance les tests
- `npm run lint` - Vérifie le code avec ESLint

## Structure du Projet

```
src/
├── components/          # Composants React réutilisables
├── data/              # Services de données
│   ├── dexie/         # Base de données locale (migration)
│   └── supabase/      # Services Supabase
├── features/          # Fonctionnalités métier
├── hooks/             # Hooks React personnalisés
├── shared/            # Types et constantes partagées
└── styles/            # Styles globaux
```

## Déploiement

### Build de Production

```bash
npm run build
```

Le dossier `build` contient l'application prête pour le déploiement.

### Déploiement sur Vercel/Netlify

1. Connectez votre dépôt Git
2. Configurez les variables d'environnement dans les settings du projet
3. Déployez automatiquement à chaque push

## Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonction`)
3. Commitez vos changements (`git commit -am 'Ajout d'une nouvelle fonction'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonction`)
5. Créez une Pull Request

## Licence

Ce projet est sous licence MIT.
