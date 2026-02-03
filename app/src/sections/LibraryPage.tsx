import { useState, useMemo, useRef } from 'react';
import { Search, Library, Filter, X, FileText, Upload, Download, BookOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { LevelBadge } from '@/components/LevelBadge';
import type { Book, Level } from '@/types';
import { LEVELS } from '@/types';

interface LibraryPageProps {
  books: Book[];
  isAdmin: boolean;
  onAddBook: (book: Omit<Book, 'id' | 'uploadDate'>) => void;
  onRemoveBook: (id: string) => void;
}

export function LibraryPage({ books, isAdmin, onAddBook, onRemoveBook }: LibraryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Formulaire pour ajouter un livre
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    level: 'Licence' as Level,
    category: '',
    pdfUrl: '',
    coverImage: '',
  });

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(books.map(b => b.category));
    return Array.from(cats).sort();
  }, [books]);

  // Filtrer les livres
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = !searchQuery || 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = !selectedLevel || book.level === selectedLevel;
      const matchesCategory = !selectedCategory || book.category === selectedCategory;
      
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [books, searchQuery, selectedLevel, selectedCategory]);

  const hasActiveFilters = selectedLevel || selectedCategory;

  const clearFilters = () => {
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleAddBook = () => {
    if (newBook.title && newBook.author && newBook.category) {
      onAddBook(newBook);
      setNewBook({
        title: '',
        author: '',
        description: '',
        level: 'Licence',
        category: '',
        pdfUrl: '',
        coverImage: '',
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewBook(prev => ({ ...prev, pdfUrl: url }));
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewBook(prev => ({ ...prev, coverImage: url }));
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
            {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''} disponible{filteredBooks.length > 1 ? 's' : ''}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-sm md:text-base">
                <Upload className="w-4 h-4 mr-2" />
                Ajouter un PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un livre PDF</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <Input
                    value={newBook.title}
                    onChange={(e) => setNewBook(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titre du livre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Auteur *
                  </label>
                  <Input
                    value={newBook.author}
                    onChange={(e) => setNewBook(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Nom de l'auteur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau *
                    </label>
                    <select
                      value={newBook.level}
                      onChange={(e) => setNewBook(prev => ({ ...prev, level: e.target.value as Level }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                      {LEVELS.map(level => (
                        <option key={level.name} value={level.name}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie *
                    </label>
                    <Input
                      value={newBook.category}
                      onChange={(e) => setNewBook(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="ex: Analyse"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fichier PDF
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {newBook.pdfUrl ? 'Changer le PDF' : 'Choisir un fichier'}
                    </Button>
                  </div>
                  {newBook.pdfUrl && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Fichier sélectionné
                    </p>
                  )}
                </div>

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image de couverture
                  </label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverInputRef.current?.click()}
                      className="flex-1 text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {newBook.coverImage ? 'Changer l\'image' : 'Ajouter une couverture'}
                    </Button>
                  </div>
                  {newBook.coverImage && (
                    <div className="mt-3">
                      <p className="text-sm text-green-600 mb-2 flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Image sélectionnée
                      </p>
                      <img 
                        src={newBook.coverImage} 
                        alt="Couverture" 
                        className="h-32 rounded-lg object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddBook}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    disabled={!newBook.title || !newBook.author || !newBook.category}
                  >
                    Ajouter le livre
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
              onClick={() => setSearchQuery('')}
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
            {LEVELS.map(level => (
              <button
                key={level.name}
                onClick={() => setSelectedLevel(selectedLevel === level.name ? null : level.name)}
                className={cn(
                  'px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium transition-all',
                  selectedLevel === level.name && 'ring-2 ring-offset-1'
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
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={cn(
                    'px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium transition-all',
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          {filteredBooks.map(book => (
            <div
              key={book.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all"
            >
              {/* Cover */}
              <div className="h-40 sm:h-44 md:h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-indigo-300" />
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
                  <span className="text-[10px] md:text-xs text-gray-400">{book.uploadDate}</span>
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
                  {book.pdfUrl && (
                    <a
                      href={book.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full text-xs md:text-sm">
                        <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Ouvrir
                      </Button>
                    </a>
                  )}
                  {book.pdfUrl && (
                    <a
                      href={book.pdfUrl}
                      download
                      className="flex-shrink-0"
                    >
                      <Button variant="outline" size="icon" className="w-9 h-9 md:w-10 md:h-10">
                        <Download className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
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
              : 'Aucun livre n\'est disponible pour le moment'}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" className="mt-4 text-sm">
              Effacer les filtres
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
