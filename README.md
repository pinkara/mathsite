# 🧮 MathUnivers

Encyclopédie mathématique participative avec cours, problèmes, formules et librairie.

## 🌐 Site en ligne

Accédez au site ici : **https://pinkara.github.io/mathsite/**

## ✨ Fonctionnalités

- 📚 **Cours** : Apprenez avec des cours structurés par niveau et catégorie
- 🧩 **Problèmes** : Entraînez-vous avec des exercices de difficulté variée
- 📝 **Formules** : Consultez une bibliothèque de formules mathématiques
- 📖 **Librairie** : Accédez à des PDF et livres de mathématiques
- 👨‍💼 **Administration** : Ajoutez, modifiez et supprimez du contenu

## 🛠️ Technologies

- **Frontend** : React + TypeScript + Vite
- **Style** : Tailwind CSS
- **Base de données** : Supabase (PostgreSQL + Storage)
- **Hébergement** : GitHub Pages
- **Formules** : MathJax pour le rendu LaTeX

## 🚀 Déploiement

Voir le guide détaillé : [DEPLOY_GITHUB_PAGES.md](./DEPLOY_GITHUB_PAGES.md)

### Déploiement rapide

```bash
# 1. Configurer les secrets sur GitHub (voir DEPLOY_GITHUB_PAGES.md)

# 2. Pousser le code
git add .
git commit -m "Mise à jour"
git push origin main

# 3. Le site se met à jour automatiquement en 2-3 minutes !
```

## 📁 Structure du projet

```
mathsite/
├── app/                          # Application React
│   ├── src/
│   │   ├── components/           # Composants UI
│   │   ├── sections/             # Pages (Home, Courses, etc.)
│   │   ├── hooks/                # Hooks personnalisés
│   │   ├── lib/                  # Utilitaires (Supabase, etc.)
│   │   └── types/                # Types TypeScript
│   ├── .env                      # Variables d'environnement (local)
│   └── vite.config.ts            # Configuration Vite
├── .github/
│   └── workflows/
│       └── deploy.yml            # Workflow GitHub Actions
├── DEPLOY_GITHUB_PAGES.md        # Guide de déploiement
└── supabase-setup.sql            # Script SQL pour Supabase
```

## ⚙️ Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Exécutez le script `supabase-setup.sql` dans l'éditeur SQL
3. Créez les buckets de stockage : `images`, `documents`, `covers`
4. Configurez les variables d'environnement dans `app/.env`

## 🧪 Développement local

```bash
# Installation des dépendances
cd app
npm install

# Lancer le serveur de développement
npm run dev

# Construire pour la production
npm run build
```

## 📝 License

MIT License - Libre d'utilisation et de modification.

---

Créé avec ❤️ pour les passionnés de mathématiques.
