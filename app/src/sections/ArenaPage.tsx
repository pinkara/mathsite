import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle,
  Lock,
  Puzzle,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getWorldById,
  getArenaContents,
  getNextArenaThreshold,
  getArenaBadgeId,
  type WorldId,
} from '@/lib/worldsConfig';
import type { UserProfile, Course, Problem, Formula, ArenaContent } from '@/types';
import { ProblemCard } from '@/components/ProblemCard';
import { ContentGrid } from '@/components/ContentGrid';
import { cn } from '@/lib/utils';

interface ArenaPageProps {
  worldId: WorldId;
  arenaNumber: number;
  profile: UserProfile | null;
  courses: Course[];
  problems: Problem[];
  formulas: Formula[];
  arenaContents: ArenaContent[];
  onNavigate: (route: string, params?: any) => void;
}

export function ArenaPage({
  worldId,
  arenaNumber,
  profile,
  courses,
  problems,
  formulas,
  arenaContents,
  onNavigate,
}: ArenaPageProps) {
  const [activeTab, setActiveTab] = useState('problems');

  const world = useMemo(() => getWorldById(worldId), [worldId]);
  const arena = useMemo(
    () => world.arenas.find((a) => a.number === arenaNumber) || world.arenas[0],
    [world, arenaNumber]
  );

  const currentArenaNumber = profile?.currentArena[worldId] || 1;
  const isLocked = arenaNumber > currentArenaNumber;
  const isCompleted = arenaNumber < currentArenaNumber;
  const hasBadge = profile?.badges.includes(getArenaBadgeId(worldId, arenaNumber));

  const contents = useMemo(
    () => getArenaContents(worldId, arenaNumber, courses, problems, formulas, arenaContents),
    [worldId, arenaNumber, courses, problems, formulas, arenaContents]
  );

  const allProblemsCompleted =
    contents.problems.length > 0 &&
    contents.problems.every((p) => profile?.completedProblemIds.includes(p.id));

  const progressToNext = useMemo(() => {
    const next = getNextArenaThreshold(worldId, arenaNumber - 1);
    const prev = world.arenas[arenaNumber - 2]?.xpThreshold ?? 0;
    if (next === null) return 100;
    const xp = profile?.worldXp[worldId] || 0;
    return Math.min(100, Math.max(0, Math.round(((xp - prev) / (next - prev)) * 100)));
  }, [worldId, arenaNumber, world, profile]);

  const completedCourseIds = profile?.completedCourseIds || [];
  const completedProblemIds = profile?.completedProblemIds || [];

  const visibleCourses = useMemo(() => {
    const result: typeof contents.courses = [];
    for (let i = 0; i < contents.courses.length; i++) {
      if (i === 0 || completedCourseIds.includes(contents.courses[i - 1].id)) {
        result.push(contents.courses[i]);
      } else {
        break;
      }
    }
    return result;
  }, [contents.courses, completedCourseIds]);

  const visibleProblems = useMemo(() => {
    const result: typeof contents.problems = [];
    for (let i = 0; i < contents.problems.length; i++) {
      if (i === 0 || completedProblemIds.includes(contents.problems[i - 1].id)) {
        result.push(contents.problems[i]);
      } else {
        break;
      }
    }
    return result;
  }, [contents.problems, completedProblemIds]);

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
          <Lock className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Arène verrouillée</h2>
        <p className="text-gray-500 mt-3 max-w-md">
          Termine l’arène {arenaNumber - 1} du monde <span className="font-bold text-gray-700">{world.name}</span> pour débloquer celle-ci.
        </p>
        <Button className="mt-8" onClick={() => onNavigate('worlds')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux mondes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div
        className="rounded-3xl text-white shadow-2xl overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${world.color}, ${world.textColor})` }}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.35), transparent 25%), radial-gradient(circle at 20% 80%, rgba(0,0,0,0.08), transparent 25%)',
          }}
        />
        <div className="relative p-6 sm:p-10">
          <button
            onClick={() => onNavigate('worlds')}
            className="group flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Retour aux mondes
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider border border-white/30">
                  Arène {arena.number}
                </span>
                {hasBadge && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-300 text-amber-900 text-xs font-black">
                    <Trophy className="w-3.5 h-3.5" />
                    Badge
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-lg">
                {arena.name}
              </h1>
              <p className="text-white/90 mt-2 text-lg font-medium">{world.name}</p>
            </div>

            {isCompleted && (
              <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Terminée
              </div>
            )}
          </div>

          <div className="mt-8 max-w-xl">
            <div className="flex items-center justify-between text-sm font-bold mb-2">
              <span>Progression vers l’arène suivante</span>
              <span>{progressToNext}%</span>
            </div>
            <Progress value={progressToNext} className="h-3 bg-white/30" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md p-1 bg-gray-100/80">
          <TabsTrigger value="courses" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen className="w-4 h-4" />
            Cours
          </TabsTrigger>
          <TabsTrigger value="formulas" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Calculator className="w-4 h-4" />
            Formules
          </TabsTrigger>
          <TabsTrigger value="problems" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Puzzle className="w-4 h-4" />
            Problèmes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <ContentGrid
            items={visibleCourses}
            empty="Aucun cours dans cette arène pour l’instant."
            onClick={(course) => onNavigate('article', { type: 'course', id: course.id })}
            color={world.color}
            icon="course"
            completedIds={completedCourseIds}
          />
          {visibleCourses.length < contents.courses.length && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Termine le cours actuel pour débloquer le suivant.
            </p>
          )}
        </TabsContent>

        <TabsContent value="formulas" className="mt-6">
          <ContentGrid
            items={contents.formulas}
            empty="Aucune formule dans cette arène pour l’instant."
            onClick={(formula) => onNavigate('formulas', { highlightFormula: formula.code })}
            color={world.color}
            icon="formula"
            completedIds={completedCourseIds}
            renderPreview={(formula) => formula.tex}
          />
        </TabsContent>

        <TabsContent value="problems" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleProblems.map((problem, index) => {
              const completed = completedProblemIds.includes(problem.id);
              return (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  index={index + 1}
                  completed={completed}
                  onClick={() => onNavigate('article', { type: 'problem', id: problem.id })}
                />
              );
            })}
          </div>

          {visibleProblems.length < contents.problems.length && (
            <p className="text-center text-sm text-gray-500">
              Résous le problème actuel pour débloquer le suivant.
            </p>
          )}

          {contents.problems.length === 0 && (
            <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
              <p className="text-gray-500 font-medium">Aucun problème dans cette arène pour l’instant.</p>
            </div>
          )}

          {/* Bonus : verrouillé tant que tous les problèmes ne sont pas réussis */}
          {(
            contents.problems.length > 0 ||
            contents.bonusCourses.length > 0 ||
            contents.bonusProblems.length > 0
          ) && (
            <Card
              className={cn(
                'border-2 overflow-hidden',
                allProblemsCompleted
                  ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50'
                  : 'border-gray-300 bg-gray-50'
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle
                  className={cn(
                    'flex items-center gap-2',
                    allProblemsCompleted ? 'text-amber-800' : 'text-gray-600'
                  )}
                >
                  <Sparkles
                    className={cn('w-5 h-5', allProblemsCompleted ? 'text-amber-600' : 'text-gray-400')}
                  />
                  Contenu bonus de l’arène
                  {!allProblemsCompleted && <Lock className="w-4 h-4 ml-auto" />}
                </CardTitle>
                {!allProblemsCompleted && (
                  <p className="text-xs text-gray-500 mt-1">
                    Termine tous les problèmes de cette arène pour débloquer le contenu Olympiades & hors programme.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {contents.bonusCourses.map((course) => (
                  <button
                    key={course.id}
                    disabled={!allProblemsCompleted}
                    onClick={() => onNavigate('article', { type: 'course', id: course.id })}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all text-left',
                      allProblemsCompleted
                        ? 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-md'
                        : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                    )}
                  >
                    <span
                      className={cn('font-bold', allProblemsCompleted ? 'text-amber-900' : 'text-gray-500')}
                    >
                      {course.title}
                    </span>
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold">
                      Hors programme
                    </span>
                  </button>
                ))}
                {contents.bonusProblems.map((problem) => {
                  const matching = arenaContents.find(
                    (ac) => ac.contentType === 'problem' && ac.contentId === problem.id
                  );
                  const isOlympiad = !!matching?.isOlympiad;
                  const isBonus = !!matching?.isBonus;
                  return (
                    <ProblemCard
                      key={problem.id}
                      problem={problem}
                      index={0}
                      completed={profile?.completedProblemIds.includes(problem.id)}
                      onClick={() => onNavigate('article', { type: 'problem', id: problem.id })}
                      isOlympiad={isOlympiad}
                      isBonus={isBonus}
                      disabled={!allProblemsCompleted}
                    />
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
