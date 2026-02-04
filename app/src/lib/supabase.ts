import { createClient } from '@supabase/supabase-js';
import type { Course, Problem, Formula, Book } from '@/types';

// Configuration Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug logs (visible dans la console du navigateur)
console.log('=== SUPABASE CONFIG DEBUG ===');
console.log('URL defined:', !!SUPABASE_URL);
console.log('URL value:', SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : 'EMPTY');
console.log('Key defined:', !!SUPABASE_ANON_KEY);
console.log('Key length:', SUPABASE_ANON_KEY.length);
console.log('Key starts with:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'EMPTY');

// Vérifier si la configuration est valide
const isValidConfig = SUPABASE_URL && SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('https://') && 
  SUPABASE_ANON_KEY.length > 50;

console.log('Config is valid:', isValidConfig);
console.log('=============================');

// Client Supabase (null si configuration invalide)
export const supabase = isValidConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// === COURSES ===
export async function fetchCourses(): Promise<Course[]> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping fetchCourses');
    return [];
  }
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
  
  return data || [];
}

export async function addCourseToDB(course: Omit<Course, 'id'>) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping addCourseToDB');
    return null;
  }
  
  const { data, error } = await supabase
    .from('courses')
    .insert([course])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding course:', error);
    return null;
  }
  
  return data;
}

export async function updateCourseInDB(id: string, updates: Partial<Course>) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping updateCourseInDB');
    return null;
  }
  
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating course:', error);
    return null;
  }
  
  return data;
}

export async function deleteCourseFromDB(id: string) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping deleteCourseFromDB');
    return false;
  }
  
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting course:', error);
    return false;
  }
  
  return true;
}

// === PROBLEMS ===
export async function fetchProblems(): Promise<Problem[]> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping fetchProblems');
    return [];
  }
  
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching problems:', error);
    return [];
  }
  
  return data || [];
}

export async function addProblemToDB(problem: Omit<Problem, 'id'>) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping addProblemToDB');
    return null;
  }
  
  const { data, error } = await supabase
    .from('problems')
    .insert([problem])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding problem:', error);
    return null;
  }
  
  return data;
}

export async function updateProblemInDB(id: string, updates: Partial<Problem>) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping updateProblemInDB');
    return null;
  }
  
  const { data, error } = await supabase
    .from('problems')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating problem:', error);
    return null;
  }
  
  return data;
}

export async function deleteProblemFromDB(id: string) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping deleteProblemFromDB');
    return false;
  }
  
  const { error } = await supabase
    .from('problems')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting problem:', error);
    return false;
  }
  
  return true;
}

// === FORMULAS ===
export async function fetchFormulas(): Promise<Formula[]> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping fetchFormulas');
    return [];
  }
  
  const { data, error } = await supabase
    .from('formulas')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching formulas:', error);
    return [];
  }
  
  return data || [];
}

export async function addFormulaToDB(formula: Omit<Formula, 'id'>) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping addFormulaToDB');
    return null;
  }
  
  const { data, error } = await supabase
    .from('formulas')
    .insert([formula])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding formula:', error);
    return null;
  }
  
  return data;
}

export async function updateFormulaInDB(id: string, updates: Partial<Formula>) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping updateFormulaInDB');
    return null;
  }
  
  const { data, error } = await supabase
    .from('formulas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating formula:', error);
    return null;
  }
  
  return data;
}

export async function deleteFormulaFromDB(id: string) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping deleteFormulaFromDB');
    return false;
  }
  
  const { error } = await supabase
    .from('formulas')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting formula:', error);
    return false;
  }
  
  return true;
}

// === BOOKS ===
export async function fetchBooks(): Promise<Book[]> {
  if (!supabase) {
    console.warn('Supabase not configured, skipping fetchBooks');
    return [];
  }
  
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }
  
  return data || [];
}

export async function addBookToDB(book: Omit<Book, 'id'>) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping addBookToDB');
    return null;
  }
  
  const { data, error } = await supabase
    .from('books')
    .insert([book])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding book:', error);
    return null;
  }
  
  return data;
}

export async function deleteBookFromDB(id: string) {
  if (!supabase) {
    console.warn('Supabase not configured, skipping deleteBookFromDB');
    return false;
  }
  
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting book:', error);
    return false;
  }
  
  return true;
}

// === FILE STORAGE ===
export async function uploadImage(file: File, folder: string): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot upload image');
    return null;
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `public/${folder}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type, metadata: { size: String(file.size) } });
  
  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);
  console.debug('uploadImage:', { filePath, publicUrl });
  return publicUrl;
} 

export async function uploadPDF(file: File): Promise<string | null> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot upload PDF');
    return null;
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `public/pdfs/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type, metadata: { size: String(file.size) } });
  
  if (uploadError) {
    console.error('Error uploading PDF:', uploadError);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);
  console.debug('uploadPDF:', { filePath, publicUrl });
  return publicUrl;
}
