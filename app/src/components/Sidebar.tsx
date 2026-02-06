import { useEffect, useState, useRef } from 'react';
import { 
  BookOpen, 
  Puzzle, 
  Calculator, 
  Star,
  TrendingUp,
  Terminal,
  GraduationCap
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

// === TITLE WITH FORMULA COMPONENT ===
function TitleWithFormula({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]);
    }
  }, [text]);

  const hasLatex = text.includes('$');
  
  if (!hasLatex) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={containerRef} className={className}>
      {text}
    </span>
  );
}

interface SidebarProps {
  courses: Course[];
  problems: Problem[];
  formulas: Formula[];
  onNavigate: (route: string, params?: any) => void;
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
            href="https://github.com/pinkara/mathsite" 
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

      {/* À la une aujourd'hui */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 md:p-5">
        <h3 className="font-bold text-amber-800 mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wide border-b border-amber-200 pb-2 flex items-center gap-2">
          <Star className="w-3 h-3 md:w-4 md:h-4" />
          À la une aujourd'hui
        </h3>

        {/* Cours du jour */}
        {dailyContent.course && (
          <div 
            className="mb-3 md:mb-4 bg-white rounded-lg border border-blue-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden"
            onClick={() => onNavigate('article', { type: 'course', id: dailyContent.course!.id })}
          >
            {/* Image du cours */}
            {dailyContent.course.image ? (
              <div className="h-24 overflow-hidden">
                <img
                  src={dailyContent.course.image}
                  alt={dailyContent.course.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="h-16 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-300" />
              </div>
            )}
            <div className="p-2 md:p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] md:text-xs font-semibold text-blue-600 uppercase flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Cours à la une
                </span>
                <span className="text-blue-400 text-xs">→</span>
              </div>
              <h4 className="font-medium text-gray-800 text-xs md:text-sm line-clamp-1">
                <TitleWithFormula text={dailyContent.course.title} />
              </h4>
              <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 mt-1">
                {dailyContent.course.description}
              </p>
            </div>
          </div>
        )}

        {/* Problème du jour */}
        {dailyContent.problem && (
          <div 
            className="mb-3 md:mb-4 bg-white rounded-lg border border-orange-100 cursor-pointer hover:border-orange-300 hover:shadow-sm transition-all overflow-hidden"
            onClick={() => onNavigate('article', { type: 'problem', id: dailyContent.problem!.id })}
          >
            {/* Image du problème */}
            {dailyContent.problem.image ? (
              <div className="h-24 overflow-hidden">
                <img
                  src={dailyContent.problem.image}
                  alt={dailyContent.problem.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="h-16 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <Puzzle className="w-8 h-8 text-orange-300" />
              </div>
            )}
            <div className="p-2 md:p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] md:text-xs font-semibold text-orange-600 uppercase flex items-center gap-1">
                  <Puzzle className="w-3 h-3" />
                  Défi à la une
                </span>
                <span className="text-orange-400 text-xs">→</span>
              </div>
              <h4 className="font-medium text-gray-800 text-xs md:text-sm line-clamp-1">
                <TitleWithFormula text={dailyContent.problem.title} />
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
            <div className="text-[10px] md:text-xs text-blue-200 text-center mt-1 font-medium">
              <TitleWithFormula text={dailyContent.formula.name} />
            </div>
          </div>
        )}

        {/* Subjects Portal */}
        <div 
          className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all"
          onClick={() => onNavigate('subjects')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 text-sm">Portail des matières</h4>
              <p className="text-xs text-blue-600">Toutes les matières</p>
            </div>
          </div>
        </div>

        {/* IDE Quick Access */}
        <div 
          className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 cursor-pointer hover:border-indigo-400 hover:shadow-sm transition-all"
          onClick={() => onNavigate('ide')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Terminal className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-medium text-indigo-900 text-sm">IDE en ligne</h4>
              <p className="text-xs text-indigo-600">Python & JavaScript</p>
            </div>
          </div>
        </div>

        {/* PINKARIUM Quick Access */}
        <a 
          href="https://pinkara.github.io/PINKARIUM/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200 cursor-pointer hover:border-pink-400 hover:shadow-sm transition-all block"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="https://raw.githubusercontent.com/pinkara/mathsite/refs/heads/master/app/public/PINKARIUM_logo.png" 
                alt="PINKARIUM"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  // Fallback si l'image n'est pas trouvée
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-pink-600"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
                  }
                }}
              />
            </div>
            <div>
              <h4 className="font-medium text-pink-900 text-sm">PINKARIUM</h4>
              <p className="text-xs text-pink-600">Découvertes intéractives</p>
            </div>
          </div>
        </a>
      </div>

      {/* Derniers cours ajoutés */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wide border-b pb-2 flex items-center gap-2">
            <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
            Derniers cours ajoutés
          </h3>
          <div className="space-y-3">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id}
                className="flex gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                onClick={() => onNavigate('article', { type: 'course', id: course.id })}
              >
                {/* Miniature */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-blue-100">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-300" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-xs md:text-sm line-clamp-1">
                    <TitleWithFormula text={course.title} />
                  </h4>
                  <span className="text-[10px] text-blue-600">{course.category}</span>
                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                    {course.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Derniers problèmes ajoutés */}
      {problems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3 md:mb-4 text-xs md:text-sm uppercase tracking-wide border-b pb-2 flex items-center gap-2">
            <Puzzle className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
            Derniers problèmes ajoutés
          </h3>
          <div className="space-y-3">
            {problems.slice(0, 3).map((problem) => (
              <div
                key={problem.id}
                className="flex gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors"
                onClick={() => onNavigate('article', { type: 'problem', id: problem.id })}
              >
                {/* Miniature */}
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-orange-100">
                  {problem.image ? (
                    <img
                      src={problem.image}
                      alt={problem.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Puzzle className="w-6 h-6 text-orange-300" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-xs md:text-sm line-clamp-1">
                    <TitleWithFormula text={problem.title} />
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={cn(
                      'text-[10px] px-1 py-0.5 rounded-full',
                      problem.difficulty === 'Facile' && 'bg-green-100 text-green-700',
                      problem.difficulty === 'Moyen' && 'bg-yellow-100 text-yellow-700',
                      problem.difficulty === 'Difficile' && 'bg-red-100 text-red-700',
                    )}>
                      {problem.difficulty}
                    </span>
                    <span className="text-[10px] text-gray-400">{problem.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
