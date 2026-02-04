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
  return !!(supabase && import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

// === HOOK POUR LES COURS (AVEC SUPABASE) ===
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger depuis Supabase au démarrage
  useEffect(() => {
    const loadCourses = async () => {
      
      // D'abord, charger depuis le cache local pour affichage rapide
      const cached = loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
      if (cached.length > 0) {
        setCourses(cached);
      }
      
      // Ensuite, charger depuis Supabase
      if (isSupabaseConfigured()) {
        try {
          const data = await fetchCourses();
          if (data && data.length > 0) {
            setCourses(data);
            saveToStorage(STORAGE_KEYS.COURSES, data);
          } else if (cached.length === 0) {
            // Si aucune donnée dans Supabase et pas de cache, initialiser avec les données par défaut
            const { initialCourses } = await import('@/data/initialData');
            setCourses(initialCourses);
            saveToStorage(STORAGE_KEYS.COURSES, initialCourses);
            
            // Synchroniser avec Supabase
            for (const course of initialCourses) {
              await addCourseToDB(course);
            }
          }
        } catch (error) {
          console.error('Error loading courses from Supabase:', error);
          // En cas d'erreur, utiliser le cache
          setCourses(cached);
        }
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
    };
    
    // Ajouter à Supabase si configuré
    if (isSupabaseConfigured()) {
      const dbCourse = await addCourseToDB(newCourse);
      if (dbCourse) {
        setCourses(prev => {
          const updated = [...prev, dbCourse];
          saveToStorage(STORAGE_KEYS.COURSES, updated);
          return updated;
        });
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
    // Mettre à jour dans Supabase si configuré
    if (isSupabaseConfigured()) {
      const dbCourse = await updateCourseInDB(id, updates);
      if (dbCourse) {
        setCourses(prev => {
          const updated = prev.map(c => c.id === id ? dbCourse : c);
          saveToStorage(STORAGE_KEYS.COURSES, updated);
          return updated;
        });
        return;
      }
    }
    
    // Fallback: mise à jour locale
    setCourses(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      saveToStorage(STORAGE_KEYS.COURSES, updated);
      return updated;
    });
  }, []);

  const removeCourse = useCallback(async (id: string) => {
    // Supprimer de Supabase si configuré
    if (isSupabaseConfigured()) {
      const success = await deleteCourseFromDB(id);
      if (success) {
        setCourses(prev => {
          const updated = prev.filter(c => c.id !== id);
          saveToStorage(STORAGE_KEYS.COURSES, updated);
          return updated;
        });
        return;
      }
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

// === HOOK POUR LES PROBLÈMES (AVEC SUPABASE) ===
export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadProblems = async () => {
      
      const cached = loadFromStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
      if (cached.length > 0) {
        setProblems(cached);
      }
      
      if (isSupabaseConfigured()) {
        try {
          const data = await fetchProblems();
          if (data && data.length > 0) {
            setProblems(data);
            saveToStorage(STORAGE_KEYS.PROBLEMS, data);
          } else if (cached.length === 0) {
            const { initialProblems } = await import('@/data/initialData');
            setProblems(initialProblems);
            saveToStorage(STORAGE_KEYS.PROBLEMS, initialProblems);
            
            for (const problem of initialProblems) {
              await addProblemToDB(problem);
            }
          }
        } catch (error) {
          console.error('Error loading problems from Supabase:', error);
          setProblems(cached);
        }
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
    };
    
    if (isSupabaseConfigured()) {
      const dbProblem = await addProblemToDB(newProblem);
      if (dbProblem) {
        setProblems(prev => {
          const updated = [...prev, dbProblem];
          saveToStorage(STORAGE_KEYS.PROBLEMS, updated);
          return updated;
        });
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
      const dbProblem = await updateProblemInDB(id, updates);
      if (dbProblem) {
        setProblems(prev => {
          const updated = prev.map(p => p.id === id ? dbProblem : p);
          saveToStorage(STORAGE_KEYS.PROBLEMS, updated);
          return updated;
        });
        return;
      }
    }
    
    setProblems(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      saveToStorage(STORAGE_KEYS.PROBLEMS, updated);
      return updated;
    });
  }, []);

  const removeProblem = useCallback(async (id: string) => {
    if (isSupabaseConfigured()) {
      const success = await deleteProblemFromDB(id);
      if (success) {
        setProblems(prev => {
          const updated = prev.filter(p => p.id !== id);
          saveToStorage(STORAGE_KEYS.PROBLEMS, updated);
          return updated;
        });
        return;
      }
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

// === HOOK POUR LES FORMULES (AVEC SUPABASE) ===
export function useFormulas() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadFormulas = async () => {
      
      const cached = loadFromStorage<Formula[]>(STORAGE_KEYS.FORMULAS, []);
      if (cached.length > 0) {
        setFormulas(cached);
      }
      
      if (isSupabaseConfigured()) {
        try {
          const data = await fetchFormulas();
          if (data && data.length > 0) {
            setFormulas(data);
            saveToStorage(STORAGE_KEYS.FORMULAS, data);
          } else if (cached.length === 0) {
            const { initialFormulas } = await import('@/data/initialData');
            setFormulas(initialFormulas);
            saveToStorage(STORAGE_KEYS.FORMULAS, initialFormulas);
            
            for (const formula of initialFormulas) {
              await addFormulaToDB(formula);
            }
          }
        } catch (error) {
          console.error('Error loading formulas from Supabase:', error);
          setFormulas(cached);
        }
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
        setFormulas(prev => {
          const updated = [...prev, dbFormula];
          saveToStorage(STORAGE_KEYS.FORMULAS, updated);
          return updated;
        });
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
      const dbFormula = await updateFormulaInDB(id, updates);
      if (dbFormula) {
        setFormulas(prev => {
          const updated = prev.map(f => f.id === id ? dbFormula : f);
          saveToStorage(STORAGE_KEYS.FORMULAS, updated);
          return updated;
        });
        return;
      }
    }
    
    setFormulas(prev => {
      const updated = prev.map(f => f.id === id ? { ...f, ...updates } : f);
      saveToStorage(STORAGE_KEYS.FORMULAS, updated);
      return updated;
    });
  }, []);

  const removeFormula = useCallback(async (id: string) => {
    if (isSupabaseConfigured()) {
      const success = await deleteFormulaFromDB(id);
      if (success) {
        setFormulas(prev => {
          const updated = prev.filter(f => f.id !== id);
          saveToStorage(STORAGE_KEYS.FORMULAS, updated);
          return updated;
        });
        return;
      }
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

// === HOOK POUR LA LIBRAIRIE (AVEC SUPABASE) ===

// === HOOK POUR LA LIBRAIRIE (AVEC SUPABASE) ===
export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadBooks = async () => {
      
      const cached = loadFromStorage<Book[]>(STORAGE_KEYS.BOOKS, []);
      if (cached.length > 0) {
        // Nettoyer les URLs blob: qui ne survivent pas au rechargement
        const sanitized = cached.map(b => ({
          ...b,
          coverImage: b.coverImage && b.coverImage.startsWith('blob:') ? '' : b.coverImage,
          pdfUrl: b.pdfUrl && b.pdfUrl.startsWith('blob:') ? '' : b.pdfUrl,
        }));
        setBooks(sanitized);
      }
      
      if (isSupabaseConfigured()) {
        try {
          const data = await fetchBooks();
          if (data && data.length > 0) {
            setBooks(data);
            saveToStorage(STORAGE_KEYS.BOOKS, data);
          } else if (cached.length === 0) {
            const { initialBooks } = await import('@/data/initialData');
            setBooks(initialBooks);
            saveToStorage(STORAGE_KEYS.BOOKS, initialBooks);
            
            for (const book of initialBooks) {
              await addBookToDB(book);
            }
          }
        } catch (error) {
          console.error('Error loading books from Supabase:', error);
          setBooks(cached);
        }
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
    };
    
    if (isSupabaseConfigured()) {
      const dbBook = await addBookToDB(newBook);
      if (dbBook) {
        setBooks(prev => {
          const updated = [...prev, dbBook];
          saveToStorage(STORAGE_KEYS.BOOKS, updated);
          return updated;
        });
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
      // Supprimer les fichiers locaux s'ils existent
      if (bookToRemove.pdfUrl?.startsWith('indexeddb://')) {
        await deleteFileLocal(bookToRemove.pdfUrl);
      }
      if (bookToRemove.coverImage?.startsWith('indexeddb://')) {
        await deleteFileLocal(bookToRemove.coverImage);
      }
    }
    
    if (isSupabaseConfigured()) {
      const success = await deleteBookFromDB(id);
      if (success) {
        setBooks(prev => {
          const updated = prev.filter(b => b.id !== id);
          saveToStorage(STORAGE_KEYS.BOOKS, updated);
          return updated;
        });
        return;
      }
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
