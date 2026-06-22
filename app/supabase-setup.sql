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
  imagecredits TEXT DEFAULT '',
  categoryColor TEXT,
  categoryTextColor TEXT,
  subjecttype TEXT DEFAULT 'academic',
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
  imagecredits TEXT DEFAULT '',
  hints JSONB DEFAULT '[]'::jsonb,
  date TEXT,
  subjecttype TEXT DEFAULT 'academic',
  answer TEXT,
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
-- 5. MISE À JOUR DES TABLES EXISTANTES
-- ============================================
-- Si vous avez déjà créé les tables, exécutez ces commandes :

-- Ajouter la colonne imagecredits à courses (si elle n'existe pas)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS imagecredits TEXT DEFAULT '';

-- Ajouter la colonne imagecredits à problems (si elle n'existe pas)
ALTER TABLE problems 
ADD COLUMN IF NOT EXISTS imagecredits TEXT DEFAULT '';

-- Ajouter la colonne subjecttype à courses (si elle n'existe pas)
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS subjecttype TEXT DEFAULT 'academic';

-- Ajouter la colonne subjecttype à problems (si elle n'existe pas)
ALTER TABLE problems 
ADD COLUMN IF NOT EXISTS subjecttype TEXT DEFAULT 'academic';

-- ============================================
-- 6. ACTIVER LA RÉPLICATION POUR LES ABONNEMENTS (OPTIONNEL)
-- ============================================

alter publication supabase_realtime add table courses;
alter publication supabase_realtime add table problems;
alter publication supabase_realtime add table formulas;
alter publication supabase_realtime add table books;

-- ============================================
-- 7. TABLE DES PROFILS ÉLÈVES (GAMIFICATION)
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT 'Term',
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT NOT NULL DEFAULT '',
  badges TEXT[] NOT NULL DEFAULT '{}',
  completed_course_ids TEXT[] NOT NULL DEFAULT '{}',
  completed_problem_ids TEXT[] NOT NULL DEFAULT '{}',
  chest_count INTEGER NOT NULL DEFAULT 0,
  unlocked_chests INTEGER NOT NULL DEFAULT 0,
  weekly_activity JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_xp ON profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(streak DESC);

-- Créer automatiquement un profil vide à l'inscription
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, level)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''), 'Term');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Sécurité : chaque utilisateur gère son propre profil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Le leaderboard est public (lecture seule)
CREATE POLICY "Profiles are readable for leaderboard"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Autorisations pour la clé anonyme
GRANT ALL ON profiles TO anon;
GRANT ALL ON profiles TO authenticated;

-- Réplication temps réel (optionnel)
alter publication supabase_realtime add table profiles;

-- ============================================
-- 8. COLONNES POUR LES RÉPONSES MATHÉMATIQUES
-- ============================================

ALTER TABLE problems ADD COLUMN IF NOT EXISTS answer_latex TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS answer_math_json TEXT;
ALTER TABLE problems ADD COLUMN IF NOT EXISTS answer_type TEXT DEFAULT 'exact';

-- ============================================
-- 9. BOUTONS DU CLAVIER AUTORISÉS PAR PROBLÈME
-- ============================================

ALTER TABLE problems ADD COLUMN IF NOT EXISTS allowed_toolbar_buttons JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- 10. CHAMPS DE RÉPONSE MULTIPLES
-- ============================================

ALTER TABLE problems ADD COLUMN IF NOT EXISTS answer_fields JSONB DEFAULT '[]'::jsonb;
