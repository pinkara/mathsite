import { useEffect, useState, useRef } from 'react';
import { 
  Calendar, 
  BookOpen, 
  Puzzle, 
  Calculator, 
  Star,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course, Problem, Formula } from '@/types';

// === INLINE FORMULA COMPONENT ===
function InlineFormula({ tex, className = '' }: { tex: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]);
    }
  }, [tex]);

  const formattedTex = tex.trim().startsWith('$') ? tex : `$${tex}$`;

  return (
    <div ref={containerRef} className={className}>
      {formattedTex}
    </div>
  );
}

interface SidebarProps {
  courses: Course[];
  problems: Problem[];
  formulas: Formula[];
  onNavigate: (route: 'article', params: { type: 'course' | 'problem'; id: string }) => void;
}

export function Sidebar({ courses, problems, formulas, onNavigate }: SidebarProps) {
  const [dailyContent, setDailyContent] = useState<{
    course: Course | null;
    problem: Problem | null;
    formula: Formula | null;
  }>({ course: null, problem: null, formula: null });

  useEffect(() => {
    // Sélectionner le contenu du jour basé sur la date
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    const course = courses.length > 0 ? courses[seed % courses.length] : null;
    const problem = problems.length > 0 ? problems[seed % problems.length] : null;
    const formula = formulas.length > 0 ? formulas[seed % formulas.length] : null;
    
    setDailyContent({ course, problem, formula });
  }, [courses, problems, formulas]);

  // Calculer les catégories populaires
  const categoryCount: Record<string, number> = {};
  [...courses, ...problems].forEach(item => {
    if (item.category) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    }
  });

  const popularCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <aside className="space-y-4 md:space-y-6">
      {/* À propos */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 text-xs md:text-sm uppercase tracking-wide border-b pb-2">
          À propos
        </h3>
        <p className="text-xs md:text-sm text-gray-600 mb-4">
          MathUnivers est une encyclopédie mathématique participative. 
          Chaque jour, découvrez un nouveau problème et une nouvelle formule.
        </p>
        <div className="flex items-center gap-4 text-gray-400">
          <a 
            href="https://github.com/pinkara/MathUnivers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Contenu du Jour */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 md:p-5">
        <h3 className="font-bold text-blue-800 mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wide border-b border-blue-200 pb-2 flex items-center gap-2">
          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
          Contenu du Jour
        </h3>

        {/* Cours du jour */}
        {dailyContent.course && (
          <div 
            className="mb-3 md:mb-4 p-2 md:p-3 bg-white rounded-lg border border-blue-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
            onClick={() => onNavigate('article', { type: 'course', id: dailyContent.course!.id })}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] md:text-xs font-semibold text-blue-600 uppercase flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Cours du jour
              </span>
              <span className="text-blue-400 text-xs">→</span>
            </div>
            <h4 className="font-medium text-gray-800 text-xs md:text-sm line-clamp-1">
              {dailyContent.course.title}
            </h4>
            <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 mt-1">
              {dailyContent.course.description}
            </p>
          </div>
        )}

        {/* Problème du jour */}
        {dailyContent.problem && (
          <div 
            className="mb-3 md:mb-4 p-2 md:p-3 bg-white rounded-lg border border-orange-100 cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all"
            onClick={() => onNavigate('article', { type: 'problem', id: dailyContent.problem!.id })}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] md:text-xs font-semibold text-orange-600 uppercase flex items-center gap-1">
                <Puzzle className="w-3 h-3" />
                Défi du jour
              </span>
              <span className="text-orange-400 text-xs">→</span>
            </div>
            <h4 className="font-medium text-gray-800 text-xs md:text-sm line-clamp-1">
              {dailyContent.problem.title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full',
                dailyContent.problem.difficulty === 'Facile' && 'bg-green-100 text-green-700',
                dailyContent.problem.difficulty === 'Moyen' && 'bg-yellow-100 text-yellow-700',
                dailyContent.problem.difficulty === 'Difficile' && 'bg-red-100 text-red-700',
              )}>
                {dailyContent.problem.difficulty}
              </span>
              <span className="text-[10px] text-gray-500">{dailyContent.problem.category}</span>
            </div>
          </div>
        )}

        {/* Formule du jour */}
        {dailyContent.formula && (
          <div className="p-2 md:p-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] md:text-xs font-semibold text-blue-200 uppercase flex items-center gap-1">
                <Calculator className="w-3 h-3" />
                Formule du jour
              </span>
              <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
            </div>
            <div className="text-center py-1 md:py-2 overflow-hidden">
              <InlineFormula 
                tex={dailyContent.formula.tex} 
                className="text-sm md:text-base lg:text-lg"
              />
            </div>
            <p className="text-[10px] md:text-xs text-blue-200 text-center mt-1 font-medium">
              {dailyContent.formula.name}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wide border-b pb-2">
          Statistiques
        </h3>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-blue-50 rounded-lg text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{courses.length}</div>
            <div className="text-[10px] md:text-xs text-gray-600">Cours</div>
          </div>
          <div className="p-2 md:p-3 bg-green-50 rounded-lg text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{problems.length}</div>
            <div className="text-[10px] md:text-xs text-gray-600">Problèmes</div>
          </div>
          <div className="p-2 md:p-3 bg-purple-50 rounded-lg text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600">{formulas.length}</div>
            <div className="text-[10px] md:text-xs text-gray-600">Formules</div>
          </div>
          <div className="p-2 md:p-3 bg-orange-50 rounded-lg text-center">
            <div className="text-xl md:text-2xl font-bold text-orange-600">
              {courses.length + problems.length + formulas.length}
            </div>
            <div className="text-[10px] md:text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Catégories populaires */}
      {popularCategories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wide border-b pb-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
            Catégories Populaires
          </h3>
          <div className="space-y-2">
            {popularCategories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-gray-700 truncate mr-2">{category}</span>
                <span className="text-[10px] md:text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
