-- Ajouter la colonne solution à la table problems
ALTER TABLE problems ADD COLUMN IF NOT EXISTS solution TEXT DEFAULT '';

-- Commentaire sur la colonne
COMMENT ON COLUMN problems.solution IS 'Solution détaillée du problème (HTML/MathJax)';
