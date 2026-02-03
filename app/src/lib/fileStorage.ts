// === STOCKAGE LOCAL DE FICHIERS (IndexedDB) ===
// Fallback quand Supabase n'est pas configuré

const DB_NAME = 'MathUniversFiles';
const DB_VERSION = 1;
const STORE_NAME = 'files';

interface StoredFile {
  id: string;
  name: string;
  type: string;
  data: ArrayBuffer;
  createdAt: number;
}

// Ouvrir la base de données
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Stocker un fichier
export async function storeFileLocal(file: File): Promise<string | null> {
  try {
    const db = await openDB();
    const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Lire le fichier comme ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    const storedFile: StoredFile = {
      id,
      name: file.name,
      type: file.type,
      data: arrayBuffer,
      createdAt: Date.now(),
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(storedFile);
      
      request.onsuccess = () => {
        // Retourner un identifiant qui pourra être utilisé pour récupérer le fichier
        resolve(`indexeddb://${id}`);
        db.close();
      };
      
      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  } catch (error) {
    console.error('Error storing file locally:', error);
    return null;
  }
}

// Récupérer un fichier
export async function getFileLocal(url: string): Promise<Blob | null> {
  // Si c'est une URL indexeddb
  if (url.startsWith('indexeddb://')) {
    const id = url.replace('indexeddb://', '');
    try {
      const db = await openDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => {
          const result: StoredFile = request.result;
          if (result) {
            const blob = new Blob([result.data], { type: result.type });
            resolve(blob);
          } else {
            resolve(null);
          }
          db.close();
        };
        
        request.onerror = () => {
          reject(request.error);
          db.close();
        };
      });
    } catch (error) {
      console.error('Error getting file from IndexedDB:', error);
      return null;
    }
  }
  
  return null;
}

// Créer une URL objet à partir d'un fichier stocké
export async function createObjectURL(url: string): Promise<string | null> {
  if (url.startsWith('indexeddb://')) {
    const blob = await getFileLocal(url);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  }
  return url; // Retourner l'URL telle quelle si ce n'est pas une URL indexeddb
}

// Supprimer un fichier local
export async function deleteFileLocal(url: string): Promise<boolean> {
  if (!url.startsWith('indexeddb://')) return false;
  
  const id = url.replace('indexeddb://', '');
  try {
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
        db.close();
      };
      
      request.onerror = () => {
        reject(request.error);
        db.close();
      };
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Nettoyer les vieux fichiers (plus de 30 jours)
export async function cleanupOldFiles(): Promise<void> {
  try {
    const db = await openDB();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();
    
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const file: StoredFile = cursor.value;
        if (file.createdAt < thirtyDaysAgo) {
          store.delete(file.id);
        }
        cursor.continue();
      }
    };
    
    db.close();
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
}
