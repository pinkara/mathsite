import { useState, useEffect, useCallback } from 'react';
import type { Course, Problem, Formula, Book, MonthlyStats } from '@/types';

// === CLÉS DE STOCKAGE ===
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

// === FONCTIONS UTILITAIRES ===
function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// === HOOK POUR LES COURS ===
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
    setCourses(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.COURSES, courses);
    }
  }, [courses, isLoaded]);

  const addCourse = useCallback((course: Omit<Course, 'id' | 'type' | 'date'>) => {
    const newCourse: Course = {
      ...course,
      id: `c${Date.now()}`,
      type: 'course',
      date: new Date().toISOString().split('T')[0],
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const removeCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  }, []);

  const getCourseById = useCallback((id: string) => {
    return courses.find(c => c.id === id);
  }, [courses]);

  return { courses, addCourse, updateCourse, removeCourse, getCourseById, isLoaded };
}

// === HOOK POUR LES PROBLÈMES ===
export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadFromStorage<Problem[]>(STORAGE_KEYS.PROBLEMS, []);
    setProblems(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.PROBLEMS, problems);
    }
  }, [problems, isLoaded]);

  const addProblem = useCallback((problem: Omit<Problem, 'id' | 'type' | 'date'>) => {
    const newProblem: Problem = {
      ...problem,
      id: `p${Date.now()}`,
      type: 'problem',
      date: new Date().toISOString().split('T')[0],
    };
    setProblems(prev => [...prev, newProblem]);
    return newProblem;
  }, []);

  const updateProblem = useCallback((id: string, updates: Partial<Problem>) => {
    setProblems(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const removeProblem = useCallback((id: string) => {
    setProblems(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProblemById = useCallback((id: string) => {
    return problems.find(p => p.id === id);
  }, [problems]);

  return { problems, addProblem, updateProblem, removeProblem, getProblemById, isLoaded };
}

// === HOOK POUR LES FORMULES ===
export function useFormulas() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadFromStorage<Formula[]>(STORAGE_KEYS.FORMULAS, []);
    setFormulas(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.FORMULAS, formulas);
    }
  }, [formulas, isLoaded]);

  const addFormula = useCallback((formula: Omit<Formula, 'id'>) => {
    const newFormula: Formula = {
      ...formula,
      id: `f${Date.now()}`,
    };
    setFormulas(prev => [...prev, newFormula]);
    return newFormula;
  }, []);

  const updateFormula = useCallback((id: string, updates: Partial<Formula>) => {
    setFormulas(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const removeFormula = useCallback((id: string) => {
    setFormulas(prev => prev.filter(f => f.id !== id));
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

// === HOOK POUR LA LIBRAIRIE ===
export function useLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadFromStorage<Book[]>(STORAGE_KEYS.BOOKS, []);
    setBooks(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(STORAGE_KEYS.BOOKS, books);
    }
  }, [books, isLoaded]);

  const addBook = useCallback((book: Omit<Book, 'id' | 'uploadDate'>) => {
    const newBook: Book = {
      ...book,
      id: `b${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    setBooks(prev => [...prev, newBook]);
    return newBook;
  }, []);

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const removeBook = useCallback((id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  }, []);

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
    // Mot de passe admin (à changer en production)
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
