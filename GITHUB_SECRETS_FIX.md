# 🔧 ERREUR 401 - Problème de Secrets GitHub

## ❌ Le problème

Les erreurs 401 sur le site GitHub Pages signifient que les variables d'environnement Supabase ne sont pas accessibles.

```
Failed to load resource: the server responded with a status of 401
```

## ✅ Solution étape par étape

### Étape 1 : Vérifier que les secrets existent

1. Va sur : https://github.com/pinkara/mathsite/settings/secrets/actions
2. Tu dois voir **2 secrets** :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**Si tu ne vois pas ces secrets**, passe à l'Étape 2.

**Si tu les vois déjà**, passe à l'Étape 3.

---

### Étape 2 : Ajouter les secrets

#### 2.1 Récupérer tes clés Supabase

1. Va sur ton dashboard Supabase : https://supabase.com/dashboard/projects
2. Clique sur ton projet
3. Clique sur **⚙️ Settings** (en bas à gauche)
4. Clique sur **API** dans le menu
5. Copie ces valeurs :
   - **Project URL** (ex: `https://gfynmzwbqyhzaydfaojy.supabase.co`)
   - **anon public** (une longue clé qui commence par `eyJhbG...`)

#### 2.2 Ajouter sur GitHub

1. Va sur https://github.com/pinkara/mathsite/settings/secrets/actions
2. Clique sur le bouton vert **"New repository secret"**
3. Premier secret :
   - **Name** : `VITE_SUPABASE_URL`
   - **Value** : Colle ton URL (ex: `https://gfynmzwbqyhzaydfaojy.supabase.co`)
   - Clique sur **Add secret**
4. Deuxième secret :
   - **Name** : `VITE_SUPABASE_ANON_KEY`
   - **Value** : Colle ta clé complète (le long texte qui commence par `eyJhbG...`)
   - Clique sur **Add secret**

---

### Étape 3 : Forcer un nouveau déploiement

Après avoir ajouté les secrets, il faut relancer le build :

#### Option A : Pousser un petit changement

```bash
cd "c:\Users\tomam\OneDrive\Documents\projet_sur_VSC\mathsite"
git add .
git commit -m "Trigger rebuild after adding secrets"
git push origin main
```

#### Option B : Relancer manuellement sur GitHub

1. Va sur : https://github.com/pinkara/mathsite/actions
2. Clique sur le dernier workflow **"Deploy to GitHub Pages"**
3. Clique sur le bouton **"Re-run jobs"** (en haut à droite)
4. Clique sur **"Re-run all jobs"**

---

### Étape 4 : Vérifier que ça marche

1. Attends 2-3 minutes que le build se termine
2. Rafraîchis ton site : https://pinkara.github.io/mathsite/
3. Ouvre la console (F12) et regarde si les erreurs 401 ont disparu

---

## 🔍 Vérification rapide

Si tu veux vérifier que les secrets sont bien utilisés, tu peux ajouter ce fichier temporairement :

### Créer `.github/workflows/test-secrets.yml`

```yaml
name: Test Secrets

on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Check if secrets exist
        run: |
          if [ -n "${{ secrets.VITE_SUPABASE_URL }}" ]; then
            echo "✅ VITE_SUPABASE_URL is set"
          else
            echo "❌ VITE_SUPABASE_URL is NOT set"
          fi
          
          if [ -n "${{ secrets.VITE_SUPABASE_ANON_KEY }}" ]; then
            echo "✅ VITE_SUPABASE_ANON_KEY is set"
          else
            echo "❌ VITE_SUPABASE_ANON_KEY is NOT set"
          fi
```

Puis va sur GitHub > Actions > "Test Secrets" > Run workflow.

---

## ⚠️ Erreurs courantes

### "Repository not found" quand tu ajoutes les secrets
- Assure-toi d'être sur le bon repo : `pinkara/mathsite`
- Vérifie que tu as les droits d'admin sur le repo

### La clé est trop longue / coupée
- La clé Supabase fait environ 200 caractères
- Assure-toi de copier TOUTE la clé, du début (`eyJ`) jusqu'à la fin

### Erreur "Unable to resolve action"
- Le workflow utilise des actions officielles, ça devrait marcher
- Si ça ne marche pas, vérifie que le fichier `.github/workflows/deploy.yml` existe bien

---

## 🆘 Si ça ne marche toujours pas

1. Vérifie que ton projet Supabase existe toujours :
   - https://supabase.com/dashboard/projects
   
2. Vérifie que la clé n'a pas expiré :
   - Dans Supabase > Settings > API
   - Si elle a expiré, génère-en une nouvelle

3. Vérifie que les tables existent dans Supabase :
   - SQL Editor : `SELECT * FROM courses LIMIT 1`

4. Contacte-moi avec :
   - Une capture d'écran de tes secrets GitHub (masque les valeurs !)
   - Une capture de la page Actions sur GitHub

---

## 📋 Résumé visuel

```
┌──────────────────────────────────────────────┐
│  1. Récupérer les clés Supabase              │
│     ↓                                        │
│  2. Ajouter les secrets sur GitHub           │
│     ↓                                        │
│  3. git push pour relancer le build          │
│     ↓                                        │
│  4. Attendre 2-3 minutes                     │
│     ↓                                        │
│  5. Tester le site                           │
└──────────────────────────────────────────────┘
```

**Important** : Les secrets ne sont pas appliqués rétroactivement. Il faut forcera un nouveau build après les avoir ajoutés !
