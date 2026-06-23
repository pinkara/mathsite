import { useState, useEffect, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Course, Problem, Formula, Book, MonthlyStats, TimelineEvent, UserProfile, Level, WorldId, ArenaContent } from '@/types';
import { getPlayerLevel, LEVELS } from '@/types';
import { getProblemWorldXp } from '@/lib/xpCalculator';
import { getCurrentArenaNumber, getAuraForHighestArena, getChestCurrencyReward, ARENA_COUNT, getStartingArena, WORLDS, getArenaBadgeId, getArenaContents } from '@/lib/worldsConfig';
import { openCardPack, ALL_CARDS } from '@/lib/mathematiciansParser';
import { deleteFileLocal } from '@/lib/fileStorage';
import {
  supabase,
  fetchCourses,
  fetchProblems,
  fetchFormulas,
  fetchBooks,
  addCourseToDB,
  addProblemToDB,
  addFormulaToDB,
  addBookToDB,
  updateCourseInDB,
  updateProblemInDB,
  updateFormulaInDB,
  deleteCourseFromDB,
  deleteProblemFromDB,
  deleteFormulaFromDB,
  deleteBookFromDB,
  uploadImage,
  uploadPDF,
} from '@/lib/supabase';

// === CLÉS DE STOCKAGE LOCAL (CACHE) ===
const STORAGE_KEYS = {
  COURSES: 'mathunivers_courses',
  PROBLEMS: 'mathunivers_problems',
  FORMULAS: 'mathunivers_formulas',
  BOOKS: 'mathunivers_books',
  TIMELINE: 'mathunivers_timeline_v2',
  VIEWS: 'mathunivers_views',
  MONTHLY_STATS: 'mathunivers_monthly_stats',
  ADMIN_SESSION: 'mathunivers_admin',
  LIKES: 'mathunivers_likes',
  VOTES: 'mathunivers_votes',
  USER_PROFILE: 'mathunivers_user_profile',
  ARENA_CONTENTS: 'mathunivers_arena_contents',
} as const;

// === FONCTIONS UTILITAIRES POUR LE CACHE LOCAL ===
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err: any) {
    if (err && (err.name === 'QuotaExceededError' || err.code === 22 || err.number === -2147024882)) {
      console.warn('LocalStorage quota exceeded when saving', key);
      if (key === STORAGE_KEYS.BOOKS) {
        try {
          const arr = Array.isArray(data) ? (data as any[]) : [];
          const sanitized = arr.map(b => ({
            ...b,
            pdfUrl: b.pdfUrl && typeof b.pdfUrl === 'string' && b.pdfUrl.startsWith('data:') ? '' : b.pdfUrl,
            coverImage: b.coverImage && typeof b.coverImage === 'string' && b.coverImage.startsWith('data:') ? '' : b.coverImage,
          }));
          localStorage.setItem(key, JSON.stringify(sanitized));
          return;
        } catch (e) {
          console.error('Failed to save sanitized books to localStorage', e);
        }
      }
      try { localStorage.removeItem(STORAGE_KEYS.BOOKS); } catch (e) {}
    }
    throw err;
  }
}

// === UTILITAIRES POUR LES DATES DE LA TIMELINE ===
function getTimelineYear(dateStr: string): number {
  const rawYear = dateStr.replace(/^-/, '').split('-')[0] || '0';
  const year = parseInt(rawYear, 10) || 0;
  return dateStr.startsWith('-') ? -year : year;
}

function compareTimelineDates(a: string, b: string): number {
  return getTimelineYear(a) - getTimelineYear(b);
}

// === VÉRIFIER SI SUPABASE EST CONFIGURÉ ===
const isSupabaseConfigured = () => {
  return !!supabase;
};

