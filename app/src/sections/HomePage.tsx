import { useEffect, useState, useRef } from 'react';
import { BookOpen, Puzzle, Calculator, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LevelBadge, DifficultyBadge } from '@/components/LevelBadge';
import { AnkiHelpDialog } from '@/components/AnkiHelpDialog';
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

// === TITLE WITH FORMULA ===
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

interface HomePageProps {
  courses: Course[];
  problems: Problem[];
  formulas: Formula[];
  isAdmin: boolean;
  onNavigate: (route: string, params?: any) => void;
}

export function HomePage({ courses, problems, formulas, isAdmin, onNavigate }: HomePageProps) {
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

  // Derniers contenus ajoutés
  const recentCourses = [...courses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 3);

  const recentProblems = [...problems].sort((a, b) => 
    new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
  ).slice(0, 3);

  return (
    <div className="space-y-8 md:space-y-10 animate-fade-in">
      {/* Hero Section - Responsive */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
            <span className="text-xs md:text-sm font-medium text-blue-100">Bienvenue sur</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-3 md:mb-4">
            MathUnivers
          </h1>
          <p className="text-sm md:text-base lg:text-lg text-blue-100 max-w-2xl mb-6 md:mb-8">
            La référence quotidienne pour les étudiants et passionnés de mathématiques. 
            Découvrez des cours, problèmes et formules pour tous les niveaux.
          </p>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Button 
              onClick={() => onNavigate('courses')}
              className="bg-white text-blue-600 hover:bg-blue-50 text-sm md:text-base"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Explorer les cours
            </Button>
            <Button 
              onClick={() => onNavigate('problems')}
              variant="outline"
              className="border-white text-white hover:bg-white/10 text-sm md:text-base"
            >
              <Puzzle className="w-4 h-4 mr-2" />
              Voir les problèmes
            </Button>
            {isAdmin && (
              <Button 
                onClick={() => onNavigate('admin')}
                className="bg-yellow-500 hover:bg-yellow-600 text-sm md:text-base"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Panel Admin
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Contenu du Jour - Responsive */}
      <section>
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
          <span className="w-1 h-5 md:h-6 bg-blue-600 rounded-full"></span>
          À la une aujourd'hui
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Cours du jour */}
          {dailyContent.course && (
            <div 
              className="group bg-white rounded-xl border-2 border-blue-200 p-4 md:p-6 cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all"
              onClick={() => onNavigate('article', { type: 'course', id: dailyContent.course!.id })}
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <span className="bg-blue-600 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  COURS DU JOUR
                </span>
                <LevelBadge level={dailyContent.course.level} size="sm" />
              </div>
              {dailyContent.course.image && (
                <div className="h-32 md:h-40 mb-3 md:mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={dailyContent.course.image} 
                    alt={dailyContent.course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="text-[10px] md:text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: dailyContent.course.categoryColor || '#f0f9ff',
                    color: dailyContent.course.categoryTextColor || '#0284c7'
                  }}
                >
                  {dailyContent.course.category}
                </span>
              </div>
              <h3 className="text-base md:text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                <TitleWithFormula text={dailyContent.course.title} />
              </h3>
              <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3 md:mb-4">
                {dailyContent.course.description}
              </p>
              <div className="flex items-center text-blue-600 text-xs md:text-sm font-medium">
                <span>Lire le cours</span>
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Problème du jour */}
          {dailyContent.problem && (
            <div 
              className="group bg-white rounded-xl border-2 border-orange-200 overflow-hidden cursor-pointer hover:border-orange-400 hover:shadow-lg transition-all"
              onClick={() => onNavigate('article', { type: 'problem', id: dailyContent.problem!.id })}
            >
              {/* Image du problème */}
              {dailyContent.problem.image ? (
                <div className="h-32 md:h-40 overflow-hidden">
                  <img 
                    src={dailyContent.problem.image} 
                    alt={dailyContent.problem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="h-32 md:h-40 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                  <Puzzle className="w-16 h-16 text-orange-300" />
                </div>
              )}
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <span className="bg-orange-600 text-white text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    DÉFI DU JOUR
                  </span>
                  <LevelBadge level={dailyContent.problem.level} size="sm" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] md:text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {dailyContent.problem.category}
                  </span>
                  <DifficultyBadge difficulty={dailyContent.problem.difficulty} size="sm" />
                </div>
                <h3 className="text-base md:text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                  <TitleWithFormula text={dailyContent.problem.title} />
                </h3>
                <p className="text-xs md:text-sm text-gray-600 line-clamp-2 mb-3 md:mb-4">
                  {dailyContent.problem.description}
                </p>
                <div className="flex items-center text-orange-600 text-xs md:text-sm font-medium">
                  <span>Relever le défi</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Derniers Cours - Responsive */}
      {recentCourses.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 md:h-6 bg-green-500 rounded-full"></span>
              Derniers cours ajoutés
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('courses')}
              className="text-blue-600 hover:text-blue-800 text-xs md:text-sm"
            >
              Voir tout <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {recentCourses.map(course => (
              <div 
                key={course.id}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                onClick={() => onNavigate('article', { type: 'course', id: course.id })}
              >
                {/* Image du cours */}
                {course.image ? (
                  <div className="h-32 md:h-36 overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-32 md:h-36 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-blue-300" />
                  </div>
                )}
                <div className="p-3 md:p-4">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <LevelBadge level={course.level} size="sm" />
                    <span className="text-[10px] md:text-xs text-gray-400">{course.date}</span>
                  </div>
                  <span 
                    className="text-[10px] md:text-xs px-2 py-0.5 rounded-full mb-1 md:mb-2 inline-block"
                    style={{ 
                      backgroundColor: course.categoryColor || '#f0f9ff',
                      color: course.categoryTextColor || '#0284c7'
                    }}
                  >
                    {course.category}
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                    <TitleWithFormula text={course.title} />
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Derniers Problèmes - Responsive */}
      {recentProblems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-5 md:h-6 bg-orange-500 rounded-full"></span>
              Derniers problèmes ajoutés
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('problems')}
              className="text-blue-600 hover:text-blue-800 text-xs md:text-sm"
            >
              Voir tout <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {recentProblems.map(problem => (
              <div 
                key={problem.id}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
                onClick={() => onNavigate('article', { type: 'problem', id: problem.id })}
              >
                {/* Image du problème */}
                {problem.image ? (
                  <div className="h-32 md:h-36 overflow-hidden">
                    <img 
                      src={problem.image} 
                      alt={problem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-32 md:h-36 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                    <Puzzle className="w-12 h-12 text-orange-300" />
                  </div>
                )}
                <div className="p-3 md:p-4">
                  <div className="flex items-start justify-between mb-2 md:mb-3">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <LevelBadge level={problem.level} size="sm" />
                      <DifficultyBadge difficulty={problem.difficulty} size="sm" />
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mb-1 md:mb-2 inline-block">
                    {problem.category}
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                    <TitleWithFormula text={problem.title} />
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                    {problem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formule du jour - Responsive */}
      {dailyContent.formula && (
        <section className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl p-4 md:p-6 text-white">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Calculator className="w-4 h-4 md:w-5 md:h-5 text-indigo-300" />
            <span className="text-xs md:text-sm font-medium text-indigo-200">Formule du jour</span>
          </div>
          <div className="text-center py-4 md:py-6">
            <div className="text-xl md:text-2xl lg:text-3xl mb-2 md:mb-3 overflow-x-auto">
              <InlineFormula tex={dailyContent.formula.tex} />
            </div>
            <div className="text-indigo-200 font-medium text-sm md:text-base">
              <TitleWithFormula text={dailyContent.formula.name} />
            </div>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={() => onNavigate('formulas')}
              variant="outline"
              className="border-indigo-400 text-indigo-100 hover:bg-indigo-800 text-xs md:text-sm"
            >
              Voir toutes les formules
            </Button>
          </div>
        </section>
      )}

      {/* Anki Help Button */}
      <AnkiHelpDialog />
    </div>
  );
}
