import { useState, useMemo } from 'react';
import { Search, Filter, Puzzle, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LevelBadge, DifficultyBadge } from '@/components/LevelBadge';
import { TitleWithFormula } from '@/components/InlineFormula';
import type { Problem, Level } from '@/types';
import { LEVELS } from '@/types';

interface ProblemsPageProps {
  problems: Problem[];
  onNavigate: (route: string, params?: any) => void;
}

export function ProblemsPage({ problems, onNavigate }: ProblemsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(problems.map(p => p.category));
    return Array.from(cats).sort();
  }, [problems]);

  // Filtrer les problèmes
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = !searchQuery || 
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = !selectedLevel || problem.level === selectedLevel;
      const matchesCategory = !selectedCategory || problem.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || problem.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesLevel && matchesCategory && matchesDifficulty;
    });
  }, [problems, searchQuery, selectedLevel, selectedCategory, selectedDifficulty]);

  const hasActiveFilters = selectedLevel || selectedCategory || selectedDifficulty;

  const clearFilters = () => {
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Puzzle className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            Tous les Problèmes
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {filteredProblems.length} problèmes disponibles
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
            placeholder="Rechercher un problème..."
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

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
            <Filter className="w-3 h-3 md:w-4 md:h-4" />
            Difficulté:
          </span>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {(['Facile', 'Moyen', 'Difficile'] as const).map(difficulty => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                className={cn(
                  'px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-medium transition-all',
                  selectedDifficulty === difficulty && 'ring-2 ring-offset-1'
                )}
                style={{
                  backgroundColor: 
                    difficulty === 'Facile' ? '#dcfce7' :
                    difficulty === 'Moyen' ? '#fef9c3' : '#fee2e2',
                  color: 
                    difficulty === 'Facile' ? '#166534' :
                    difficulty === 'Moyen' ? '#854d0e' : '#991b1b',
                }}
              >
                {difficulty}
              </button>
            ))}
          </div>
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
                      ? 'bg-orange-600 text-white'
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

      {/* Problems Grid - Responsive */}
      {filteredProblems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredProblems.map(problem => (
            <div
              key={problem.id}
              className="group bg-white rounded-xl border border-gray-200 p-4 md:p-5 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => onNavigate('article', { type: 'problem', id: problem.id })}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                  <LevelBadge level={problem.level} size="sm" />
                  <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                </div>
                {problem.date && (
                  <span className="text-[10px] md:text-xs text-gray-400">{problem.date}</span>
                )}
              </div>

              {/* Category */}
              <span className="inline-block text-[10px] md:text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mb-2">
                {problem.category}
              </span>

              {/* Title */}
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                <TitleWithFormula text={problem.title} />
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3 md:mb-4">
                {problem.description}
              </p>

              {/* Hints count */}
              {problem.hints && problem.hints.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mb-3">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {problem.hints.length} indice{problem.hints.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Action */}
              <div className="flex items-center text-orange-600 text-xs md:text-sm font-medium">
                <span>Résoudre</span>
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12">
          <Puzzle className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">
            Aucun problème trouvé
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
