import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Library,
  Filter,
  X,
  FileText,
  Upload,
  Download,
  BookOpen,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import { LevelBadge } from "@/components/LevelBadge";
import type { Book, Level } from "@/types";
import { LEVELS } from "@/types";
import { uploadPDF, uploadImage } from "@/lib/supabase";
import { storeFileLocal, createObjectURL } from "@/lib/fileStorage";

// Composant pour afficher une image qui peut être stockée localement (indexeddb://)
function LocalImage({ src, alt, className, onError }: { src: string; alt: string; className?: string; onError?: () => void }) {
  const [objectUrl, setObjectUrl] = useState<string>(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    
    const loadImage = async () => {
      if (src.startsWith('indexeddb://')) {
        const objUrl = await createObjectURL(src);
        if (objUrl) {
          url = objUrl;
          setObjectUrl(objUrl);
        } else {
          setError(true);
        }
      } else {
        setObjectUrl(src);
      }
    };
    
    loadImage();
    
    return () => {
      // Cleanup: révoquer l'URL objet si c'en est une
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [src]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <BookOpen className="w-12 h-12 text-gray-300" />
      </div>
    );
  }

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      onError={() => {
        setError(true);
        onError?.();
      }}
    />
  );
}

// Hook pour créer une URL téléchargeable pour un PDF
function usePDFUrl(pdfUrl: string | undefined) {
  const [url, setUrl] = useState<string>(pdfUrl || '');
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    
    const loadPdf = async () => {
      if (pdfUrl?.startsWith('indexeddb://')) {
        const objUrl = await createObjectURL(pdfUrl);
        if (objUrl) {
          objectUrl = objUrl;
          setUrl(objUrl);
          setIsLocal(true);
        }
      } else {
        setUrl(pdfUrl || '');
        setIsLocal(false);
      }
    };
    
    loadPdf();
    
    return () => {
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [pdfUrl]);

  return { url, isLocal };
}

interface LibraryPageProps {
  books: Book[];
  isAdmin: boolean;
  onAddBook: (book: Omit<Book, "id" | "uploadDate">) => void;
  onRemoveBook: (id: string) => void;
}

