import { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LevelBadge } from '@/components/LevelBadge';
import { TitleWithFormula } from '@/components/InlineFormula';
import type { Course, Level } from '@/types';
import { LEVELS } from '@/types';

interface CoursesPageProps {
  courses: Course[];
  onNavigate: (route: string, params?: any) => void;
}

export function CoursesPage({ courses, onNavigate }: CoursesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category));
    return Array.from(cats).sort();
  }, [courses]);

  // Filtrer les cours
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = !searchQuery || 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = !selectedLevel || course.level === selectedLevel;
      const matchesCategory = !selectedCategory || course.category === selectedCategory;
      
      return matchesSearch && matchesLevel && matchesCategory;
    });
  }, [courses, searchQuery, selectedLevel, selectedCategory]);

  const hasActiveFilters = selectedLevel || selectedCategory;

  const clearFilters = () => {
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            Tous les Cours
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {filteredCourses.length} cours disponibles
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un cours..."
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
                      ? 'bg-blue-600 text-white'
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

      {/* Courses Grid - Responsive */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredCourses.map(course => (
            <div
              key={course.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => onNavigate('article', { type: 'course', id: course.id })}
            >
              {/* Image - Responsive height */}
              {course.image ? (
                <div className="h-40 sm:h-44 md:h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="h-40 sm:h-44 md:h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-blue-300" />
                </div>
              )}

              {/* Content */}
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <LevelBadge level={course.level} />
                  <span className="text-xs text-gray-400">{course.date}</span>
                </div>

                <span
                  className="inline-block text-[10px] md:text-xs px-2 py-0.5 rounded-full mb-2"
                  style={{
                    backgroundColor: course.categoryColor || '#f0f9ff',
                    color: course.categoryTextColor || '#0284c7',
                  }}
                >
                  {course.category}
                </span>

                <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  <TitleWithFormula text={course.title} />
                </h3>

                <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3 md:mb-4">
                  {course.description}
                </p>

                <div className="flex items-center text-blue-600 text-xs md:text-sm font-medium">
                  <span>Lire le cours</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12">
          <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">
            Aucun cours trouvé
          </h3>
          <p className="text-sm text-gray-500">
            Essayez de modifier vos critères de recherche
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
