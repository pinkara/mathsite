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
}

// === PROBLÈMES ===
export interface ProblemHint {
  id: string;
  content: string;
  formulaRefs?: string[]; // Codes des formules référencées
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
  image?: string;
  imageCredits?: string; // Crédits de l'image de couverture
  date?: string;
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

// === ROUTES ===
export type Route = 
  | 'home' 
  | 'courses' 
  | 'problems' 
  | 'formulas' 
  | 'library' 
  | 'ide'
  | 'subjects'
  | 'admin' 
  | 'article';

export interface RouterState {
  route: Route;
  params?: {
    type?: 'course' | 'problem';
    id?: string;
    highlightFormula?: string;
    code?: string;
    language?: string;
  };
}
