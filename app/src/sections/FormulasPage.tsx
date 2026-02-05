import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Calculator, Filter, X, Copy, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LevelBadge } from '@/components/LevelBadge';
import { TitleWithFormula } from '@/components/InlineFormula';
import type { Formula, Level } from '@/types';
import { LEVELS } from '@/types';

// === MATH RENDERER COMPONENT ===
function FormulaMath({ tex }: { tex: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]);
    }
  }, [tex]);

  const formattedTex = tex.trim().startsWith('$') ? tex : `$${tex}$`;

  return (
    <div ref={containerRef} className="text-center">
      {formattedTex}
    </div>
  );
}

interface FormulasPageProps {
  formulas: Formula[];
  highlightFormula?: string;
}

export function FormulasPage({ formulas, highlightFormula }: FormulasPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const formulaRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll vers la formule mise en évidence
  useEffect(() => {
    if (highlightFormula && formulaRefs.current[highlightFormula]) {
      // Petit délai pour laisser le rendu se faire
      setTimeout(() => {
        const element = formulaRefs.current[highlightFormula];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightFormula, formulas]);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = new Set(formulas.map(f => f.category));
    return Array.from(cats).sort();
  }, [formulas]);

  // Grouper les formules par catégorie
  const groupedFormulas = useMemo(() => {
    const filtered = formulas.filter(formula => {
      const matchesSearch = !searchQuery || 
        formula.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formula.tex.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formula.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formula.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = !selectedLevel || formula.level === selectedLevel;
      const matchesCategory = !selectedCategory || formula.category === selectedCategory;
      
      return matchesSearch && matchesLevel && matchesCategory;
    });

    const grouped: Record<string, Formula[]> = {};
    filtered.forEach(formula => {
      if (!grouped[formula.category]) {
        grouped[formula.category] = [];
      }
      grouped[formula.category].push(formula);
    });

    return grouped;
  }, [formulas, searchQuery, selectedLevel, selectedCategory]);

  const hasActiveFilters = selectedLevel || selectedCategory;

  const clearFilters = () => {
    setSelectedLevel(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            Formules & Théorèmes
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            {formulas.length} formules disponibles
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
            placeholder="Rechercher une formule, un code..."
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
                      ? 'bg-purple-600 text-white'
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

      {/* Formulas by Category - Responsive */}
      {Object.keys(groupedFormulas).length > 0 ? (
        <div className="space-y-6 md:space-y-8">
          {Object.entries(groupedFormulas).map(([category, categoryFormulas]) => (
            <section key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 md:px-6 py-3 md:py-4 border-b border-purple-100">
                <h2 className="text-base md:text-lg font-bold text-purple-800 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5" />
                  {category}
                </h2>
                <p className="text-xs md:text-sm text-purple-600 mt-1">
                  {categoryFormulas.length} formule{categoryFormulas.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Formulas List */}
              <div className="divide-y divide-gray-100">
                {categoryFormulas.map(formula => (
                  <div 
                    key={formula.id}
                    ref={el => { formulaRefs.current[formula.code] = el; }}
                    className={cn(
                      'p-4 md:p-6 hover:bg-gray-50 transition-all scroll-mt-24',
                      highlightFormula === formula.code && 'bg-amber-50 ring-2 ring-amber-400 ring-inset animate-pulse'
                    )}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                      {/* Left: Formula Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <LevelBadge level={formula.level} size="sm" />
                          <span className="text-[10px] md:text-xs font-mono bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {formula.code}
                          </span>
                        </div>
                        
                        <h3 className="text-sm md:text-base font-bold text-gray-800 mb-2">
                          <TitleWithFormula text={formula.name} />
                        </h3>
                        
                        {formula.description && (
                          <div className="text-xs md:text-sm text-gray-600 mb-3">
                            <TitleWithFormula text={formula.description} />
                          </div>
                        )}

                        {/* Formula Display */}
                        <div className="bg-gray-50 rounded-lg p-3 md:p-4 overflow-x-auto">
                          <FormulaMath tex={formula.tex} />
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex md:flex-col items-start md:items-center gap-2">
                        <button
                          onClick={() => copyCode(formula.code)}
                          className={cn(
                            'flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all',
                            copiedCode === formula.code
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          )}
                          title="Copier le code de référence"
                        >
                          {copiedCode === formula.code ? (
                            <>
                              <Check className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="hidden sm:inline">Copié!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="hidden sm:inline">{formula.code}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12">
          <Calculator className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">
            Aucune formule trouvée
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
