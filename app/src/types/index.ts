// === TYPES MATHUNIVERS ===

// Niveaux scolaires avec leurs couleurs associées
export type Level = 
  | '6e' 
  | '5e' 
  | '4e' 
  | '3e' 
  | '2nde' 
  | '1re' 
  | 'Term' 
  | 'Prépa' 
  | 'Licence' 
  | 'Master' 
  | 'Expert';

export interface LevelConfig {
  name: Level;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  gradient: string;
}

export const LEVELS: LevelConfig[] = [
  { name: '6e', label: '6ème', color: '#06b6d4', bgColor: '#ecfeff', textColor: '#0891b2', gradient: 'from-cyan-400 to-cyan-500' },
  { name: '5e', label: '5ème', color: '#0ea5e9', bgColor: '#f0f9ff', textColor: '#0284c7', gradient: 'from-sky-400 to-sky-500' },
  { name: '4e', label: '4ème', color: '#3b82f6', bgColor: '#eff6ff', textColor: '#2563eb', gradient: 'from-blue-400 to-blue-500' },
  { name: '3e', label: '3ème', color: '#6366f1', bgColor: '#eef2ff', textColor: '#4f46e5', gradient: 'from-indigo-400 to-indigo-500' },
  { name: '2nde', label: '2nde', color: '#8b5cf6', bgColor: '#f5f3ff', textColor: '#7c3aed', gradient: 'from-violet-400 to-violet-500' },
  { name: '1re', label: '1ère', color: '#a855f7', bgColor: '#faf5ff', textColor: '#9333ea', gradient: 'from-purple-400 to-purple-500' },
  { name: 'Term', label: 'Terminale', color: '#d946ef', bgColor: '#fdf4ff', textColor: '#c026d3', gradient: 'from-fuchsia-400 to-fuchsia-500' },
  { name: 'Prépa', label: 'Prépa', color: '#ec4899', bgColor: '#fdf2f8', textColor: '#db2777', gradient: 'from-pink-400 to-pink-500' },
  { name: 'Licence', label: 'Licence', color: '#f43f5e', bgColor: '#fff1f2', textColor: '#e11d48', gradient: 'from-rose-400 to-rose-500' },
  { name: 'Master', label: 'Master', color: '#f97316', bgColor: '#fff7ed', textColor: '#ea580c', gradient: 'from-orange-400 to-orange-500' },
  { name: 'Expert', label: 'Expert', color: '#ef4444', bgColor: '#fef2f2', textColor: '#dc2626', gradient: 'from-red-400 to-red-500' },
];

export const getLevelConfig = (level: Level): LevelConfig => {
  return LEVELS.find(l => l.name === level) || LEVELS[0];
};

// === TYPE DE CONTENU : ACADÉMIQUE / EXOTIQUE ===
export type SubjectType = 'academic' | 'exotic';

export const SUBJECT_TYPE_LABELS: Record<SubjectType, string> = {
  academic: 'Programme scolaire',
  exotic: 'Olympiades & hors programme',
};

export const SUBJECT_TYPE_COLORS: Record<SubjectType, { bg: string; text: string; border: string }> = {
  academic: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  exotic: { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' },
};

// === FORMULES ===
export interface Formula {
  id: string;
  name: string;
  tex: string;
  category: string;
  description?: string;
  level: Level;
  code: string; // Code unique pour référencement
}

export interface FormulaCategory {
  name: string;
  description?: string;
  formulas: Formula[];
}

// === COURS ===
export interface Course {
  id: string;
  type: 'course';
  title: string;
  category: string;
  level: Level;
  date: string;
  description: string;
  content: string;
  image?: string;
  imageCredits?: string; // Crédits de l'image de couverture
  categoryColor?: string;
  categoryTextColor?: string;
  codeExample?: string; // Code Python/JavaScript pour l'IDE
  codeLanguage?: 'python' | 'javascript'; // Langage du code
  subjectType?: SubjectType; // 'academic' = programme scolaire, 'exotic' = olympiades/hors programme
}

// === PROBLÈMES ===
export interface ProblemHint {
  id: string;
  content: string;
  formulaRefs?: string[]; // Codes des formules référencées
}

export type AnswerVerificationType = 'exact' | 'numeric' | 'symbolic';

export interface ProblemAnswerField {
  id: string;
  label: string;
  latex: string;
  mathJson: string;
  type: AnswerVerificationType;
  allowedButtons?: string[];
}

export interface Problem {
  id: string;
  type: 'problem';
  title: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  level: Level;
  description: string;
  content: string;
  hints: ProblemHint[];
  solution?: string; // Solution détaillée du problème
  answer?: string; // Réponse texte simple (rétrocompatibilité)
  answerLatex?: string; // Réponse attendue en LaTeX
  answerMathJson?: string; // Réponse attendue en MathJSON (Compute Engine)
  answerType?: AnswerVerificationType; // Mode de vérification (legacy)
  answerFields?: ProblemAnswerField[]; // Nouveaux champs de réponse multiples
  allowedToolbarButtons?: string[]; // IDs des boutons du clavier autorisés (legacy, undefined = tout)
  image?: string;
  imageCredits?: string; // Crédits de l'image de couverture
  date?: string;
  subjectType?: SubjectType; // 'academic' = programme scolaire, 'exotic' = olympiades/hors programme
}

// === LIVRES / LIBRAIRIE ===
export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  level: Level;
  category: string;
  pdfUrl?: string;
  coverImage?: string;
  uploadDate: string;
  created_at?: string; // Champ auto-généré par Supabase
}

