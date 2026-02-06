-- Script pour ajouter les colonnes imagecredits aux tables courses et problems

-- Ajouter la colonne imagecredits à la table courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS imagecredits TEXT DEFAULT '';

-- Ajouter la colonne imagecredits à la table problems  
ALTER TABLE problems 
ADD COLUMN IF NOT EXISTS imagecredits TEXT DEFAULT '';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name IN ('courses', 'problems') 
AND column_name = 'imagecredits';
