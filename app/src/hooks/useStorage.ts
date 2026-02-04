import { useState, useEffect, useCallback } from 'react';
import type { Course, Problem, Formula, Book, MonthlyStats } from '@/types';
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
  VIEWS: 'mathunivers_views',
  MONTHLY_STATS: 'mathunivers_monthly_stats',
  ADMIN_SESSION: 'mathunivers_admin',
  LIKES: 'mathunivers_likes',
  VOTES: 'mathunivers_votes',
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

// === VÉRIFIER SI SUPABASE EST CONFIGURÉ ===
const isSupabaseConfigured = () => {
  return !!supabase;
};

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
              categoryColor: course.categoryColor || '#f0f9ff',
              categoryTextColor: course.categoryTextColor || '#0284c7'
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
      categoryColor: course.categoryColor || '#f0f9ff',
      categoryTextColor: course.categoryTextColor || '#0284c7',
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
            setProblems(data);
            saveToStorage(STORAGE_KEYS.PROBLEMS, data);
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
      hints: problem.hints || [],
      solution: problem.solution || '',
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

// === FONCTIONS D'UPLOAD DE FICHIERS ===
export { uploadImage, uploadPDF };