// === HOOK POUR LA CONFIGURATION DES ARÈNES ===
export function useArenaContents() {
  const [arenaContents, setArenaContents] = useState<ArenaContent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const cached = loadFromStorage<ArenaContent[]>(STORAGE_KEYS.ARENA_CONTENTS, []);
    setArenaContents(cached);
    setIsLoaded(true);
  }, []);

  const addArenaContent = useCallback((content: Omit<ArenaContent, 'id'>) => {
    setArenaContents(prev => {
      const newContent: ArenaContent = { ...content, id: `ac-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
      const updated = [...prev, newContent];
      saveToStorage(STORAGE_KEYS.ARENA_CONTENTS, updated);
      return updated;
    });
  }, []);

  const updateArenaContent = useCallback((id: string, updates: Partial<ArenaContent>) => {
    setArenaContents(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      saveToStorage(STORAGE_KEYS.ARENA_CONTENTS, updated);
      return updated;
    });
  }, []);

  const removeArenaContent = useCallback((id: string) => {
    setArenaContents(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage(STORAGE_KEYS.ARENA_CONTENTS, updated);
      return updated;
    });
  }, []);

  return { arenaContents, isLoaded, addArenaContent, updateArenaContent, removeArenaContent };
}

// === HOOK POUR LES COURS (SUPABASE PRIORITAIRE) ===
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger depuis Supabase en PRIORITÉ
  useEffect(() => {
    const loadCourses = async () => {
      if (isSupabaseConfigured()) {
        try {
          console.log('Loading courses from Supabase...');
          const data = await fetchCourses();
          console.log('Courses from Supabase:', data?.length || 0);
          
          if (data) {
            // Normaliser les données pour ajouter les champs manquants avec valeurs par défaut
            const normalizedData = data.map(course => ({
              ...course,
              image: course.image || '',
              imageCredits: course.imageCredits || '',
              categoryColor: course.categoryColor || '#f0f9ff',
              categoryTextColor: course.categoryTextColor || '#0284c7',
              subjectType: course.subjectType || 'academic',
            }));
            setCourses(normalizedData);
            saveToStorage(STORAGE_KEYS.COURSES, normalizedData);
          }
        } catch (error) {
          console.error('Error loading courses from Supabase:', error);
          // En cas d'erreur → fallback sur le cache local
          const cached = loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
          setCourses(cached);
        }
      } else {
        // Mode hors ligne → utiliser le cache local
        console.log('Supabase not configured, using local cache');
        const cached = loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
        setCourses(cached);
      }
      setIsLoaded(true);
    };
    
    loadCourses();
  }, []);

  const addCourse = useCallback(async (course: Omit<Course, 'id' | 'type' | 'date'>) => {
    const newCourse: Course = {
      ...course,
      id: `c${Date.now()}`,
      type: 'course',
      date: new Date().toISOString().split('T')[0],
      // Assurer que les champs optionnels ne sont pas undefined
      image: course.image || '',
      imageCredits: course.imageCredits || '',
      categoryColor: course.categoryColor || '#f0f9ff',
      categoryTextColor: course.categoryTextColor || '#0284c7',
      subjectType: course.subjectType || 'academic',
    };
    
    // Ajouter d'abord à Supabase si configuré
    if (isSupabaseConfigured()) {
      const dbCourse = await addCourseToDB(newCourse);
      if (dbCourse) {
        // Recharger depuis Supabase pour avoir les données à jour
        const freshData = await fetchCourses();
        setCourses(freshData);
        saveToStorage(STORAGE_KEYS.COURSES, freshData);
        return dbCourse;
      }
    }
    
    // Fallback: stockage local uniquement
    setCourses(prev => {
      const updated = [...prev, newCourse];
      saveToStorage(STORAGE_KEYS.COURSES, updated);
      return updated;
    });
    return newCourse;
  }, []);

  const updateCourse = useCallback(async (id: string, updates: Partial<Course>) => {
    // Mettre à jour dans Supabase d'abord
    if (isSupabaseConfigured()) {
      await updateCourseInDB(id, updates);
      // Recharger depuis Supabase
      const freshData = await fetchCourses();
      setCourses(freshData);
      saveToStorage(STORAGE_KEYS.COURSES, freshData);
      return;
    }
    
    // Fallback: mise à jour locale
    setCourses(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      saveToStorage(STORAGE_KEYS.COURSES, updated);
      return updated;
    });
  }, []);

  const removeCourse = useCallback(async (id: string) => {
    // Supprimer de Supabase d'abord
    if (isSupabaseConfigured()) {
      await deleteCourseFromDB(id);
      // Recharger depuis Supabase
      const freshData = await fetchCourses();
      setCourses(freshData);
      saveToStorage(STORAGE_KEYS.COURSES, freshData);
      return;
    }
    
    // Fallback: suppression locale
    setCourses(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveToStorage(STORAGE_KEYS.COURSES, updated);
      return updated;
    });
  }, []);

  const getCourseById = useCallback((id: string) => {
    return courses.find(c => c.id === id);
  }, [courses]);

  return { courses, addCourse, updateCourse, removeCourse, getCourseById, isLoaded };
}

// === HOOK POUR LES PROBLÈMES (SUPABASE PRIORITAIRE) ===
export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadProblems = async () => {
      if (isSupabaseConfigured()) {
        try {
          console.log('Loading problems from Supabase...');
          const data = await fetchProblems();
          console.log('Problems from Supabase:', data?.length || 0);
          
          if (data) {
            const normalizedData = data.map(problem => {
              const answerFields = problem.answerFields?.length
                ? problem.answerFields
                : (problem.answerLatex || problem.answer)
                  ? [{
                      id: 'legacy-1',
                      label: 'Réponse',
                      latex: problem.answerLatex || problem.answer || '',
                      mathJson: problem.answerMathJson || '',
                      type: problem.answerType || 'exact',
                      allowedButtons: problem.allowedToolbarButtons || [],
                    }]
                  : [];
              return {
                ...problem,
                subjectType: problem.subjectType || 'academic',
                answer: problem.answer || '',
                answerLatex: problem.answerLatex || '',
                answerMathJson: problem.answerMathJson || '',
                answerType: problem.answerType || 'exact',
                answerFields,
                allowedToolbarButtons: problem.allowedToolbarButtons || [],
              };
            });
            setProblems(normalizedData);
            saveToStorage(STORAGE_KEYS.PROBLEMS, normalizedData);
          }
        } catch (error) {
          console.error('Error loading problems from Supabase:', error);
          const cached = loadFromStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
          setProblems(cached);
        }
      } else {
        console.log('Supabase not configured, using local cache');
        const cached = loadFromStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
        setProblems(cached);
      }
      setIsLoaded(true);
    };
    
    loadProblems();
  }, []);

  const addProblem = useCallback(async (problem: Omit<Problem, 'id' | 'type' | 'date'>) => {
    const newProblem: Problem = {
      ...problem,
      id: `p${Date.now()}`,
      type: 'problem',
      date: new Date().toISOString().split('T')[0],
      // Assurer que les champs optionnels ne sont pas undefined
      image: problem.image || '',
      imageCredits: problem.imageCredits || '',
      hints: problem.hints || [],
      solution: problem.solution || '',
      answer: problem.answer || '',
      answerLatex: problem.answerLatex || '',
      answerMathJson: problem.answerMathJson || '',
      answerType: problem.answerType || 'exact',
      answerFields: problem.answerFields || [],
      allowedToolbarButtons: problem.allowedToolbarButtons || [],
      subjectType: problem.subjectType || 'academic',
    };
    
    if (isSupabaseConfigured()) {
      const dbProblem = await addProblemToDB(newProblem);
      if (dbProblem) {
        const freshData = await fetchProblems();
        setProblems(freshData);
        saveToStorage(STORAGE_KEYS.PROBLEMS, freshData);
        return dbProblem;
      }
    }
    
    setProblems(prev => {
      const updated = [...prev, newProblem];
      saveToStorage(STORAGE_KEYS.PROBLEMS, updated);
      return updated;
    });
    return newProblem;
  }, []);

  const updateProblem = useCallback(async (id: string, updates: Partial<Problem>) => {
    if (isSupabaseConfigured()) {
      await updateProblemInDB(id, updates);
      const freshData = await fetchProblems();
      setProblems(freshData);
      saveToStorage(STORAGE_KEYS.PROBLEMS, freshData);
      return;
    }
    
    setProblems(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      saveToStorage(STORAGE_KEYS.PROBLEMS, updated);
      return updated;
    });
  }, []);

  const removeProblem = useCallback(async (id: string) => {
    if (isSupabaseConfigured()) {
      await deleteProblemFromDB(id);
      const freshData = await fetchProblems();
      setProblems(freshData);
      saveToStorage(STORAGE_KEYS.PROBLEMS, freshData);
      return;
    }
    
    setProblems(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToStorage(STORAGE_KEYS.PROBLEMS, updated);
      return updated;
    });
  }, []);

  const getProblemById = useCallback((id: string) => {
    return problems.find(p => p.id === id);
  }, [problems]);

  return { problems, addProblem, updateProblem, removeProblem, getProblemById, isLoaded };
}

// === HOOK POUR LES FORMULES (SUPABASE PRIORITAIRE) ===
export function useFormulas() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadFormulas = async () => {
      if (isSupabaseConfigured()) {
        try {
          console.log('Loading formulas from Supabase...');
          const data = await fetchFormulas();
          console.log('Formulas from Supabase:', data?.length || 0);
          
          if (data) {
            setFormulas(data);
            saveToStorage(STORAGE_KEYS.FORMULAS, data);
          }
        } catch (error) {
          console.error('Error loading formulas from Supabase:', error);
          const cached = loadFromStorage<Formula[]>(STORAGE_KEYS.FORMULAS, []);
          setFormulas(cached);
        }
      } else {
        console.log('Supabase not configured, using local cache');
        const cached = loadFromStorage<Formula[]>(STORAGE_KEYS.FORMULAS, []);
        setFormulas(cached);
      }
      setIsLoaded(true);
    };
    
    loadFormulas();
  }, []);

  const addFormula = useCallback(async (formula: Omit<Formula, 'id'>) => {
    const newFormula: Formula = {
      ...formula,
      id: `f${Date.now()}`,
    };
    
    if (isSupabaseConfigured()) {
      const dbFormula = await addFormulaToDB(newFormula);
      if (dbFormula) {
        const freshData = await fetchFormulas();
        setFormulas(freshData);
        saveToStorage(STORAGE_KEYS.FORMULAS, freshData);
        return dbFormula;
      }
    }
    
    setFormulas(prev => {
      const updated = [...prev, newFormula];
      saveToStorage(STORAGE_KEYS.FORMULAS, updated);
      return updated;
    });
    return newFormula;
  }, []);

  const updateFormula = useCallback(async (id: string, updates: Partial<Formula>) => {
    if (isSupabaseConfigured()) {
      await updateFormulaInDB(id, updates);
      const freshData = await fetchFormulas();
      setFormulas(freshData);
      saveToStorage(STORAGE_KEYS.FORMULAS, freshData);
      return;
    }
    
    setFormulas(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, ...updates } : f);
      saveToStorage(STORAGE_KEYS.FORMULAS, updated);
      return updated;
    });
  }, []);

  const removeFormula = useCallback(async (id: string) => {
    if (isSupabaseConfigured()) {
      await deleteFormulaFromDB(id);
      const freshData = await fetchFormulas();
      setFormulas(freshData);
      saveToStorage(STORAGE_KEYS.FORMULAS, freshData);
      return;
    }
    
    setFormulas(prev => {
      const updated = prev.filter(f => f.id !== id);
      saveToStorage(STORAGE_KEYS.FORMULAS, updated);
      return updated;
    });
  }, []);

  const getFormulaById = useCallback((id: string) => {
    return formulas.find(f => f.id === id);
  }, [formulas]);

  const getFormulaByCode = useCallback((code: string) => {
    return formulas.find(f => f.code === code);
  }, [formulas]);

  const getCategories = useCallback(() => {
    const categories = new Set(formulas.map(f => f.category));
    return Array.from(categories).sort();
  }, [formulas]);

  return { 
    formulas, 
    addFormula, 
    updateFormula, 
    removeFormula, 
    getFormulaById, 
    getFormulaByCode,
    getCategories,
    isLoaded 
  };
}

// === HOOK POUR LA LIBRAIRIE (SUPABASE PRIORITAIRE) ===
export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadBooks = async () => {
      if (isSupabaseConfigured()) {
        try {
          console.log('Loading books from Supabase...');
          const data = await fetchBooks();
          console.log('Books from Supabase:', data?.length || 0);
          
          if (data) {
            // Normaliser les données pour ajouter les champs manquants avec valeurs par défaut
            const normalizedData = data.map(book => ({
              ...book,
              uploadDate: book.uploadDate || book.created_at?.split('T')[0] || '2024-01-01',
              pdfUrl: book.pdfUrl || '',
              coverImage: book.coverImage || ''
            }));
            setBooks(normalizedData);
            saveToStorage(STORAGE_KEYS.BOOKS, normalizedData);
          }
        } catch (error) {
          console.error('Error loading books from Supabase:', error);
          const cached = loadFromStorage<Book[]>(STORAGE_KEYS.BOOKS, []);
          setBooks(cached);
        }
      } else {
        console.log('Supabase not configured, using local cache');
        const cached = loadFromStorage<Book[]>(STORAGE_KEYS.BOOKS, []);
        setBooks(cached);
      }
      setIsLoaded(true);
    };
    
    loadBooks();
  }, []);

  const addBook = useCallback(async (book: Omit<Book, 'id' | 'uploadDate'>) => {
    console.debug('useLibrary.addBook called with:', book);
    const newBook: Book = {
      ...book,
      id: `b${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      // Assurer que les champs optionnels ne sont pas undefined
      description: book.description || '',
      pdfUrl: book.pdfUrl || '',
      coverImage: book.coverImage || '',
    };
    
    if (isSupabaseConfigured()) {
      const dbBook = await addBookToDB(newBook);
      if (dbBook) {
        const freshData = await fetchBooks();
        setBooks(freshData);
        saveToStorage(STORAGE_KEYS.BOOKS, freshData);
        return dbBook;
      }
    }
    
    setBooks(prev => {
      const updated = [...prev, newBook];
      saveToStorage(STORAGE_KEYS.BOOKS, updated);
      return updated;
    });
    return newBook;
  }, []);

  const updateBook = useCallback(async (id: string, updates: Partial<Book>) => {
    setBooks(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, ...updates } : b);
      saveToStorage(STORAGE_KEYS.BOOKS, updated);
      return updated;
    });
  }, []);

  const removeBook = useCallback(async (id: string) => {
    const bookToRemove = books.find(b => b.id === id);
    if (bookToRemove) {
      if (bookToRemove.pdfUrl?.startsWith('indexeddb://')) {
        await deleteFileLocal(bookToRemove.pdfUrl);
      }
      if (bookToRemove.coverImage?.startsWith('indexeddb://')) {
        await deleteFileLocal(bookToRemove.coverImage);
      }
    }
    
    if (isSupabaseConfigured()) {
      await deleteBookFromDB(id);
      const freshData = await fetchBooks();
      setBooks(freshData);
      saveToStorage(STORAGE_KEYS.BOOKS, freshData);
      return;
    }
    
    setBooks(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveToStorage(STORAGE_KEYS.BOOKS, updated);
      return updated;
    });
  }, [books]);

  return { books, addBook, updateBook, removeBook, isLoaded };
}