export type WorldId =
  | 'algebra'
  | 'analysis'
  | 'arithmetic'
  | 'combinatorics'
  | 'geometry'
  | 'logic'
  | 'financial-mathematics'
  | 'optimization'
  | 'probability'
  | 'statistics'
  | 'information-theory'
  | 'category-theory'
  | 'graph-theory'
  | 'number-theory'
  | 'topology';

export const WORLD_IDS: WorldId[] = [
  'algebra',
  'analysis',
  'arithmetic',
  'combinatorics',
  'geometry',
  'logic',
  'financial-mathematics',
  'optimization',
  'probability',
  'statistics',
  'information-theory',
  'category-theory',
  'graph-theory',
  'number-theory',
  'topology',
];

export interface Arena {
  id: string;
  worldId: WorldId;
  number: number;
  name: string;
  xpThreshold: number;
  unlocksCourseId?: string;
  exoticCourseTitle?: string;
}

export interface World {
  id: WorldId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  gradient: string;
  categories: string[];
  arenas: Arena[];
  minLevel?: Level; // Niveau scolaire minimum pour débloquer l'arène 1 de ce monde
}

export interface AuraDef {
  id: string;
  name: string;
  minArena: number;
  color: string;
  gradient: string;
  shadow: string;
  ring: string;
}

// === PROFIL ÉLÈVE / GAMIFICATION ===
export interface UserProfile {
  name: string;
  level: Level;
  xp: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  badges: string[];
  completedCourseIds: string[];
  completedProblemIds: string[];
  chestCount: number;
  unlockedChests: number;
  dailyActivity: { date: string; xp: number }[]; // historique complet
  // Gaming progression
  worldXp: Partial<Record<WorldId, number>>;
  currentArena: Partial<Record<WorldId, number>>;
  highestArena: number;
  aura: string | null;
  currency: number; // MathCoins
  unlockedCourseIds: string[];
  // Collection
  cardCollection: Record<string, MathematicianCard>;
}

export interface MathematicianCard {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
  collectedAt?: string;
  country?: string;
  dates?: string;
  birthYear?: number | null;
  deathYear?: number | null;
  bio?: string;
  contributions?: string[];
  wikipediaUrl?: string;
}

export type CardRarity = MathematicianCard['rarity'];

export const RARITY_COLORS: Record<CardRarity, { border: string; bg: string; text: string; glow: string }> = {
  common: { border: '#9ca3af', bg: '#f3f4f6', text: '#4b5563', glow: 'shadow-gray-200' },
  rare: { border: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', glow: 'shadow-blue-200' },
  epic: { border: '#a855f7', bg: '#faf5ff', text: '#7e22ce', glow: 'shadow-purple-200' },
  legendary: { border: '#f59e0b', bg: '#fffbeb', text: '#b45309', glow: 'shadow-amber-200' },
};

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string; // nom Lucide
  color: string;
}

