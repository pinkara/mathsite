-- ============================================
-- AJOUTER LES COLONNES GAMING AU PROFIL
-- ============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS world_xp JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS current_arena JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS highest_arena INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS aura TEXT,
ADD COLUMN IF NOT EXISTS currency INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unlocked_course_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS daily_activity JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS card_collection JSONB DEFAULT '{}'::jsonb;

-- Vérifier les colonnes actuelles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
