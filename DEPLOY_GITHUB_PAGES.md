# 🚀 Déployer MathUnivers sur GitHub Pages

Ce guide explique comment déployer ton application sur GitHub Pages pour y accéder depuis n'importe quel ordinateur.

---

## 📋 Résumé des étapes

1. **Configurer les secrets Supabase sur GitHub**
2. **Activer GitHub Pages dans les settings**
3. **Pousser le code sur GitHub** → Le déploiement se fait automatiquement !
4. **Accéder au site web**

---

## Étape 1 : Configurer les secrets sur GitHub

Les secrets sont des variables sensibles (comme tes clés Supabase) que tu ne veux pas exposer publiquement.

1. Va sur ton repo GitHub : https://github.com/pinkara/mathsite
2. Clique sur l'onglet **Settings** (en haut)
3. Dans le menu de gauche, clique sur **Secrets and variables** > **Actions**
4. Clique sur **New repository secret**
5. Ajoute ces 2 secrets :

### Secret 1 : `VITE_SUPABASE_URL`
- **Name** : `VITE_SUPABASE_URL`
- **Value** : `https://gfynmzwbqyhzaydfaojy.supabase.co` (ou ton URL Supabase)

### Secret 2 : `VITE_SUPABASE_ANON_KEY`
- **Name** : `VITE_SUPABASE_ANON_KEY`
- **Value** : Ta clé anonyme Supabase (commence par `eyJhbGciOiJIUzI1Ni...`)

> 💡 Ces valeurs sont dans ton fichier `app/.env`

---

## Étape 2 : Activer GitHub Pages

1. Toujours dans **Settings**, clique sur **Pages** dans le menu de gauche
2. Sous **Build and deployment** :
   - **Source** : Sélectionne **GitHub Actions**
3. Sauvegarde (si nécessaire)

---

## Étape 3 : Pousser le code sur GitHub

Ouvre ton terminal et exécute ces commandes :

```bash
# Se déplacer dans le dossier du projet
cd c:\Users\tomam\OneDrive\Documents\projet_sur_VSC\mathsite

# Vérifier l'état
git status

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit
git commit -m "Configuration déploiement GitHub Pages + Supabase"

# Pousser sur GitHub
git push origin main
```

Ou si tu es sur la branche `master` :
```bash
git push origin master
```

---

## Étape 4 : Vérifier le déploiement

### Sur GitHub :
1. Va sur ton repo : https://github.com/pinkara/mathsite
2. Clique sur l'onglet **Actions** (en haut)
3. Tu devrais voir un workflow "Deploy to GitHub Pages" en cours d'exécution
4. Attends que le point vert ✅ apparaisse (cela prend 2-3 minutes)

### Accéder au site :
Une fois le workflow terminé, ton site sera accessible à l'adresse :
```
https://pinkara.github.io/mathsite/
```

---

## 🔄 Déploiement automatique

Maintenant, à chaque fois que tu pousseras du code sur GitHub, le site se mettra à jour automatiquement !

```bash
# Après avoir fait des modifications
git add .
git commit -m "Description des changements"
git push origin main
```

Et c'est tout ! Le site se mettra à jour tout seul en 2-3 minutes.

---

## 🐛 Dépannage

### Le workflow échoue
1. Va sur **Actions** dans ton repo GitHub
2. Clique sur le workflow qui a échoué
3. Lis les logs pour voir l'erreur
4. Vérifie que les secrets sont bien configurés

### Le site s'affiche mais sans données
- Vérifie que les secrets Supabase sont correctement configurés (Étape 1)
- Vérifie que les tables Supabase existent bien

### Le site affiche une page 404
- Vérifie que tu as activé GitHub Actions comme source (Étape 2)
- Attends 2-3 minutes après le push
- Vide le cache de ton navigateur (Ctrl+F5)

### L'URL ne fonctionne pas
- L'URL doit être : `https://pinkara.github.io/mathsite/`
- Vérifie dans **Settings** > **Pages** l'URL affichée

---

## 📁 Structure des fichiers importants

```
mathsite/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Workflow de déploiement automatique
├── app/
│   ├── .env                    # Variables locales (pas sur GitHub)
│   ├── vite.config.ts          # Configuré pour GitHub Pages
│   └── ...
└── DEPLOY_GITHUB_PAGES.md      # Ce fichier
```

---

## ✅ Checklist avant déploiement

- [ ] Secrets `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` configurés sur GitHub
- [ ] GitHub Pages activé avec source "GitHub Actions"
- [ ] Tables Supabase créées (voir `supabase-setup.sql`)
- [ ] Buckets de stockage Supabase configurés
- [ ] Code poussé sur GitHub (`git push`)
- [ ] Workflow "Deploy to GitHub Pages" terminé avec succès

---

## 🎉 Une fois déployé

Tu pourras accéder à ton site depuis :
- 💻 Ton ordinateur
- 📱 Ton téléphone
- 🖥️ N'importe quel appareil avec internet

À l'adresse : **https://pinkara.github.io/mathsite/**

Bon déploiement ! 🚀