// === HOOK POUR L'ADMIN ===
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminSession = loadFromStorage<boolean>(STORAGE_KEYS.ADMIN_SESSION, false);
    setIsAdmin(adminSession);
  }, []);

  const login = useCallback((password: string): boolean => {
    const ADMIN_PASSWORD = 'mathunivers2024';
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      saveToStorage(STORAGE_KEYS.ADMIN_SESSION, true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    saveToStorage(STORAGE_KEYS.ADMIN_SESSION, false);
  }, []);

  return { isAdmin, login, logout };
}

// === HOOK POUR LES STATISTIQUES ===
export function useStats() {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadFromStorage<MonthlyStats[]>(STORAGE_KEYS.MONTHLY_STATS, []);
    setMonthlyStats(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.MONTHLY_STATS, monthlyStats);
    }
  }, [monthlyStats, isLoaded]);

  const recordVisit = useCallback(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    setMonthlyStats(prev => {
      const existing = prev.find(s => s.month === monthKey);
      if (existing) {
        return prev.map(s => 
          s.month === monthKey 
            ? { ...s, visits: s.visits + 1, pageViews: s.pageViews + 1 }
            : s
        );
      }
      return [...prev, { month: monthKey, visits: 1, uniqueVisitors: 1, pageViews: 1 }];
    });
  }, []);

  const getCurrentMonthStats = useCallback(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return monthlyStats.find(s => s.month === monthKey) || { month: monthKey, visits: 0, uniqueVisitors: 0, pageViews: 0 };
  }, [monthlyStats]);

  const getTotalVisits = useCallback(() => {
    return monthlyStats.reduce((sum, s) => sum + s.visits, 0);
  }, [monthlyStats]);

  return { monthlyStats, recordVisit, getCurrentMonthStats, getTotalVisits, isLoaded };
}

// === HOOK POUR LES LIKES ===
export function useLikes() {
  const toggleLike = useCallback((type: 'course' | 'formula', id: string): boolean => {
    const key = `${STORAGE_KEYS.LIKES}_${type}_${id}`;
    const current = loadFromStorage<boolean>(key, false);
    saveToStorage(key, !current);
    return !current;
  }, []);

  const isLiked = useCallback((type: 'course' | 'formula', id: string): boolean => {
    const key = `${STORAGE_KEYS.LIKES}_${type}_${id}`;
    return loadFromStorage<boolean>(key, false);
  }, []);

  return { toggleLike, isLiked };
}

// === HOOK POUR LES VOTES ===
export function useVotes() {
  const getVote = useCallback((type: string, id: string): 'up' | 'down' | null => {
    const key = `${STORAGE_KEYS.VOTES}_${type}_${id}`;
    return loadFromStorage<'up' | 'down' | null>(key, null);
  }, []);

  const setVote = useCallback((type: string, id: string, vote: 'up' | 'down' | null) => {
    const key = `${STORAGE_KEYS.VOTES}_${type}_${id}`;
    if (vote === null) {
      localStorage.removeItem(key);
    } else {
      saveToStorage(key, vote);
    }
  }, []);

  return { getVote, setVote };
}