// Composant pour afficher une carte de livre avec support des fichiers locaux
function BookCard({ 
  book, 
  isAdmin, 
  onRemoveBook 
}: { 
  book: Book; 
  isAdmin: boolean; 
  onRemoveBook: (id: string) => void;
}) {
  const { url: pdfUrl, isLocal: isPdfLocal } = usePDFUrl(book.pdfUrl);
  const [coverObjectUrl, setCoverObjectUrl] = useState<string | null>(null);

  // Charger l'image de couverture si elle est stockée localement
  useEffect(() => {
    let url: string | null = null;
    
    const loadCover = async () => {
      if (book.coverImage?.startsWith('indexeddb://')) {
        const objUrl = await createObjectURL(book.coverImage);
        if (objUrl) {
          url = objUrl;
          setCoverObjectUrl(objUrl);
        }
      }
    };
    
    loadCover();
    
    return () => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [book.coverImage]);

  const displayCoverUrl = coverObjectUrl || book.coverImage;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all">
      {/* Cover */}
      <div className="h-40 sm:h-44 md:h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
        {displayCoverUrl && !displayCoverUrl.startsWith('indexeddb://') ? (
          <LocalImage
            src={displayCoverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-indigo-300">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16" />
            {book.pdfUrl && (
              <span className="text-xs mt-2 text-indigo-400">Cliquez sur Ouvrir</span>
            )}
          </div>
        )}
        {isAdmin && (
          <button
            onClick={() => onRemoveBook(book.id)}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between mb-2">
          <LevelBadge level={book.level} size="sm" />
          <span className="text-[10px] md:text-xs text-gray-400">
            {book.uploadDate}
          </span>
        </div>

        <span className="inline-block text-[10px] md:text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mb-2">
          {book.category}
        </span>

        <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 line-clamp-2">
          {book.title}
        </h3>

        <p className="text-xs md:text-sm text-gray-500 mb-2">
          par {book.author}
        </p>

        {book.description && (
          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3 md:mb-4">
            {book.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {pdfUrl ? (
            <>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  className="w-full text-xs md:text-sm hover:bg-indigo-50 hover:border-indigo-300"
                >
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Ouvrir
                  {isPdfLocal && (
                    <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">local</span>
                  )}
                </Button>
              </a>
              <a href={pdfUrl} download className="flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-9 h-9 md:w-10 md:h-10 hover:bg-indigo-50 hover:border-indigo-300"
                  title="Télécharger le PDF"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </a>
            </>
          ) : (
            <div className="flex-1 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>PDF non disponible</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LibraryPage({
  books,
  isAdmin,
  onAddBook,
  onRemoveBook,
}: LibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

  // Formulaire pour ajouter un livre
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    description: "",
    level: "Licence" as Level,
    category: "",
    pdfUrl: "",
    coverImage: "",
  });

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(books.map((b) => b.category));
    return Array.from(cats).sort();
  }, [books]);

  // Filtrer les livres
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        !searchQuery ||
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel = !selectedLevel || book.level === selectedLevel;
      const matchesCategory =
        !selectedCategory || book.category === selectedCategory;

      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [books, searchQuery, selectedLevel, selectedCategory]);

  const hasActiveFilters = selectedLevel || selectedCategory;

  const clearFilters = () => {
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const handleAddBook = async () => {
    if (newBook.title && newBook.author && newBook.category) {
      setIsUploading(true);
      const { toast } = await import("sonner");
      
      try {
        let pdfUrl = newBook.pdfUrl;
        let coverImage = newBook.coverImage;
        let usedLocalStorage = false;

        // Upload PDF - try Supabase first, then local storage
        if (pdfFile) {
          // Essayer Supabase d'abord
          const uploaded = await uploadPDF(pdfFile);
          if (uploaded) {
            pdfUrl = uploaded;
            console.log("PDF uploaded to Supabase:", uploaded);
          } else {
            // Fallback: stocker localement dans IndexedDB
            console.log("Supabase upload failed, trying local storage...");
            const localUrl = await storeFileLocal(pdfFile);
            if (localUrl) {
              pdfUrl = localUrl;
              usedLocalStorage = true;
              console.log("PDF stored locally:", localUrl);
            } else {
              toast.error(
                "Impossible de stocker le PDF. Vérifiez l'espace disponible sur votre navigateur.",
              );
              setIsUploading(false);
              return;
            }
          }
        }
        
        // Upload Cover Image - try Supabase first, then local storage
        if (coverFile) {
          const uploaded = await uploadImage(coverFile, "covers");
          if (uploaded) {
            coverImage = uploaded;
            console.log("Cover uploaded to Supabase:", uploaded);
          } else {
            // Fallback: stocker localement
            console.log("Supabase upload failed, trying local storage for cover...");
            const localUrl = await storeFileLocal(coverFile);
            if (localUrl) {
              coverImage = localUrl;
              usedLocalStorage = true;
              console.log("Cover stored locally:", localUrl);
            } else {
              toast.warning(
                "L'upload de la couverture a échoué ; le livre sera ajouté sans image.",
              );
              coverImage = "";
            }
          }
        }

        // Check if we have at least a PDF URL
        if (!pdfUrl) {
          toast.error(
            "Aucun fichier n'a pu être enregistré. Veuillez réessayer.",
          );
          setIsUploading(false);
          return;
        }

        console.debug(
          "Adding book with pdfUrl:",
          pdfUrl,
          "coverImage:",
          coverImage,
        );
        
        onAddBook({
          ...newBook,
          pdfUrl: pdfUrl || "",
          coverImage: coverImage || "",
        });
        
        if (usedLocalStorage) {
          toast.success("Livre ajouté (stocké localement) !");
        } else {
          toast.success("Livre ajouté avec succès !");
        }

        // Clear form and local file refs
        setNewBook({
          title: "",
          author: "",
          description: "",
          level: "Licence",
          category: "",
          pdfUrl: "",
          coverImage: "",
        });
        setPdfFile(null);
        setCoverFile(null);
        setIsAddDialogOpen(false);
      } catch (err) {
        console.error("Failed to upload files for book:", err);
        toast.error(
          "Erreur lors de l'ajout du livre. Vérifiez la console pour plus de détails.",
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_PDF_BYTES) {
        const { toast } = await import("sonner");
        toast.error("PDF trop volumineux. Taille max : 50 MB.");
        return;
      }

      setPdfFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        // keep a lightweight preview, but do NOT rely on this for persistence
        setNewBook((prev) => ({ ...prev, pdfUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_IMAGE_BYTES) {
        const { toast } = await import("sonner");
        toast.error("Image trop volumineuse. Taille max : 10 MB.");
        return;
      }

      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setNewBook((prev) => ({
          ...prev,
          coverImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Library className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
            Librairie
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {filteredBooks.length} livre{filteredBooks.length > 1 ? "s" : ""}{" "}
            disponible{filteredBooks.length > 1 ? "s" : ""}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm md:text-base">
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter un PDF
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle>Ajouter un livre PDF</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                    <Input
                      value={newBook.title}
                      onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre du livre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auteur *</label>
                    <Input
                      value={newBook.author}
                      onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Nom de l'auteur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newBook.description}
                      onChange={(e) => setNewBook(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du livre"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Niveau *</label>
                      <select
                        value={newBook.level}
                        onChange={(e) => setNewBook(prev => ({ ...prev, level: e.target.value as Level }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      >
                        {LEVELS.map(level => (
                          <option key={level.name} value={level.name}>{level.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                      <Input
                        value={newBook.category}
                        onChange={(e) => setNewBook(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="ex: Analyse"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fichier PDF</label>
                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 text-sm">
                        <Upload className="w-4 h-4 mr-2" />
                        {newBook.pdfUrl ? 'Changer le PDF' : 'Choisir un fichier'}
                      </Button>
                    </div>
                    {newBook.pdfUrl && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><FileText className="w-4 h-4" /> Fichier sélectionné</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
                    <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => coverInputRef.current?.click()} className="flex-1 text-sm">
                        <Upload className="w-4 h-4 mr-2" />
                        {newBook.coverImage ? 'Changer l\'image' : 'Ajouter une couverture'}
                      </Button>
                    </div>
                    {newBook.coverImage && (
                      <div className="mt-3">
                        <p className="text-sm text-green-600 mb-2 flex items-center gap-1"><FileText className="w-4 h-4" /> Image sélectionnée</p>
                        <img src={newBook.coverImage} alt="Couverture" className="h-32 rounded-lg object-cover border border-gray-200" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddBook} className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={!newBook.title || !newBook.author || !newBook.category || isUploading}>{isUploading ? 'Ajout en cours...' : 'Ajouter le livre'}</Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isUploading}>Annuler</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button type="button" variant="outline" onClick={() => onAddBook({ title: '8+ Entrance Examination', author: 'Admin Test', description: 'PDF de test pour vérifier le bouton Ouvrir.', level: 'Licence' as Level, category: 'Test', pdfUrl: 'https://www.solsch.org.uk/attachments/download.asp?file=23&type=pdf', coverImage: 'https://i.imgur.com/klRGH1L.png' })}>Ajouter un livre de test</Button>
          </div>
        )}
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un livre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 md:pl-10 pr-10 text-sm md:text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
            <Filter className="w-3 h-3 md:w-4 md:h-4" />
            Niveau:
          </span>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {LEVELS.map((level) => (
              <button
                key={level.name}
                onClick={() =>
                  setSelectedLevel(
                    selectedLevel === level.name ? null : level.name,
                  )
                }
                className={cn(
                  "px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium transition-all",
                  selectedLevel === level.name && "ring-2 ring-offset-1",
                )}
                style={{
                  backgroundColor: level.bgColor,
                  color: level.textColor,
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
              <Filter className="w-3 h-3 md:w-4 md:h-4" />
              Catégorie:
            </span>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? null : category,
                    )
                  }
                  className={cn(
                    "px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium transition-all",
                    selectedCategory === category
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs md:text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <X className="w-3 h-3 md:w-4 md:h-4" />
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Books Grid - Responsive */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              isAdmin={isAdmin} 
              onRemoveBook={onRemoveBook}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12">
          <Library className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">
            Aucun livre trouvé
          </h3>
          <p className="text-sm text-gray-500">
            {isAdmin
              ? 'Ajoutez votre premier livre PDF en cliquant sur "Ajouter un PDF"'
              : "Aucun livre n'est disponible pour le moment"}
          </p>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="mt-4 text-sm"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
