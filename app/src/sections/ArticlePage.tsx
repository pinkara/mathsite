import { useState } from 'react';
import { ArrowLeft, Heart, ChevronUp, ChevronDown, Lightbulb, Calculator, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MathRenderer } from '@/components/MathRenderer';
import { LevelBadge, DifficultyBadge } from '@/components/LevelBadge';
import type { Course, Problem, Formula } from '@/types';

interface ArticlePageProps {
  type: 'course' | 'problem';
  id: string;
  courses: Course[];
  problems: Problem[];
  formulas: Formula[];
  isLiked: boolean;
  onToggleLike: () => void;
  onNavigate: (route: string, params?: any) => void;
}

export function ArticlePage({ 
  type, 
  id, 
  courses, 
  problems, 
  formulas,
  isLiked, 
  onToggleLike, 
  onNavigate 
}: ArticlePageProps) {
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [vote, setVote] = useState<'up' | 'down' | null>(null);

  // Récupérer l'article
  const article = type === 'course' 
    ? courses.find(c => c.id === id)
    : problems.find(p => p.id === id);

  if (!article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Article non trouvé</h2>
        <p className="text-gray-600 mb-4">L'article que vous recherchez n'existe pas.</p>
        <Button onClick={() => onNavigate('home')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const isCourse = type === 'course';
  const course = isCourse ? article as Course : null;
  const problem = !isCourse ? article as Problem : null;

  // Trouver les formules référencées
  const getFormulaByCode = (code: string) => {
    return formulas.find(f => f.code === code);
  };

  const toggleHint = (hintId: string) => {
    setRevealedHints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hintId)) {
        newSet.delete(hintId);
      } else {
        newSet.add(hintId);
      }
      return newSet;
    });
  };

  const handleVote = (direction: 'up' | 'down') => {
    setVote(prev => prev === direction ? null : direction);
  };

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button 
          onClick={() => onNavigate('home')}
          className="hover:text-blue-600 transition-colors"
        >
          Accueil
        </button>
        <span>/</span>
        <button 
          onClick={() => onNavigate(isCourse ? 'courses' : 'problems')}
          className="hover:text-blue-600 transition-colors"
        >
          {isCourse ? 'Cours' : 'Problèmes'}
        </button>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{article.category}</span>
      </nav>

      {/* Article Header */}
      <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <LevelBadge level={article.level} />
              {!isCourse && problem && (
                <DifficultyBadge difficulty={problem.difficulty} />
              )}
            </div>
            <div className="flex items-center gap-2">
              {isCourse && (
                <button
                  onClick={onToggleLike}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    isLiked 
                      ? 'bg-red-50 text-red-500' 
                      : 'bg-gray-100 text-gray-400 hover:text-red-400'
                  )}
                >
                  <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
                </button>
              )}
            </div>
          </div>

          <span 
            className="inline-block text-xs px-2 py-0.5 rounded-full mb-3"
            style={{ 
              backgroundColor: isCourse ? (course?.categoryColor || '#f0f9ff') : '#fff7ed',
              color: isCourse ? (course?.categoryTextColor || '#0284c7') : '#c2410c'
            }}
          >
            {article.category}
          </span>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {article.title}
          </h1>

          <p className="text-gray-600 text-lg">
            {article.description}
          </p>

          {isCourse && course?.date && (
            <p className="text-sm text-gray-400 mt-4">
              Publié le {course.date}
            </p>
          )}
        </div>

        {/* Image (si cours) */}
        {isCourse && course?.image && (
          <div className="w-full h-64 md:h-80 overflow-hidden">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 md:p-8">
          <MathRenderer 
            content={article.content}
            className="prose-lg"
          />
        </div>

        {/* Problem Hints */}
        {!isCourse && problem && problem.hints && problem.hints.length > 0 && (
          <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Indices & Solutions
            </h2>
            <div className="space-y-4">
              {problem.hints.map((hint, index) => (
                <div 
                  key={hint.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleHint(hint.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      Indice {index + 1}
                    </span>
                    {revealedHints.has(hint.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {revealedHints.has(hint.id) && (
                    <div className="p-4 border-t border-gray-100">
                      <MathRenderer content={hint.content} />
                      
                      {/* Formula References */}
                      {hint.formulaRefs && hint.formulaRefs.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                            <Calculator className="w-4 h-4" />
                            Formules référencées:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {hint.formulaRefs.map(code => {
                              const formula = getFormulaByCode(code);
                              return (
                                <button
                                  key={code}
                                  onClick={() => onNavigate('formulas')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                                >
                                  {code}
                                  {formula && (
                                    <span className="text-purple-500">- {formula.name}</span>
                                  )}
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voting (for problems) */}
        {!isCourse && (
          <div className="p-6 md:p-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-600">Ce problème vous a été utile ?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('up')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    vote === 'up'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400 hover:text-green-500'
                  )}
                >
                  <ChevronUp className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleVote('down')}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    vote === 'down'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-400 hover:text-red-500'
                  )}
                >
                  <ChevronDown className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </article>

      {/* Back Button */}
      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={() => onNavigate(isCourse ? 'courses' : 'problems')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux {isCourse ? 'cours' : 'problèmes'}
        </Button>
      </div>
    </div>
  );
}
