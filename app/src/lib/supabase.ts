import { createClient } from '@supabase/supabase-js';
import type { Course, Problem, Formula, Book } from '@/types';

// Configuration Supabase
// Note: Utilise VITE_ si tu es sur Vite (React), ou NEXT_PUBLIC_ si tu es sur Next.js
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Vérifier si la configuration est valide
const isValidConfig = SUPABASE_URL && SUPABASE_ANON_KEY && 
  SUPABASE_URL.startsWith('https://') && 
  SUPABASE_ANON_KEY.length > 20;

// Configuration explicite du client
export const supabase = isValidConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
    },
  },
}) : null;


// === COURSES ===

export async function fetchCourses(): Promise<Course[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching courses:', error.message);
    return [];
  }
  
  return (data || []).map((course: any) => ({
    ...course,
    categoryColor: course.categorycolor || course.categoryColor || '#f0f9ff',
    categoryTextColor: course.categorytextcolor || course.categoryTextColor || '#0284c7',
    image: course.image || ''
  }));
}

export async function addCourseToDB(course: Omit<Course, 'id'> & { id?: string }) {
  if (!supabase) return null;
  
  const courseData: Record<string, unknown> = {
    type: course.type,
    title: course.title,
    category: course.category,
    level: course.level,
    date: course.date,
    description: course.description,
    content: course.content,
    image: course.image || '',
    categorycolor: course.categoryColor,
    categorytextcolor: course.categoryTextColor
  };
  
  if (course.id) courseData.id = course.id;
  
  const { data, error } = await supabase
    .from('courses')
    .upsert([courseData])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding course:', error.message);
    return null;
  }
  
  return data;
}

export async function updateCourseInDB(id: string, updates: Partial<Course>) {
  if (!supabase) return null;
  
  const updateData: any = { ...updates };
  if (updates.categoryColor) updateData.categorycolor = updates.categoryColor;
  if (updates.categoryTextColor) updateData.categorytextcolor = updates.categoryTextColor;

  const { data, error } = await supabase
    .from('courses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating course:', error.message);
    return null;
  }
  return data;
}

export async function deleteCourseFromDB(id: string) {
  if (!supabase) return false;
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) {
    console.error('Error deleting course:', error.message);
    return false;
  }
  return true;
}


// === PROBLEMS ===

export async function fetchProblems(): Promise<Problem[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('problems')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching problems:', error.message);
    return [];
  }
  
  return data || [];
}

export async function addProblemToDB(problem: Omit<Problem, 'id'>) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('problems')
    .insert([problem])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding problem:', error.message);
    return null;
  }
  return data;
}

export async function updateProblemInDB(id: string, updates: Partial<Problem>) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('problems')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating problem:', error.message);
    return null;
  }
  return data;
}

export async function deleteProblemFromDB(id: string) {
  if (!supabase) return false;
  const { error } = await supabase.from('problems').delete().eq('id', id);
  if (error) return false;
  return true;
}


// === FORMULAS ===

export async function fetchFormulas(): Promise<Formula[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('formulas')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching formulas:', error.message);
    return [];
  }
  return data || [];
}

export async function addFormulaToDB(formula: Omit<Formula, 'id'>) {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('formulas')
    .insert([formula])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding formula:', error.message);
    return null;
  }
  return data;
}

export async function updateFormulaInDB(id: string, updates: Partial<Formula>) {
  if (!supabase) return null;
  const { data, error } = await supabase.from('formulas').update(updates).eq('id', id).select().single();
  if (error) return null;
  return data;
}

export async function deleteFormulaFromDB(id: string) {
  if (!supabase) return false;
  const { error } = await supabase.from('formulas').delete().eq('id', id);
  if (error) return false;
  return true;
}


// === BOOKS ===

export async function fetchBooks(): Promise<Book[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching books:', error.message);
    return [];
  }
  
  return (data || []).map((book: any) => ({
    ...book,
    uploadDate: book.uploaddate || book.uploadDate,
    pdfUrl: book.pdfurl || book.pdfUrl || '',
    coverImage: book.coverimage || book.coverImage || ''
  }));
}

export async function addBookToDB(book: Omit<Book, 'id'> & { id?: string }) {
  if (!supabase) return null;
  
  const bookData: Record<string, unknown> = {
    title: book.title,
    author: book.author,
    description: book.description,
    level: book.level,
    category: book.category,
    uploaddate: book.uploadDate || new Date().toISOString().split('T')[0],
    pdfurl: book.pdfUrl || '',
    coverimage: book.coverImage || ''
  };
  
  if (book.id) bookData.id = book.id;
  
  // Upsert pour éviter les plantages si l'ID existe
  const { data, error } = await supabase
    .from('books')
    .upsert([bookData])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding book:', error.message);
    return null;
  }
  
  return data;
}

export async function deleteBookFromDB(id: string) {
  if (!supabase) return false;
  
  // Cette commande échouera silencieusement si la Policy DELETE n'est pas activée dans Supabase
  const { error } = await supabase.from('books').delete().eq('id', id);
  
  if (error) {
    console.error('Error deleting book:', error.message);
    return false;
  }
  return true;
}


// === FILE STORAGE ===

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  if (!supabase) return null;
  
  const fileExt = file.name.split('.').pop();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
  const filePath = `public/${folder}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file, { 
      cacheControl: '3600', 
      upsert: false, 
      contentType: file.type
    });
  
  if (uploadError) {
    console.error('Error uploading image:', uploadError.message);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);
    
  return publicUrl;
} 

export async function uploadPDF(file: File): Promise<string | null> {
  if (!supabase) return null;
  
  const fileExt = file.name.split('.').pop();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${Date.now()}_${cleanFileName}.${fileExt}`;
  const filePath = `public/pdfs/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { 
      cacheControl: '3600', 
      upsert: false, 
      contentType: file.type 
    });
  
  if (uploadError) {
    console.error('Error uploading PDF:', uploadError.message);
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);
    
  return publicUrl;
}