// === HOOK POUR LA TIMELINE ===
export function useTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTimeline = () => {
      const cached = loadFromStorage<TimelineEvent[]>(STORAGE_KEYS.TIMELINE, []);
      // Si pas de données, utiliser les données historiques des mathématiques
      if (cached.length === 0) {
        const initialEvents: TimelineEvent[] = [
          {
            id: 't0',
            date: '-9000-01-01',
            displayDate: '9000 av. J.-C.',
            title: 'L\'os d\'Ishango et les premiers comptages',
            description: 'Une des premières preuves de comptage utilisant des entailles sur un os, montrant l\'émergence d\'une pensée numérique préhistorique.',
            category: 'Histoire',
            color: 'amber',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Os_d%27Ishango',
            icon: 'BookOpen',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Ishango_bone.jpg/640px-Ishango_bone.jpg',
            mathematician: 'Civilisations préhistoriques',
            period: 'Âge de pierre',
            bubbleSize: 'medium',
          },
          {
            id: 't0b',
            date: '-5000-01-01',
            displayDate: '5000 av. J.-C.',
            title: 'Début de la métallurgie du cuivre',
            description: 'Les premières cultures commencent à travailler le cuivre pour fabriquer des outils, marquant l\'entrée dans l\'âge du cuivre.',
            category: 'Histoire',
            color: 'orange',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Âge_du_cuivre',
            icon: 'Layers',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Copper_axe_Mesopotamian.jpg/640px-Copper_axe_Mesopotamian.jpg',
            mathematician: 'Artisans néolithiques',
            period: 'Âge du cuivre',
            bubbleSize: 'medium',
          },
          {
            id: 't1',
            date: '-1800-01-01',
            displayDate: '1800 av. J.-C.',
            title: 'La tablette Plimpton 322',
            description: 'Les Babyloniens rédigent la tablette Plimpton 322, qui contient ce que l\'on interprete aujourd\'hui comme des triplets pythagoriciens, témoignant d\'une algèbre avancée très ancienne.',
            category: 'Algèbre',
            color: 'amber',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Plimpton_322',
            icon: 'Calculator',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Plimpton_322.jpg/640px-Plimpton_322.jpg',
            mathematician: 'Scribes babyloniens',
            period: 'Antiquité',
            bubbleSize: 'medium',
          },
          {
            id: 't2',
            date: '-0585-01-01',
            displayDate: '585 av. J.-C.',
            title: 'Thalès de Milet',
            description: 'Thalès énonce le célèbre théorème de proportionnalité dans un triangle, posant les premières bases de la géométrie déductive grecque.',
            category: 'Géométrie',
            color: 'cyan',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Thal%C3%A8s_de_Milet',
            icon: 'Triangle',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Illustrerad_Verldshistoria_band_I_025.jpg/480px-Illustrerad_Verldshistoria_band_I_025.jpg',
            mathematician: 'Thalès',
            period: 'Antiquité',
            bubbleSize: 'medium',
          },
          {
            id: 't3',
            date: '-0570-01-01',
            displayDate: '570 av. J.-C.',
            title: 'L\'école de Pythagore',
            description: 'Pythagore et ses disciples étudient les nombres entiers, les intervalles musicaux et le fameux théorème portant sur le carré de l\'hypoténuse.',
            category: 'Géométrie',
            color: 'purple',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Pythagore',
            icon: 'Music',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Karl_Bryullov_-_Pythagoras_-_WGA03761.jpg/480px-Karl_Bryullov_-_Pythagoras_-_WGA03761.jpg',
            mathematician: 'Pythagore',
            period: 'Antiquité',
            bubbleSize: 'large',
          },
          {
            id: 't4',
            date: '-0300-01-01',
            displayDate: '300 av. J.-C.',
            title: 'Les Éléments d\'Euclide',
            description: 'Euclide publie "Les Éléments", l\'ouvrage de référence de la géométrie qui restera utilisé pendant plus de 2000 ans. Il y définit les axiomes et les méthodes de démonstration.',
            category: 'Géométrie',
            color: 'blue',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/%C3%89l%C3%A9ments_d%27Euclide',
            icon: 'BookOpen',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Oxyrhynchus_papyrus_showing_Euclid%27s_Elements.jpg/640px-Oxyrhynchus_papyrus_showing_Euclid%27s_Elements.jpg',
            mathematician: 'Euclide',
            period: 'Antiquité',
            bubbleSize: 'large',
          },
          {
            id: 't5',
            date: '-0287-01-01',
            displayDate: '287 av. J.-C.',
            title: 'Le nombre π par Archimède',
            description: 'Archimède développe une méthode pour approximer π en utilisant des polygones inscrits et circonscrits à un cercle, établissant que 223/71 < π < 22/7.',
            category: 'Analyse',
            color: 'orange',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Archim%C3%A8de',
            icon: 'Calculator',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Archimedes_pi.svg/640px-Archimedes_pi.svg.png',
            mathematician: 'Archimède',
            period: 'Antiquité',
            bubbleSize: 'large',
          },
          {
            id: 't6',
            date: '-0262-01-01',
            displayDate: '262 av. J.-C.',
            title: 'Les Coniques d\'Apollonius',
            description: 'Apollonius de Perga étudie systématiquement les sections coniques (ellipse, parabole, hyperbole), ouvrant la voie à la mécanique céleste moderne.',
            category: 'Géométrie',
            color: 'pink',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Apollonios_de_Perg%C3%A9',
            icon: 'Target',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Apollonius_of_Perga.jpg/480px-Apollonius_of_Perga.jpg',
            mathematician: 'Apollonius',
            period: 'Antiquité',
            bubbleSize: 'medium',
          },
          {
            id: 't7',
            date: '0415-01-01',
            displayDate: '415 ap. J.-C.',
            title: 'Hypatie d\'Alexandrie',
            description: 'Hypatie, mathématicienne et philosophe, enseigne et commente les traités mathématiques de son époque à Alexandrie.',
            category: 'Histoire',
            color: 'red',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Hypatie',
            icon: 'User',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hypatia_portrait.png/480px-Hypatia_portrait.png',
            mathematician: 'Hypatie',
            period: 'Antiquité',
            bubbleSize: 'medium',
          },
          {
            id: 't8',
            date: '0825-01-01',
            displayDate: '825',
            title: 'L\'algèbre de Al-Khwarizmi',
            description: 'Al-Khwarizmi publie "Al-Kitab al-mukhtasar fi hisab al-jabr wal-muqabala", donnant naissance au mot et à la discipline "algèbre".',
            category: 'Algèbre',
            color: 'green',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Al-Khw%C3%A2rizm%C3%AE',
            icon: 'BookOpen',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Al-Khwarizmi_-_Statue_in_Khawarizmi_University.jpg/480px-Al-Khwarizmi_-_Statue_in_Khawarizmi_University.jpg',
            mathematician: 'Al-Khwarizmi',
            period: 'Moyen Âge',
            bubbleSize: 'large',
          },
          {
            id: 't9',
            date: '1070-01-01',
            displayDate: '1070',
            title: 'Omar Khayyam et les cubiques',
            description: 'Omar Khayyam développe une théorie géométrique des équations cubiques et contribue au calendrier grégorien.',
            category: 'Algèbre',
            color: 'cyan',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Omar_Khayyam',
            icon: 'Lightbulb',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Omar_Khayyam_Profile.jpg/480px-Omar_Khayyam_Profile.jpg',
            mathematician: 'Omar Khayyam',
            period: 'Moyen Âge',
            bubbleSize: 'medium',
          },
          {
            id: 't10',
            date: '1202-01-01',
            displayDate: '1202',
            title: 'Le Liber Abaci de Fibonacci',
            description: 'Leonardo Fibonacci introduit en Europe les chiffres indo-arabes et la célèbre suite qui porte son nom.',
            category: 'Nombres',
            color: 'amber',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Fibonacci',
            icon: 'TrendingUp',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Fibonacci.jpg/480px-Fibonacci.jpg',
            mathematician: 'Fibonacci',
            period: 'Moyen Âge',
            bubbleSize: 'large',
          },
          {
            id: 't11',
            date: '1545-01-01',
            displayDate: '1545',
            title: 'Les nombres complexes',
            description: 'Girolamo Cardano publie "Ars Magna" où il manipule pour la première fois des nombres que nous appelons aujourd\'hui "complexes".',
            category: 'Algèbre',
            color: 'orange',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Girolamo_Cardano',
            icon: 'Lightbulb',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Cardano_-_Ars_magica_sive_ars_generalis_inventrix.jpg/640px-Cardano_-_Ars_magica_sive_ars_generalis_inventrix.jpg',
            mathematician: 'Cardano',
            period: 'Renaissance',
            bubbleSize: 'medium',
          },
          {
            id: 't12',
            date: '1591-01-01',
            displayDate: '1591',
            title: 'La notation algébrique de Viète',
            description: 'François Viète systématise l\'usage de lettres pour représenter les inconnues et les coefficients, jetant les bases de la notation algébrique moderne.',
            category: 'Algèbre',
            color: 'purple',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Fran%C3%A7ois_Vi%C3%A8te',
            icon: 'Edit3',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Francois_Viete.jpg/480px-Francois_Viete.jpg',
            mathematician: 'François Viète',
            period: 'Renaissance',
            bubbleSize: 'medium',
          },
          {
            id: 't13',
            date: '1637-01-01',
            displayDate: '1637',
            title: 'La géométrie analytique',
            description: 'René Descartes publie "La Géométrie" comme appendice au "Discours de la méthode", inventant la géométrie analytique qui lie algèbre et géométrie.',
            category: 'Géométrie',
            color: 'blue',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Ren%C3%A9_Descartes',
            icon: 'Grid3x3',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg/480px-Frans_Hals_-_Portret_van_Ren%C3%A9_Descartes.jpg',
            mathematician: 'Descartes',
            period: 'XVIIe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't14',
            date: '1640-01-01',
            displayDate: '1640',
            title: 'Le petit théorème de Fermat',
            description: 'Pierre de Fermat énonce son petit théorème sur les nombres premiers, fondement de la théorie moderne des nombres.',
            category: 'Théorie des nombres',
            color: 'red',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Pierre_de_Fermat',
            icon: 'Hash',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Pierre_de_Fermat.jpg/480px-Pierre_de_Fermat.jpg',
            mathematician: 'Pierre de Fermat',
            period: 'XVIIe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't15',
            date: '1654-01-01',
            displayDate: '1654',
            title: 'Le triangle de Pascal',
            description: 'Blaise Pascal étudie le triangle arithmétique et, avec Fermat, pose les bases du calcul des probabilités.',
            category: 'Probabilités',
            color: 'pink',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Blaise_Pascal',
            icon: 'Layers',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Blaise_Pascal_Versailles.JPG/480px-Blaise_Pascal_Versailles.JPG',
            mathematician: 'Blaise Pascal',
            period: 'XVIIe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't16',
            date: '1666-01-01',
            displayDate: '1666',
            title: 'Le calcul infinitésimal',
            description: 'Newton développe le calcul des fluxions et Leibniz introduit la notation dx/dy. Leur dispute sur la paternité marque le début de l\'analyse moderne.',
            category: 'Analyse',
            color: 'cyan',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Calcul_infinit%C3%A9simal',
            icon: 'Calculator',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Portr%C3%A4t_des_Isaac_Newton_%281642-1727%29_%28nach_Gottfried_Kneller%29_-_Google_Art_Project.jpg/480px-Portr%C3%A4t_des_Isaac_Newton_%281642-1727%29_%28nach_Gottfried_Kneller%29_-_Google_Art_Project.jpg',
            mathematician: 'Newton & Leibniz',
            period: 'XVIIe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't17',
            date: '1733-01-01',
            displayDate: '1733',
            title: 'Daniel Bernoulli et les probabilités',
            description: 'Daniel Bernoulli formalise le concept d\'espérance mathématique et contribue au calcul des probabilités appliqué aux sciences.',
            category: 'Probabilités',
            color: 'green',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Daniel_Bernoulli',
            icon: 'Activity',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Daniel_Bernoulli_2.jpg/480px-Daniel_Bernoulli_2.jpg',
            mathematician: 'Daniel Bernoulli',
            period: 'XVIIIe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't18',
            date: '1748-01-01',
            displayDate: '1748',
            title: 'La formule d\'Euler',
            description: 'Euler publie la célèbre formule e^(iπ) + 1 = 0, reliant les cinq nombres fondamentaux des mathématiques : 0, 1, e, i et π.',
            category: 'Analyse',
            color: 'red',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Identit%C3%A9_d%27Euler',
            icon: 'Lightbulb',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Leonhard_Euler_-_Jacob_Emanuel_Handmann_%28Kunstmuseum_Basel%29.jpg/480px-Leonhard_Euler_-_Jacob_Emanuel_Handmann_%28Kunstmuseum_Basel%29.jpg',
            mathematician: 'Leonhard Euler',
            period: 'XVIIIe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't19',
            date: '1788-01-01',
            displayDate: '1788',
            title: 'La Mécanique analytique de Lagrange',
            description: 'Joseph-Louis Lagrange réécrit la mécanique classique sous une forme purement analytique, sans figures géométriques.',
            category: 'Analyse',
            color: 'amber',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Joseph-Louis_Lagrange',
            icon: 'BookOpen',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Joseph_Louis_Lagrange.jpg/480px-Joseph_Louis_Lagrange.jpg',
            mathematician: 'Lagrange',
            period: 'XVIIIe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't20',
            date: '1801-01-01',
            displayDate: '1801',
            title: 'Les Disquisitiones de Gauss',
            description: 'Carl Friedrich Gauss publie "Disquisitiones Arithmeticae", fondant la théorie moderne des nombres et démontrant la loi de réciprocité quadratique.',
            category: 'Théorie des nombres',
            color: 'blue',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Carl_Friedrich_Gauss',
            icon: 'BookOpen',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Carl_Friedrich_Gauss_1840_by_Jensen.jpg/480px-Carl_Friedrich_Gauss_1840_by_Jensen.jpg',
            mathematician: 'Carl Friedrich Gauss',
            period: 'XIXe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't21',
            date: '1822-01-01',
            displayDate: '1822',
            title: 'La Transformée de Fourier',
            description: 'Joseph Fourier publie sa théorie analytique de la chaleur, introduisant la représentation des fonctions par des séries trigonométriques.',
            category: 'Analyse',
            color: 'purple',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Joseph_Fourier',
            icon: 'TrendingUp',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Fourier2.jpg/480px-Fourier2.jpg',
            mathematician: 'Joseph Fourier',
            period: 'XIXe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't22',
            date: '1832-01-01',
            displayDate: '1832',
            title: 'La théorie de Galois',
            description: 'Évariste Galois, la veille de sa mort, écrit les bases de la théorie qui relie groupes et équations algébriques, résolvant le problème de la résolubilité par radicaux.',
            category: 'Algèbre',
            color: 'red',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/%C3%89variste_Galois',
            icon: 'Target',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Evariste_galois.jpg/480px-Evariste_galois.jpg',
            mathematician: 'Évariste Galois',
            period: 'XIXe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't23',
            date: '1843-01-01',
            displayDate: '1843',
            title: 'Ada Lovelace, premier algorithme',
            description: 'Ada Lovelace décrit le premier algorithme destiné à être exécuté par une machine, préfigurant l\'informatique et la programmation.',
            category: 'Informatique',
            color: 'pink',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Ada_Lovelace',
            icon: 'Cpu',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Ada_Lovelace_portrait.jpg/480px-Ada_Lovelace_portrait.jpg',
            mathematician: 'Ada Lovelace',
            period: 'XIXe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't24',
            date: '1854-01-01',
            displayDate: '1854',
            title: 'La géométrie non-euclidienne',
            description: 'Bernhard Riemann propose des géométries où le postulat des parallèles d\'Euclide n\'est pas vérifié, ouvrant la voie à la relativité générale.',
            category: 'Géométrie',
            color: 'cyan',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Bernhard_Riemann',
            icon: 'Globe',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Bernhard_Riemann_%28Eduard_Schulte%2C_1875%29.jpg/480px-Bernhard_Riemann_%28Eduard_Schulte%2C_1875%29.jpg',
            mathematician: 'Bernhard Riemann',
            period: 'XIXe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't25',
            date: '1874-01-01',
            displayDate: '1874',
            title: 'La théorie des ensembles de Cantor',
            description: 'Georg Cantor introduit la notion d\'infini actuel et compare les tailles des ensembles infinis, révolutionnant les fondements des mathématiques.',
            category: 'Fondements',
            color: 'green',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Georg_Cantor',
            icon: 'Infinity',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Georg_Cantor2.jpg/480px-Georg_Cantor2.jpg',
            mathematician: 'Georg Cantor',
            period: 'XIXe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't26',
            date: '1900-01-01',
            displayDate: '1900',
            title: 'Les problèmes de Hilbert',
            description: 'David Hilbert présente 23 problèmes non résolus qui guideront la recherche mathématique du XXe siècle.',
            category: 'Fondements',
            color: 'amber',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Probl%C3%A8mes_de_Hilbert',
            icon: 'Lightbulb',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Hilbert.jpg/480px-Hilbert.jpg',
            mathematician: 'David Hilbert',
            period: 'XXe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't27',
            date: '1931-01-01',
            displayDate: '1931',
            title: 'Le théorème d\'incomplétude',
            description: 'Kurt Gödel démontre que dans tout système formel cohérent contenant l\'arithmétique, il existe des énoncés vrais mais indémontrables.',
            category: 'Logique',
            color: 'purple',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Th%C3%A9or%C3%A8mes_d%27incompl%C3%A9tude_de_G%C3%B6del',
            icon: 'BookOpen',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Kurt_g%C3%B6del.jpg/480px-Kurt_g%C3%B6del.jpg',
            mathematician: 'Kurt Gödel',
            period: 'XXe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't28',
            date: '1936-01-01',
            displayDate: '1936',
            title: 'La machine de Turing',
            description: 'Alan Turing définit le modèle théorique de la machine à calculer universelle, fondement de l\'informatique théorique et de la calculabilité.',
            category: 'Informatique',
            color: 'blue',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Alan_Turing',
            icon: 'Cpu',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Alan_Turing_Aged_16.jpg/480px-Alan_Turing_Aged_16.jpg',
            mathematician: 'Alan Turing',
            period: 'XXe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't29',
            date: '1944-01-01',
            displayDate: '1944',
            title: 'La théorie des jeux',
            description: 'John von Neumann et Oskar Morgenstern publient "Theory of Games and Economic Behavior", fondant la théorie des jeux.',
            category: 'Mathématiques appliquées',
            color: 'orange',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/John_von_Neumann',
            icon: 'Users',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/JohnvonNeumann-LosAlamos.gif/480px-JohnvonNeumann-LosAlamos.gif',
            mathematician: 'John von Neumann',
            period: 'XXe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't30',
            date: '1955-01-01',
            displayDate: '1955',
            title: 'Bourbaki et les structures',
            description: 'Le groupe Bourbaki publie ses premiers volumes visant à réorganiser les mathématiques autour de la notion de structure.',
            category: 'Fondements',
            color: 'cyan',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Nicolas_Bourbaki',
            icon: 'BookOpen',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Bourbaki_Congress_1938.png/480px-Bourbaki_Congress_1938.png',
            mathematician: 'Bourbaki',
            period: 'XXe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't31',
            date: '1963-01-01',
            displayDate: '1963',
            title: 'L\'hypothèse du continu',
            description: 'Paul Cohen invente le forcing et démontre l\'indépendance de l\'hypothèse du continu par rapport aux axiomes de Zermelo-Fraenkel.',
            category: 'Logique',
            color: 'red',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Paul_Cohen',
            icon: 'GitBranch',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Paul_Cohen.jpg/480px-Paul_Cohen.jpg',
            mathematician: 'Paul Cohen',
            period: 'XXe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't32',
            date: '1983-01-01',
            displayDate: '1983',
            title: 'La conjecture de Mordell',
            description: 'Gerd Faltings démontre la conjecture de Mordell, prouvant que certaines courbes algébriques n\'ont qu\'un nombre fini de points rationnels.',
            category: 'Géométrie algébrique',
            color: 'green',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Gerd_Faltings',
            icon: 'Target',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Gerd_Faltings_MFO.jpg/480px-Gerd_Faltings_MFO.jpg',
            mathematician: 'Gerd Faltings',
            period: 'XXe siècle',
            bubbleSize: 'medium',
          },
          {
            id: 't33',
            date: '1994-01-01',
            displayDate: '1994',
            title: 'Le dernier théorème de Fermat',
            description: 'Andrew Wiles démontre enfin le dernier théorème de Fermat, posé en 1637 : l\'équation a^n + b^n = c^n n\'a pas de solution entière non triviale pour n > 2.',
            category: 'Algèbre',
            color: 'pink',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Dernier_th%C3%A9or%C3%A8me_de_Fermat',
            icon: 'Target',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Andrew_Wiles%2C_Beijing_2005.jpg/480px-Andrew_Wiles%2C_Beijing_2005.jpg',
            mathematician: 'Andrew Wiles',
            period: 'XXIe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't34',
            date: '2003-01-01',
            displayDate: '2003',
            title: 'La conjecture de Poincaré',
            description: 'Grigori Perelman démontre la conjecture de Poincaré et refuse la médaille Fields, marquant l\'histoire récente des mathématiques.',
            category: 'Géométrie',
            color: 'cyan',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Grigori_Perelman',
            icon: 'Award',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Grigori_Perelman%2C_1966_%28reconstructed%29.jpg/480px-Grigori_Perelman%2C_1966_%28reconstructed%29.jpg',
            mathematician: 'Grigori Perelman',
            period: 'XXIe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't35',
            date: '2014-01-01',
            displayDate: '2014',
            title: 'Maryam Mirzakhani, médaille Fields',
            description: 'Maryam Mirzakhani devient la première femme lauréate de la médaille Fields pour ses travaux en géométrie dynamique.',
            category: 'Géométrie',
            color: 'purple',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/Maryam_Mirzakhani',
            icon: 'Award',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Maryam_Mirzakhani_in_Seoul_2014.jpg/480px-Maryam_Mirzakhani_in_Seoul_2014.jpg',
            mathematician: 'Maryam Mirzakhani',
            period: 'XXIe siècle',
            bubbleSize: 'large',
          },
          {
            id: 't36',
            date: '2024-01-01',
            displayDate: '2024',
            title: 'L\'IA formalise les mathématiques',
            description: 'Des systèmes comme AlphaGeometry résolvent des problèmes de géométrie olympique, illustrant l\'émergence de l\'IA dans la découverte mathématique.',
            category: 'Informatique',
            color: 'blue',
            linkType: 'external',
            linkUrl: 'https://fr.wikipedia.org/wiki/AlphaGeometry',
            icon: 'BrainCircuit',
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/DeepMind_logo_2017.png/480px-DeepMind_logo_2017.png',
            mathematician: 'DeepMind / IA',
            period: 'XXIe siècle',
            bubbleSize: 'medium',
          },
        ];
        setEvents(initialEvents);
        saveToStorage(STORAGE_KEYS.TIMELINE, initialEvents);
      } else {
        setEvents(cached);
      }
      setIsLoaded(true);
    };
    
    loadTimeline();
  }, []);

  const addEvent = useCallback((event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `t${Date.now()}`,
    };
    
    setEvents(prev => {
      const updated = [...prev, newEvent].sort((a, b) => compareTimelineDates(a.date, b.date));
      saveToStorage(STORAGE_KEYS.TIMELINE, updated);
      return updated;
    });
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<TimelineEvent>) => {
    setEvents(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e)
        .sort((a, b) => compareTimelineDates(a.date, b.date));
      saveToStorage(STORAGE_KEYS.TIMELINE, updated);
      return updated;
    });
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveToStorage(STORAGE_KEYS.TIMELINE, updated);
      return updated;
    });
  }, []);

  const getEventsByCategory = useCallback((category: string) => {
    return events.filter(e => e.category === category);
  }, [events]);

  const getEventsByDateRange = useCallback((startDate: string, endDate: string) => {
    return events.filter(e => e.date >= startDate && e.date <= endDate);
  }, [events]);

  return { 
    events, 
    addEvent, 
    updateEvent, 
    removeEvent, 
    getEventsByCategory,
    getEventsByDateRange,
    isLoaded 
  };
}

