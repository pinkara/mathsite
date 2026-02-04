# 🔧 Erreur : Colonnes manquantes dans Supabase

## 🎯 Problème

Les tables Supabase n'ont pas toutes les colonnes nécessaires. C'est pourquoi tu as des erreurs 400 quand tu essaies d'ajouter des cours ou des livres.

## ❌ Erreurs visibles dans la console

```
Could not find the 'coverImage' column of 'books'
Could not find the 'categoryColor' column of 'courses'
```

## ✅ Solution rapide

### Étape 1 : Ouvrir SQL Editor dans Supabase

1. Va sur https://supabase.com/dashboard/project/mspelktopapwsdyyvrlw
2. Clique sur **SQL Editor** dans le menu de gauche
3. Clique sur **"New query"**

### Étape 2 : Coller et exécuter ce script

```sql
-- Ajouter les colonnes manquantes à la table courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS categoryColor TEXT,
ADD COLUMN IF NOT EXISTS categoryTextColor TEXT;

-- Ajouter les colonnes manquantes à la table books
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS pdfUrl TEXT,
ADD COLUMN IF NOT EXISTS coverImage TEXT;
```

4. Clique sur **"Run"** (bouton vert)

### Étape 3 : Vérifier que ça a fonctionné

Dans le même SQL Editor, exécute :

```sql
-- Voir toutes les colonnes de courses
SELECT column_name FROM information_schema.columns WHERE table_name = 'courses';

-- Voir toutes les colonnes de books
SELECT column_name FROM information_schema.columns WHERE table_name = 'books';
```

Tu devrais voir :
- **courses** : id, type, title, category, level, date, description, content, image, categoryColor, categoryTextColor, created_at
- **books** : id, title, author, description, level, category, pdfUrl, coverImage, uploadDate, created_at

### Étape 4 : Tester

1. Rafraîchis ton site local (F5)
2. Ajoute un cours avec une image
3. Ajoute un livre avec un PDF et une couverture
4. Vérifie que ça fonctionne sans erreur 400 !

---

## 📋 Récapitulatif des colonnes nécessaires

### Table `courses`
| Colonne | Type | Requis |
|---------|------|--------|
| id | TEXT | ✅ Oui |
| type | TEXT | ✅ Oui |
| title | TEXT | ✅ Oui |
| category | TEXT | ✅ Oui |
| level | TEXT | ✅ Oui |
| date | TEXT | ✅ Oui |
| description | TEXT | ✅ Oui |
| content | TEXT | ✅ Oui |
| image | TEXT | ❌ Non (ajouté) |
| categoryColor | TEXT | ❌ Non (ajouté) |
| categoryTextColor | TEXT | ❌ Non (ajouté) |
| created_at | TIMESTAMP | Auto |

### Table `books`
| Colonne | Type | Requis |
|---------|------|--------|
| id | TEXT | ✅ Oui |
| title | TEXT | ✅ Oui |
| author | TEXT | ✅ Oui |
| description | TEXT | ❌ Non |
| level | TEXT | ✅ Oui |
| category | TEXT | ✅ Oui |
| pdfUrl | TEXT | ❌ Non (ajouté) |
| coverImage | TEXT | ❌ Non (ajouté) |
| uploadDate | TEXT | ✅ Oui |
| created_at | TIMESTAMP | Auto |

---

## 🆘 Si ça ne marche toujours pas

### Option 1 : Recréer les tables complètement

Si l'ajout de colonnes ne fonctionne pas, recrée les tables :

```sql
-- Supprimer les tables existantes (ATTENTION : perte de données !)
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS formulas CASCADE;

-- Recréer courses avec TOUTES les colonnes
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'course',
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT DEFAULT '',
  categoryColor TEXT DEFAULT '#f0f9ff',
  categoryTextColor TEXT DEFAULT '#0284c7',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recréer books avec TOUTES les colonnes
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT DEFAULT '',
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  pdfUrl TEXT DEFAULT '',
  coverImage TEXT DEFAULT '',
  uploadDate TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recréer problems
CREATE TABLE problems (
  id TEXT PRIMARY KEY,
  type TEXT DEFAULT 'problem',
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT DEFAULT '',
  hints JSONB DEFAULT '[]'::jsonb,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recréer formulas
CREATE TABLE formulas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tex TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Désactiver RLS
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE problems DISABLE ROW LEVEL SECURITY;
ALTER TABLE formulas DISABLE ROW LEVEL SECURITY;

-- Permissions
GRANT ALL ON courses TO anon, authenticated;
GRANT ALL ON books TO anon, authenticated;
GRANT ALL ON problems TO anon, authenticated;
GRANT ALL ON formulas TO anon, authenticated;
```

### Option 2 : Vérifier via l'interface graphique

1. Supabase > Table Editor
2. Clique sur une table (ex: `courses`)
3. Clique sur **"Columns"** en haut
4. Vérifie que toutes les colonnes sont présentes

---

## ✅ Une fois corrigé

Les données que tu ajoutes seront :
- ✅ Stockées dans Supabase
- ✅ Accessibles depuis tous tes appareils
- ✅ Persistantes après rafraîchissement

**N'oublie pas de vider le cache local après correction :**
```javascript
localStorage.clear();
location.reload();
```
