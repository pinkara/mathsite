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
-- 2. DÉSACTIVER RLS (SOLUTION SIMPLE)
-- ============================================
-- Option A: Désactiver complètement RLS (accès public total)
-- C'est la solution la plus simple pour une application publique

ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE problems DISABLE ROW LEVEL SECURITY;
ALTER TABLE formulas DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. AUTORISATIONS POUR LA CLÉ ANONYME
-- ============================================
-- Permettre toutes les opérations avec la clé anonyme

-- Cours
GRANT ALL ON courses TO anon;
GRANT ALL ON courses TO authenticated;

-- Problèmes
GRANT ALL ON problems TO anon;
GRANT ALL ON problems TO authenticated;

-- Formules
GRANT ALL ON formulas TO anon;
GRANT ALL ON formulas TO authenticated;

-- Livres
GRANT ALL ON books TO anon;
GRANT ALL ON books TO authenticated;

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

-- ============================================
-- 5. ACTIVER LA RÉPLICATION POUR LES ABONNEMENTS (OPTIONNEL)
-- ============================================

alter publication supabase_realtime add table courses;
alter publication supabase_realtime add table problems;
alter publication supabase_realtime add table formulas;
alter publication supabase_realtime add table books;
