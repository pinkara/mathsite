# 🔧 Guide Complet : Configurer Supabase Correctement

## 🎯 Objectif
- Stocker les données (cours, livres, etc.) en ligne
- Partager les données entre tous les appareils
- Stocker les images et PDFs en ligne

---

## Étape 1 : Créer un nouveau projet Supabase

1. Va sur https://supabase.com
2. Connecte-toi (crée un compte si besoin)
3. Clique sur **"New Project"**
4. Remplis :
   - **Name** : `mathunivers`
   - **Database Password** : Crée un mot de passe sécurisé (garde-le !)
   - **Region** : Choisis l'Europe (Frankfurt) ou US selon ta localisation
5. Clique sur **"Create new project"**
6. Attends 1-2 minutes que le projet soit créé

---

## Étape 2 : Récupérer les clés API

1. Dans ton projet Supabase, clique sur l'icône **⚙️ Settings** (en bas à gauche)
2. Clique sur **API** dans le menu
3. Copie ces deux valeurs :
   - **Project URL** : `https://xxxxxxxx.supabase.co`
   - **anon public** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Étape 3 : Mettre à jour le fichier .env

1. Ouvre le fichier `app/.env` sur ton PC
2. Remplace par tes nouvelles valeurs :

```env
VITE_SUPABASE_URL=https://TON_URL.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TA_CLE_ICI
```

---

## Étape 4 : Créer les tables dans Supabase

1. Dans Supabase, clique sur **SQL Editor** (dans le menu de gauche)
2. Clique sur **"New query"**
3. Copie-colle ce script complet :

```sql
-- ============================================
-- CRÉATION DES TABLES POUR MATHUNIVERS
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

-- ============================================
-- SÉCURITÉ : DÉSACTIVER RLS (accès public)
-- ============================================

ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE problems DISABLE ROW LEVEL SECURITY;
ALTER TABLE formulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

GRANT ALL ON courses TO anon;
GRANT ALL ON problems TO anon;
GRANT ALL ON formulas TO anon;
GRANT ALL ON books TO anon;
GRANT ALL ON courses TO authenticated;
GRANT ALL ON problems TO authenticated;
GRANT ALL ON formulas TO authenticated;
GRANT ALL ON books TO authenticated;
```

4. Clique sur **Run** (bouton vert en bas à droite)

---

## Étape 5 : Créer les buckets de stockage

Les buckets sont des "dossiers" pour stocker les images et PDFs.

### Bucket 1 : "images" (pour les images des cours)

1. Dans Supabase, clique sur **Storage** (dans le menu de gauche)
2. Clique sur **"New bucket"**
3. **Name** : `images`
4. ✅ Coche **"Public bucket"**
5. Clique sur **"Create bucket"**
6. Clique sur le bucket `images` > **Policies** > **Add policies**
7. Ajoute ces 3 politiques :

**Politique SELECT (lecture)** :
- Policy name : `Allow public read`
- Allowed operation : SELECT
- Target roles : `anon`, `authenticated`
- Policy definition : `true`

**Politique INSERT (upload)** :
- Policy name : `Allow public upload`
- Allowed operation : INSERT
- Target roles : `anon`, `authenticated`
- Policy definition : `true`

**Politique DELETE** :
- Policy name : `Allow public delete`
- Allowed operation : DELETE
- Target roles : `anon`, `authenticated`
- Policy definition : `true`

### Bucket 2 : "documents" (pour les PDFs)

1. Clique sur **"New bucket"**
2. **Name** : `documents`
3. ✅ Coche **"Public bucket"**
4. Clique sur **"Create bucket"**
5. Ajoute les mêmes 3 politiques que ci-dessus

### Bucket 3 : "covers" (pour les couvertures de livres)

1. Clique sur **"New bucket"**
2. **Name** : `covers`
3. ✅ Coche **"Public bucket"**
4. Clique sur **"Create bucket"**
5. Ajoute les mêmes 3 politiques que ci-dessus

---

## Étape 6 : Redémarrer le serveur local

1. Arrête le serveur (`Ctrl+C` dans le terminal)
2. Relance :
```bash
cd app
npm run dev
```

---

## Étape 7 : Tester

1. Ajoute un cours avec une image
2. Vérifie dans Supabase (Table Editor > courses) que le cours apparaît
3. Vérifie dans Storage > images que l'image est uploadée
4. Rafraîchis la page : l'image et le cours doivent toujours être là

---

## Étape 8 : Déployer sur GitHub Pages

### Configurer les secrets sur GitHub

1. Va sur https://github.com/pinkara/mathsite/settings/secrets/actions
2. Clique sur **"New repository secret"**
3. Ajoute :
   - **Name** : `VITE_SUPABASE_URL`
   - **Value** : Ton URL Supabase (`https://...supabase.co`)
4. Clique sur **Add secret**
5. Ajoute un autre secret :
   - **Name** : `VITE_SUPABASE_ANON_KEY`
   - **Value** : Ta clé anon (`eyJhbG...`)

### Pousser le code

```bash
cd "c:\Users\tomam\OneDrive\Documents\projet_sur_VSC\mathsite"
git add .
git commit -m "Configuration Supabase pour données partagées"
git push origin main
```

Attends 2-3 minutes que GitHub Pages se mette à jour.

---

## ✅ Vérification finale

| Test | Résultat attendu |
|------|------------------|
| Ajouter un cours sur PC | Visible sur le téléphone |
| Ajouter un livre sur téléphone | Visible sur le PC |
| Uploader une image | L'image persiste après rafraîchissement |
| Uploader un PDF | Le PDF est accessible partout |

---

## 🆘 Si ça ne marche pas

### Erreur "Invalid API key"
- Vérifie que tu as copié la bonne clé (anon public, pas service_role)
- Regénère la clé dans Supabase : Settings > API > "Generate new secret"

### Les images ne s'affichent pas
- Vérifie que le bucket "images" est bien en "Public"
- Vérifie les politiques de sécurité du bucket

### Les données ne sont pas partagées
- Ouvre la console du navigateur (F12)
- Regarde s'il y a des erreurs 401 ou des messages Supabase
- Vérifie que les tables contiennent des données (SQL Editor : `SELECT * FROM courses`)

---

Une fois tout configuré, tous les utilisateurs verront les mêmes données ! 🎉