export const BADGES: BadgeDef[] = [
  { id: 'first_lesson', name: 'Première leçon', description: 'Terminer une leçon interactive', icon: 'BookOpen', color: '#3b82f6' },
  { id: 'first_problem', name: 'Premier problème', description: 'Résoudre un problème', icon: 'Puzzle', color: '#f97316' },
  { id: 'streak_3', name: 'Sur la lancée', description: '3 jours de suite sur le site', icon: 'Flame', color: '#ef4444' },
  { id: 'streak_7', name: 'Semaine parfaite', description: '7 jours de suite sur le site', icon: 'Flame', color: '#f59e0b' },
  { id: 'problem_solver', name: 'Résolveur', description: 'Résoudre 10 problèmes', icon: 'Target', color: '#8b5cf6' },
  { id: 'mathematician', name: 'Mathématicien', description: 'Résoudre 50 problèmes', icon: 'Calculator', color: '#06b6d4' },
  { id: 'scientist', name: 'Scientifique', description: 'Résoudre 100 problèmes', icon: 'Microscope', color: '#ec4899' },
  { id: 'explorer', name: 'Explorateur', description: 'Terminer des cours dans 3 catégories différentes', icon: 'Compass', color: '#10b981' },
  { id: 'master', name: 'Maître', description: 'Atteindre 1000 XP', icon: 'Crown', color: '#eab308' },
  { id: 'collector', name: 'Collectionneur', description: 'Ouvrir 5 coffres', icon: 'Gift', color: '#06b6d4' },
  { id: 'cards_50', name: 'Collectionneur débutant', description: 'Obtenir 50 cartes MathUnivers', icon: 'LayoutGrid', color: '#22c55e' },
  { id: 'cards_100', name: 'Collectionneur confirmé', description: 'Obtenir 100 cartes MathUnivers', icon: 'LayoutGrid', color: '#3b82f6' },
  { id: 'cards_500', name: 'Collectionneur légendaire', description: 'Obtenir 500 cartes MathUnivers', icon: 'LayoutGrid', color: '#a855f7' },
  { id: 'legendary_3', name: 'Chasseur de légendes', description: 'Obtenir 3 cartes légendaires', icon: 'Crown', color: '#f59e0b' },
  { id: 'cards_all', name: 'Maître de la collection', description: 'Trouver toutes les cartes MathUnivers', icon: 'Sparkles', color: '#ec4899' },
];

export function getUserLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getXpForNextLevel(xp: number): { current: number; next: number; progress: number } {
  const level = getUserLevel(xp);
  const currentLevelXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return { current: xp - currentLevelXp, next: 100, progress };
}

export function getPlayerLevel(currentArena: Partial<Record<WorldId, number>>): number {
  return WORLD_IDS.reduce((acc, id) => acc + (currentArena[id] || 0), 0);
}

const LEVEL_ORDER_FOR_XP: Level[] = ['6e', '5e', '4e', '3e', '2nde', '1re', 'Term', 'Prépa', 'Licence', 'Master', 'Expert'];

export function getLevelFromXp(xp: number): Level {
  const levelNumber = Math.floor(xp / 1000) + 1;
  return LEVEL_ORDER_FOR_XP[Math.min(LEVEL_ORDER_FOR_XP.length - 1, Math.max(0, levelNumber - 1))];
}

export interface ArenaContent {
  id: string;
  worldId: WorldId;
  arenaNumber: number;
  contentType: 'course' | 'problem' | 'formula';
  contentId: string;
  isBonus?: boolean;
  isOlympiad?: boolean;
}

// === STATISTIQUES ===
export interface MonthlyStats {
  month: string;
  visits: number;
  uniqueVisitors: number;
  pageViews: number;
}

export interface SiteStats {
  totalVisits: number;
  monthlyStats: MonthlyStats[];
  coursesCount: number;
  problemsCount: number;
  formulasCount: number;
  booksCount: number;
}

// === TIMELINE ===
export interface TimelineEvent {
  id: string;
  date: string; // Format: YYYY-MM-DD (peut être une date ancienne, ex: -0300-01-01 pour 300 av. J.-C.)
  displayDate?: string; // Date affichée (ex: "300 av. J.-C.")
  title: string;
  description: string;
  category: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'cyan' | 'red' | 'amber';
  linkType: 'course' | 'problem' | 'formula' | 'external';
  linkId?: string; // ID du cours ou problème
  linkUrl?: string; // URL externe si linkType = 'external'
  icon?: string; // Nom de l'icône Lucide
  image?: string; // Image de couverture (miniature)
  mathematician?: string; // Nom du mathématicien associé
  period?: string; // Période (Antiquité, Moyen Âge, etc.)
  bubbleSize?: 'small' | 'medium' | 'large'; // Taille de la bulle dans la vue histography
}

// Période historique affichée comme bande sur la timeline
export interface TimelinePeriod {
  id: string;
  name: string; // Nom de la période (ex: "Antiquité")
  startYear: number; // Année de début (ex: -2000)
  endYear: number; // Année de fin (ex: 476)
  color: string; // Couleur de la bande
  description?: string;
}

// === ROUTES ===
export type Route = 
  | 'home' 
  | 'courses' 
  | 'problems' 
  | 'formulas' 
  | 'library' 
  | 'ide'
  | 'subjects'
  | 'timeline'
  | 'profile'
  | 'learn'
  | 'admin' 
  | 'article'
  | 'worlds'
  | 'collection';

export interface RouterState {
  route: Route;
  params?: {
    type?: 'course' | 'problem';
    id?: string;
    highlightFormula?: string;
    code?: string;
    language?: string;
    worldId?: WorldId;
    arenaNumber?: number;
  };
}
