# 🔧 Configuration Supabase Complète - Résolution Erreur 401

## 🎯 Problème identifié

✅ Les secrets GitHub sont configurés  
❌ Mais la clé API est invalide pour le projet `gfynmzwbqyhzaydfaojy`  

**Cause probable** : Le projet a été supprimé, déplacé, ou la clé a été regénérée.

---

## ✅ Solution : Créer un nouveau projet Supabase

### Étape 1 : Créer le projet

1. Va sur https://supabase.com/dashboard/projects
2. Clique sur le bouton **"New Project"** (vert, en haut à droite)
3. Remplis le formulaire :
   - **Organization** : Choisis la tienne (probablement ton nom d'utilisateur)
   - **Project name** : `mathunivers`
   - **Database password** : Crée un mot de passe fort (garde-le quelque part !)
   - **Region** : Choisis `West Europe (Amsterdam)` ou `Central Europe (Frankfurt)`
4. Clique sur **"Create new project"**
5. ⏳ Attends 1-2 minutes que le projet soit créé

### Étape 2 : Récupérer les nouvelles clés

1. Une fois le projet créé, clique sur **⚙️ Settings** (en bas à gauche)
2. Clique sur **API** dans le menu
3. Copie ces deux valeurs dans un fichier texte :
   - **Project URL** : `https://XXXXXXXX.supabase.co` (nouvelle URL)
   - **anon public** : La longue clé qui commence par `eyJhbG...`

### Étape 3 : Créer les tables

1. Dans le menu de gauche, clique sur **SQL Editor**
2. Clique sur **"New query"**
3. Copie-colle ce script entier :

```sql
-- ============================================
-- TABLES POUR MATHUNIVERS
-- ============================================

-- Table des cours
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'course',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  categoryColor TEXT,
  categoryTextColor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des problèmes
CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'problem',
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  hints JSONB DEFAULT '[]'::jsonb,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des formules
CREATE TABLE IF NOT EXISTS formulas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tex TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des livres
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  pdfUrl TEXT,
  coverImage TEXT,
  uploadDate TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Désactiver RLS pour accès public
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE problems DISABLE ROW LEVEL SECURITY;
ALTER TABLE formulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- Permissions
GRANT ALL ON courses TO anon, authenticated;
GRANT ALL ON problems TO anon, authenticated;
GRANT ALL ON formulas TO anon, authenticated;
GRANT ALL ON books TO anon, authenticated;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_problems_level ON problems(level);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_formulas_category ON formulas(category);
CREATE INDEX IF NOT EXISTS idx_books_level ON books(level);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
```

4. Clique sur **"Run"** (bouton vert en bas à droite)
5. Tu devrais voir "Success. No rows returned"

### Étape 4 : Créer les buckets de stockage

#### Bucket "images" (pour les images des cours)

1. Dans le menu de gauche, clique sur **Storage**
2. Clique sur **"New bucket"**
3. **Name** : `images`
4. ✅ Coche **"Public bucket"**
5. Clique sur **Create bucket**
6. Clique sur le bucket `images` > **Policies** > **New policy**
7. Crée ces 3 politiques :

**Politique 1 - SELECT (lecture)** :
- Name: `Allow public read`
- Allowed operation: SELECT
- Target roles: ✅ anon, ✅ authenticated
- Policy definition: `true`

**Politique 2 - INSERT (upload)** :
- Name: `Allow public upload`
- Allowed operation: INSERT
- Target roles: ✅ anon, ✅ authenticated
- Policy definition: `true`

**Politique 3 - DELETE** :
- Name: `Allow public delete`
- Allowed operation: DELETE
- Target roles: ✅ anon, ✅ authenticated
- Policy definition: `true`

#### Bucket "documents" (pour les PDFs)

1. Clique sur **"New bucket"**
2. **Name** : `documents`
3. ✅ Coche **"Public bucket"**
4. Clique sur **Create bucket**
5. Ajoute les mêmes 3 politiques que ci-dessus

#### Bucket "covers" (pour les couvertures)

1. Clique sur **"New bucket"**
2. **Name** : `covers`
3. ✅ Coche **"Public bucket"**
4. Clique sur **Create bucket**
5. Ajoute les mêmes 3 politiques que ci-dessus

### Étape 5 : Mettre à jour les secrets GitHub

1. Va sur https://github.com/pinkara/mathsite/settings/secrets/actions
2. Trouve `VITE_SUPABASE_URL` → Clique sur **Update**
3. Colle la **nouvelle URL** (ex: `https://abcdefgh123456.supabase.co`)
4. Clique sur **Update secret**
5. Trouve `VITE_SUPABASE_ANON_KEY` → Clique sur **Update**
6. Colle la **nouvelle clé** complète
7. Clique sur **Update secret**

### Étape 6 : Mettre à jour le fichier local .env

Ouvre `app/.env` sur ton PC et remplace par les nouvelles valeurs :

```env
VITE_SUPABASE_URL=https://TON_NOUVELLE_URL.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...TA_NOUVELLE_CLE
```

### Étape 7 : Relancer le build

```bash
cd "c:\Users\tomam\OneDrive\Documents\projet_sur_VSC\mathsite"
git commit --allow-empty -m "Update to new Supabase project"
git push origin master
```

Attends 2-3 minutes.

### Étape 8 : Tester

1. Ouvre https://pinkara.github.io/mathsite/
2. Ouvre la console (F12)
3. Vérifie que tu vois la **nouvelle URL** dans les logs
4. Vérifie qu'il n'y a plus d'erreurs 401
5. Ajoute un cours avec une image
6. Rafraîchis : tout doit persister !

---

## 🎉 Résultat attendu

| Avant | Après |
|-------|-------|
| ❌ Erreur 401 | ✅ Données chargées |
| ❌ Images locales | ✅ Images sur Supabase |
| ❌ Pas de partage | ✅ Partage multi-appareils |

---

## 🆘 Si tu bloques

**Je peux te guider étape par étape en direct.** Dis-moi :
1. Où tu en es dans la procédure
2. Si tu vois une erreur spécifique
3. Ou si tu veux que je vérifie quelque chose

On va y arriver ! 💪
