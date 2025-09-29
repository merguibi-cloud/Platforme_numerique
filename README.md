# Plateforme Numérique - Elite Society

Cette plateforme utilise Next.js avec Supabase pour la gestion des formations.

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

Créez un fichier `.env.local` avec vos variables d'environnement Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Lancement du serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) pour voir le résultat.

## 🏗️ Architecture

- **Frontend** : Next.js 15 avec TypeScript
- **Base de données** : Supabase (PostgreSQL)
- **Styling** : Tailwind CSS
- **Authentification** : Supabase Auth

## 📁 Structure du projet

- `src/app/` - Pages et composants Next.js
- `src/lib/` - Utilitaires et configuration Supabase
- `src/types/` - Types TypeScript
- `public/` - Assets statiques

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
