-- ============================================
-- TABLE DE MAPPING CONTENU / ARÈNE
-- ============================================

CREATE TABLE IF NOT EXISTS arena_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id TEXT NOT NULL,
  arena_number INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'problem', 'formula')),
  content_id TEXT NOT NULL,
  is_bonus BOOLEAN DEFAULT false,
  is_olympiad BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(world_id, arena_number, content_type, content_id)
);

-- Index pour accélérer la lecture par monde/arène
CREATE INDEX IF NOT EXISTS idx_arena_contents_world_arena
  ON arena_contents(world_id, arena_number);

-- Vérification
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'arena_contents'
ORDER BY ordinal_position;