// === HOOK PROFIL ÉLÈVE / GAMIFICATION ===
function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterday(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function computeUpdatedStreak(lastActiveDate: string): number {
  const today = getToday();
  if (lastActiveDate === today) return -1; // déjà actif aujourd'hui, pas de changement
  if (lastActiveDate === getYesterday(today)) return 1; // incrémenter
  return 0; // streak rompue
}

function addXpToProfile(profile: UserProfile, amount: number): UserProfile {
  const today = getToday();
  const dailyActivity = [...profile.dailyActivity];
  const todayIndex = dailyActivity.findIndex(a => a.date === today);
  if (todayIndex >= 0) {
    dailyActivity[todayIndex] = { ...dailyActivity[todayIndex], xp: dailyActivity[todayIndex].xp + amount };
  } else {
    dailyActivity.push({ date: today, xp: amount });
  }
  return { ...profile, xp: profile.xp + amount, dailyActivity };
}

function migrateProfileData(raw: any): UserProfile {
  const level: Level = raw?.level || 'Term';
  const defaults = getDefaultProfile(level);

  // currentArena: anciens profils avaient peut-être un nombre unique
  // Recalculer en respectant les nouvelles règles de déblocage par monde,
  // tout en conservant la progression existante si elle est supérieure.
  let currentArena: Partial<Record<WorldId, number>> = {};
  if (typeof raw?.currentArena === 'number') {
    for (const world of WORLDS) {
      const calculated = defaults.currentArena[world.id] ?? 0;
      currentArena[world.id] = calculated === 0 ? 0 : Math.max(raw.currentArena, calculated);
    }
  } else if (raw?.currentArena && typeof raw.currentArena === 'object') {
    for (const world of WORLDS) {
      const calculated = defaults.currentArena[world.id] ?? 0;
      const existing = raw.currentArena[world.id] ?? 0;
      currentArena[world.id] = calculated === 0 ? 0 : (existing > calculated ? existing : calculated);
    }
  } else {
    currentArena = defaults.currentArena;
  }

  // worldXp: recalculer à partir des arènes si absent
  let worldXp: Partial<Record<WorldId, number>> = {};
  if (raw?.worldXp && typeof raw.worldXp === 'object') {
    worldXp = { ...raw.worldXp };
  } else {
    for (const world of WORLDS) {
      const arenaNum = currentArena[world.id] ?? defaults.currentArena[world.id] ?? 1;
      const arena = world.arenas[Math.max(0, arenaNum - 1)];
      worldXp[world.id] = arena?.xpThreshold ?? 0;
    }
  }

  // dailyActivity: migration depuis weeklyActivity si besoin
  let dailyActivity: { date: string; xp: number }[] = [];
  if (Array.isArray(raw?.dailyActivity)) {
    dailyActivity = raw.dailyActivity;
  } else if (Array.isArray(raw?.weeklyActivity)) {
    const today = new Date();
    raw.weeklyActivity.forEach((xp: number, idx: number) => {
      if (typeof xp === 'number' && xp > 0) {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - idx));
        dailyActivity.push({ date: d.toISOString().split('T')[0], xp });
      }
    });
  }

  const highestArena = Math.max(
    raw?.highestArena || 1,
    ...Object.values(currentArena).filter((v): v is number => typeof v === 'number')
  );

  return {
    name: raw?.name ?? '',
    level,
    xp: raw?.xp ?? 0,
    streak: raw?.streak ?? 0,
    lastActiveDate: raw?.lastActiveDate ?? '',
    badges: Array.isArray(raw?.badges) ? raw.badges : [],
    completedCourseIds: Array.isArray(raw?.completedCourseIds) ? raw.completedCourseIds : [],
    completedProblemIds: Array.isArray(raw?.completedProblemIds) ? raw.completedProblemIds : [],
    chestCount: raw?.chestCount ?? 0,
    unlockedChests: raw?.unlockedChests ?? 0,
    dailyActivity,
    worldXp,
    currentArena,
    highestArena,
    aura: raw?.aura ?? getAuraForHighestArena(highestArena).id,
    currency: raw?.currency ?? 0,
    unlockedCourseIds: Array.isArray(raw?.unlockedCourseIds) ? raw.unlockedCourseIds : [],
    cardCollection: raw?.cardCollection && typeof raw.cardCollection === 'object' ? raw.cardCollection : {},
  };
}

