-- ============================================
-- AJOUTER LES COLONNES MANQUANTES AUX TABLES
-- ============================================

-- Table COURSES : ajouter les colonnes manquantes
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS categoryColor TEXT,
ADD COLUMN IF NOT EXISTS categoryTextColor TEXT;

-- Table BOOKS : ajouter les colonnes manquantes
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS pdfUrl TEXT,
ADD COLUMN IF NOT EXISTS coverImage TEXT;

-- Vérifier les colonnes actuelles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'books' 
ORDER BY ordinal_position;
