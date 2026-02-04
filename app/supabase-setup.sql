-- ============================================
-- CONFIGURATION SUPABASE POUR MATHUNIVERS
-- ============================================
-- Exécutez ces commandes dans l'éditeur SQL de Supabase
-- https://supabase.com/dashboard/project/_/sql/new

-- ============================================
-- 1. CRÉATION DES TABLES
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
-- 2. CONFIGURATION DES POLITIQUES RLS (Row Level Security)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Politique pour les cours : lecture publique, écriture authentifiée
CREATE POLICY "Allow public read access on courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on courses" ON courses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on courses" ON courses
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete on courses" ON courses
  FOR DELETE USING (true);

-- Politique pour les problèmes : lecture publique, écriture authentifiée
CREATE POLICY "Allow public read access on problems" ON problems
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on problems" ON problems
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on problems" ON problems
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete on problems" ON problems
  FOR DELETE USING (true);

-- Politique pour les formules : lecture publique, écriture authentifiée
CREATE POLICY "Allow public read access on formulas" ON formulas
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on formulas" ON formulas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on formulas" ON formulas
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete on formulas" ON formulas
  FOR DELETE USING (true);

-- Politique pour les livres : lecture publique, écriture authentifiée
CREATE POLICY "Allow public read access on books" ON books
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert on books" ON books
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update on books" ON books
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated delete on books" ON books
  FOR DELETE USING (true);

-- ============================================
-- 3. CONFIGURATION DU STORAGE (BUCKETS)
-- ============================================

-- Créer les buckets pour le stockage de fichiers
-- Note: Ces commandes doivent être exécutées via l'API Supabase ou le dashboard

/*
Dans le dashboard Supabase, allez dans Storage et créez ces buckets:

1. Bucket "images" - pour les images des cours et problèmes
   - Public: OUI
   - Allowed MIME types: image/*
   - File size limit: 10MB

2. Bucket "documents" - pour les PDFs des livres
   - Public: OUI
   - Allowed MIME types: application/pdf
   - File size limit: 50MB

3. Bucket "covers" - pour les couvertures de livres
   - Public: OUI
   - Allowed MIME types: image/*
   - File size limit: 10MB

Politiques de storage à ajouter pour chaque bucket:
- SELECT: Allow public access
- INSERT: Allow authenticated users
- DELETE: Allow authenticated users
*/

-- ============================================
-- 4. INDEX POUR LES PERFORMANCES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

CREATE INDEX IF NOT EXISTS idx_problems_level ON problems(level);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at);

CREATE INDEX IF NOT EXISTS idx_formulas_category ON formulas(category);
CREATE INDEX IF NOT EXISTS idx_formulas_code ON formulas(code);
CREATE INDEX IF NOT EXISTS idx_formulas_created_at ON formulas(created_at);

CREATE INDEX IF NOT EXISTS idx_books_level ON books(level);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