function getDefaultProfile(level: Level = 'Term'): UserProfile {
  const currentArena: Partial<Record<WorldId, number>> = {};
  const worldXp: Partial<Record<WorldId, number>> = {};
  let highestArena = 1;
  for (const world of WORLDS) {
    const startingArena = getStartingArena(level, world.id);
    currentArena[world.id] = startingArena;
    if (startingArena > highestArena) highestArena = startingArena;
    const arena = world.arenas[Math.max(0, startingArena - 1)];
    worldXp[world.id] = arena?.xpThreshold ?? 0;
  }
  return {
    name: '',
    level,
    xp: 0,
    streak: 0,
    lastActiveDate: '',
    badges: [],
    completedCourseIds: [],
    completedProblemIds: [],
    chestCount: 0,
    unlockedChests: 0,
    dailyActivity: [],
    worldXp,
    currentArena,
    highestArena,
    aura: getAuraForHighestArena(highestArena).id,
    currency: 0,
    unlockedCourseIds: [],
    cardCollection: {},
  };
}

function isDefaultProfile(p: UserProfile): boolean {
  return p.xp === 0 && p.completedCourseIds.length === 0 && p.completedProblemIds.length === 0 && p.badges.length === 0;
}

function mergeProfiles(local: UserProfile, cloud: UserProfile): UserProfile {
  const name = cloud.name || local.name;
  const level = cloud.level || local.level;
  const xp = cloud.xp + local.xp;
  const streak = Math.max(cloud.streak, local.streak);
  const badges = Array.from(new Set([...cloud.badges, ...local.badges]));
  const completedCourseIds = Array.from(new Set([...cloud.completedCourseIds, ...local.completedCourseIds]));
  const completedProblemIds = Array.from(new Set([...cloud.completedProblemIds, ...local.completedProblemIds]));
  const chestCount = cloud.chestCount + local.chestCount;
  const unlockedChests = cloud.unlockedChests + local.unlockedChests;
  const currency = (cloud.currency || 0) + (local.currency || 0);
  const unlockedCourseIds = Array.from(new Set([...cloud.unlockedCourseIds, ...local.unlockedCourseIds]));

  const activityMap = new Map<string, number>();
  for (const a of cloud.dailyActivity) activityMap.set(a.date, (activityMap.get(a.date) || 0) + a.xp);
  for (const a of local.dailyActivity) activityMap.set(a.date, (activityMap.get(a.date) || 0) + a.xp);
  const dailyActivity = Array.from(activityMap.entries())
    .map(([date, xp]) => ({ date, xp }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Fusionner l'XP par monde
  const worldXp: Partial<Record<WorldId, number>> = { ...cloud.worldXp };
  for (const [key, value] of Object.entries(local.worldXp)) {
    if (typeof value === 'number') {
      worldXp[key as WorldId] = (worldXp[key as WorldId] || 0) + value;
    }
  }

  // Recalculer les arènes
  const currentArena: Partial<Record<WorldId, number>> = {};
  let highestArena = 1;
  for (const world of WORLDS) {
    const wxp = worldXp[world.id] ?? 0;
    const startingArena = getStartingArena(level, world.id);
    if (startingArena === 0) {
      currentArena[world.id] = 0;
      continue;
    }

    if (wxp > 0) {
      const arena = getCurrentArenaNumber(world.id, wxp);
      currentArena[world.id] = arena;
      if (arena > highestArena) highestArena = arena;
    } else {
      currentArena[world.id] = startingArena;
      if (startingArena > highestArena) highestArena = startingArena;
    }
  }

  return {
    ...cloud,
    name,
    level,
    xp,
    streak,
    badges,
    completedCourseIds,
    completedProblemIds,
    chestCount,
    unlockedChests,
    dailyActivity,
    lastActiveDate: getToday(),
    worldXp,
    currentArena,
    highestArena,
    aura: getAuraForHighestArena(highestArena).id,
    currency,
    unlockedCourseIds,
    cardCollection: { ...cloud.cardCollection, ...local.cardCollection },
  };
}

function dbToProfile(row: any): UserProfile {
  return {
    name: row.name ?? '',
    level: row.level ?? 'Term',
    xp: row.xp ?? 0,
    streak: row.streak ?? 0,
    lastActiveDate: row.last_active_date ?? '',
    badges: row.badges ?? [],
    completedCourseIds: row.completed_course_ids ?? [],
    completedProblemIds: row.completed_problem_ids ?? [],
    chestCount: row.chest_count ?? 0,
    unlockedChests: row.unlocked_chests ?? 0,
    dailyActivity: row.daily_activity ?? row.weekly_activity ?? [],
    worldXp: row.world_xp ?? {},
    currentArena: row.current_arena ?? {},
    highestArena: row.highest_arena ?? 1,
    aura: row.aura ?? null,
    currency: row.currency ?? 0,
    unlockedCourseIds: row.unlocked_course_ids ?? [],
    cardCollection: row.card_collection ?? {},
  };
}

function profileToDb(profile: UserProfile, userId: string): Record<string, unknown> {
  return {
    id: userId,
    name: profile.name,
    level: profile.level,
    xp: profile.xp,
    streak: profile.streak,
    last_active_date: profile.lastActiveDate,
    badges: profile.badges,
    completed_course_ids: profile.completedCourseIds,
    completed_problem_ids: profile.completedProblemIds,
    chest_count: profile.chestCount,
    unlocked_chests: profile.unlockedChests,
    daily_activity: profile.dailyActivity,
    world_xp: profile.worldXp,
    current_arena: profile.currentArena,
    highest_arena: profile.highestArena,
    aura: profile.aura,
    currency: profile.currency,
    unlocked_course_ids: profile.unlockedCourseIds,
    card_collection: profile.cardCollection,
    updated_at: new Date().toISOString(),
  };
}

async function fetchCloudProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('fetchCloudProfile error:', error.message);
    }
    return null;
  }
  return dbToProfile(data);
}

async function saveCloudProfile(userId: string, profile: UserProfile): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .upsert(profileToDb(profile, userId), { onConflict: 'id' });
  if (error) {
    console.error('saveCloudProfile error:', error.message);
  }
}

export function useUserProfile(
  user: User | null,
  isSupabaseReady: boolean,
  contentDeps?: {
    courses?: Course[];
    problems?: Problem[];
    formulas?: Formula[];
    arenaContents?: ArenaContent[];
  }
) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const justFetched = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousUserId = useRef<string | null | undefined>(undefined);

  const coursesRef = useRef(contentDeps?.courses || []);
  const problemsRef = useRef(contentDeps?.problems || []);
  const formulasRef = useRef(contentDeps?.formulas || []);
  const arenaContentsRef = useRef(contentDeps?.arenaContents || []);

  useEffect(() => {
    coursesRef.current = contentDeps?.courses || [];
    problemsRef.current = contentDeps?.problems || [];
    formulasRef.current = contentDeps?.formulas || [];
    arenaContentsRef.current = contentDeps?.arenaContents || [];
  }, [contentDeps?.courses, contentDeps?.problems, contentDeps?.formulas, contentDeps?.arenaContents]);

  // Load local profile on mount
  useEffect(() => {
    const cached = loadFromStorage<any>(STORAGE_KEYS.USER_PROFILE, getDefaultProfile());
    const migrated = migrateProfileData(cached);
    setProfile(migrated);
    saveToStorage(STORAGE_KEYS.USER_PROFILE, migrated);
    setIsLoaded(true);
  }, []);

  // Fetch / sync cloud profile when user signs in
  useEffect(() => {
    if (!user || !isSupabaseReady) return;

    let cancelled = false;
    fetchCloudProfile(user.id).then(cloud => {
      if (cancelled) return;
      const local = migrateProfileData(loadFromStorage<any>(STORAGE_KEYS.USER_PROFILE, getDefaultProfile()));

      if (cloud) {
        if (isDefaultProfile(cloud) && !isDefaultProfile(local)) {
          // Local progress exists but cloud is empty: merge up
          const merged = mergeProfiles(local, cloud);
          justFetched.current = true;
          setProfile(merged);
          saveCloudProfile(user.id, merged);
        } else {
          // Use cloud profile as source of truth, but migrate it first
          const migratedCloud = migrateProfileData(cloud);
          justFetched.current = true;
          setProfile(migratedCloud);
        }
      } else {
        // No cloud profile yet: seed from Google metadata or local profile
        const initial: UserProfile = local.name
          ? local
          : {
              ...getDefaultProfile(),
              name: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || '',
            };
        justFetched.current = true;
        setProfile(initial);
        saveCloudProfile(user.id, initial);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, isSupabaseReady]);

  // Reset to default when user explicitly logs out
  useEffect(() => {
    if (previousUserId.current === undefined) {
      previousUserId.current = user?.id ?? null;
      return;
    }
    if (previousUserId.current !== null && user === null) {
      setProfile(getDefaultProfile());
    }
    previousUserId.current = user?.id ?? null;
  }, [user]);

  // Persist locally + debounced cloud sync
  useEffect(() => {
    if (!profile) return;
    saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);

    if (!user || !isSupabaseReady) return;
    if (justFetched.current) {
      justFetched.current = false;
      return;
    }

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      saveCloudProfile(user.id, profile);
    }, 1500);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [profile, user, isSupabaseReady]);

  function applyLevelProgress(level: Level, currentArena: Partial<Record<WorldId, number>>, previousLevel: Level) {
    const nextCurrentArena: Partial<Record<WorldId, number>> = {};
    const nextWorldXp: Partial<Record<WorldId, number>> = {};
    let highestArena = 1;

    const newLevelIndex = LEVELS.findIndex((l) => l.name === level);
    const previousLevelIndex = LEVELS.findIndex((l) => l.name === previousLevel);
    const preserveExisting = newLevelIndex >= previousLevelIndex;

    for (const world of WORLDS) {
      const startingArena = getStartingArena(level, world.id);
      if (startingArena === 0) {
        nextCurrentArena[world.id] = 0;
        nextWorldXp[world.id] = 0;
        continue;
      }

      const existingArena = currentArena[world.id] ?? 0;
      const arenaNumber = preserveExisting
        ? Math.max(startingArena, existingArena)
        : startingArena;
      nextCurrentArena[world.id] = arenaNumber;

      const arena = world.arenas[Math.max(0, arenaNumber - 1)];
      nextWorldXp[world.id] = arena?.xpThreshold ?? 0;

      if (arenaNumber > highestArena) highestArena = arenaNumber;
    }

    return {
      level,
      currentArena: nextCurrentArena,
      worldXp: nextWorldXp,
      highestArena,
      aura: getAuraForHighestArena(highestArena).id,
    } as const;
  }

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => {
      if (!prev) return prev;
      if (updates.level && updates.level !== prev.level) {
        const levelProgress = applyLevelProgress(updates.level, prev.currentArena, prev.level);
        return { ...prev, ...updates, ...levelProgress };
      }
      return { ...prev, ...updates };
    });
  }, []);

  const setName = useCallback((name: string) => {
    updateProfile({ name });
  }, [updateProfile]);

  const setLevel = useCallback((level: Level) => {
    updateProfile({ level });
  }, [updateProfile]);

  const addXp = useCallback((amount: number, _source: 'lesson' | 'problem' | 'question' | 'streak' | 'chest' = 'question') => {
    setProfile(prev => {
      if (!prev) return prev;
      const today = getToday();
      const newXp = prev.xp + amount;
      const dailyActivity = [...prev.dailyActivity];
      const todayIndex = dailyActivity.findIndex(a => a.date === today);
      if (todayIndex >= 0) {
        dailyActivity[todayIndex] = { ...dailyActivity[todayIndex], xp: dailyActivity[todayIndex].xp + amount };
      } else {
        dailyActivity.push({ date: today, xp: amount });
      }
      return { ...prev, xp: newXp, dailyActivity };
    });
  }, []);

  const checkIn = useCallback(() => {
    setProfile(prev => {
      if (!prev) return prev;
      const today = getToday();
      if (prev.lastActiveDate === today) return prev;
      const delta = computeUpdatedStreak(prev.lastActiveDate);
      const newStreak = delta === 1 ? prev.streak + 1 : delta === 0 ? 1 : prev.streak;

      // Marquer l'activité du jour (même sans XP) pour le calendrier
      const dailyActivity = [...prev.dailyActivity];
      const todayIndex = dailyActivity.findIndex(a => a.date === today);
      if (todayIndex < 0) {
        dailyActivity.push({ date: today, xp: 0 });
      }

      return { ...prev, lastActiveDate: today, streak: newStreak, dailyActivity };
    });
  }, []);

  const awardBadges = useCallback((courses: Course[], problems: Problem[]) => {
    setProfile(prev => {
      if (!prev) return prev;
      const newBadges = new Set(prev.badges);

      if (prev.completedCourseIds.length >= 1) newBadges.add('first_lesson');
      if (prev.completedProblemIds.length >= 1) newBadges.add('first_problem');
      if (prev.streak >= 3) newBadges.add('streak_3');
      if (prev.streak >= 7) newBadges.add('streak_7');
      if (prev.completedProblemIds.length >= 10) newBadges.add('problem_solver');
      if (prev.completedProblemIds.length >= 50) newBadges.add('mathematician');
      if (prev.completedProblemIds.length >= 100) newBadges.add('scientist');
      if (prev.xp >= 1000) newBadges.add('master');
      if (prev.unlockedChests >= 5) newBadges.add('collector');

      const collectedCards = Object.values(prev.cardCollection || {});
      const legendaryCards = collectedCards.filter((c) => c.rarity === 'legendary').length;
      if (collectedCards.length >= 50) newBadges.add('cards_50');
      if (collectedCards.length >= 100) newBadges.add('cards_100');
      if (collectedCards.length >= 500) newBadges.add('cards_500');
      if (legendaryCards >= 3) newBadges.add('legendary_3');
      if (collectedCards.length >= ALL_CARDS.length) newBadges.add('cards_all');

      const completedCategories = new Set(
        prev.completedCourseIds
          .map(id => courses.find(c => c.id === id)?.category)
          .filter(Boolean)
      );
      if (completedCategories.size >= 3) newBadges.add('explorer');

      const completedProblemCategories = new Set(
        prev.completedProblemIds
          .map(id => problems.find(p => p.id === id)?.category)
          .filter(Boolean)
      );
      if (completedProblemCategories.size >= 3) newBadges.add('explorer');

      if (newBadges.size === prev.badges.length) return prev;
      return { ...prev, badges: Array.from(newBadges) };
    });
  }, []);

  const completeCourse = useCallback((courseId: string) => {
    setProfile(prev => {
      if (!prev || prev.completedCourseIds.includes(courseId)) return prev;
      return addXpToProfile(
        { ...prev, completedCourseIds: [...prev.completedCourseIds, courseId], chestCount: prev.chestCount + 1 },
        50
      );
    });
  }, []);

  const completeProblem = useCallback((problem: Problem, xpOverride?: number) => {
    setProfile(prev => {
      if (!prev || prev.completedProblemIds.includes(problem.id)) return prev;

      const worldXpGain = getProblemWorldXp(problem);
      const newWorldXp = { ...prev.worldXp };
      const newCompletedProblemIds = [...prev.completedProblemIds, problem.id];
      const newUnlockedCourseIds = [...prev.unlockedCourseIds];
      const newBadges = new Set(prev.badges);

      if (worldXpGain) {
        newWorldXp[worldXpGain.worldId] = (newWorldXp[worldXpGain.worldId] || 0) + worldXpGain.xp;
      }

      const newCurrentArena = { ...prev.currentArena };
      let highestArena = prev.highestArena || 1;

      // Débloquer l’arène suivante si tous les problèmes de l’arène actuelle sont réussis
      const worldId = worldXpGain?.worldId;
      if (worldId) {
        const currentArenaNumber = prev.currentArena[worldId] || 1;
        const contents = getArenaContents(
          worldId,
          currentArenaNumber,
          coursesRef.current,
          problemsRef.current,
          formulasRef.current,
          arenaContentsRef.current
        );
        const allCompleted =
          contents.problems.length > 0 &&
          contents.problems.every((p) => newCompletedProblemIds.includes(p.id));
        if (allCompleted && currentArenaNumber < ARENA_COUNT) {
          const nextArenaNumber = currentArenaNumber + 1;
          newCurrentArena[worldId] = nextArenaNumber;
          newBadges.add(getArenaBadgeId(worldId, nextArenaNumber));
          if (nextArenaNumber > highestArena) highestArena = nextArenaNumber;
        }
      }

      for (const arenaNum of Object.values(newCurrentArena)) {
        if (typeof arenaNum === 'number' && arenaNum > highestArena) {
          highestArena = arenaNum;
        }
      }

      const aura = getAuraForHighestArena(highestArena)?.id ?? null;

      return addXpToProfile(
        {
          ...prev,
          completedProblemIds: newCompletedProblemIds,
          chestCount: prev.chestCount + 1,
          worldXp: newWorldXp,
          currentArena: newCurrentArena,
          highestArena,
          aura,
          badges: Array.from(newBadges),
          unlockedCourseIds: newUnlockedCourseIds,
        },
        xpOverride ?? 30
      );
    });
  }, []);

  const unlockArena = useCallback((worldId: WorldId, arenaNumber: number) => {
    setProfile(prev => {
      if (!prev) return prev;
      const currentNumber = prev.currentArena[worldId] || 1;
      if (arenaNumber <= currentNumber) return prev;
      if (arenaNumber > ARENA_COUNT) return prev;

      const currentArena = { ...prev.currentArena, [worldId]: arenaNumber };
      const highestArena = Math.max(prev.highestArena || 1, arenaNumber);
      const aura = getAuraForHighestArena(highestArena).id;

      return {
        ...prev,
        currentArena,
        highestArena,
        aura,
      };
    });
  }, []);

  const spendCurrency = useCallback((amount: number): boolean => {
    let success = false;
    setProfile(prev => {
      if (!prev || (prev.currency || 0) < amount) return prev;
      success = true;
      return { ...prev, currency: prev.currency - amount };
    });
    return success;
  }, []);

  const openChest = useCallback((bonusXp?: number) => {
    setProfile(prev => {
      if (!prev || prev.chestCount <= 0) return prev;
      const xp = bonusXp ?? Math.floor(Math.random() * 41) + 10; // 10-50 XP
      const currency = getChestCurrencyReward();
      const card = openCardPack();
      const cardCollection = { ...prev.cardCollection, [card.id]: { ...card, collectedAt: new Date().toISOString() } };
      return {
        ...prev,
        chestCount: prev.chestCount - 1,
        unlockedChests: prev.unlockedChests + 1,
        xp: prev.xp + xp,
        currency: prev.currency + currency,
        cardCollection,
      };
    });
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(getDefaultProfile());
  }, []);

  const userLevel = profile ? getPlayerLevel(profile.currentArena) : 1;

  return {
    profile,
    isLoaded,
    userLevel,
    updateProfile,
    setName,
    setLevel,
    addXp,
    checkIn,
    awardBadges,
    completeCourse,
    completeProblem,
    unlockArena,
    spendCurrency,
    openChest,
    resetProfile,
    arenaContents: [] as ArenaContent[],
  };
}

// === FONCTIONS D'UPLOAD DE FICHIERS ===
export { uploadImage, uploadPDF };