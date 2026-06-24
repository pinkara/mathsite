import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BrainCircuit,
  Dices,
  Hash,
  Map,
  SquareFunction,
  TrendingUp,
  Triangle,
  Unlock,
  Lock,
  Sparkles,
  Coins,
  ChevronDown,
  ChevronUp,
  Target,
  Star,
  Globe,
  Calculator,
  GitBranch,
  Rocket,
  Banknote,
  Minimize2,
  BarChart3,
  Radio,
  Network,
  Share2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  WORLDS,
  getAuraForHighestArena,
  getNextArenaThreshold,
  getStartingArena,
  CURRENCY_SYMBOL,
  type WorldId,
} from '@/lib/worldsConfig';
import { type UserProfile } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  SquareFunction,
  Triangle,
  TrendingUp,
  Dices,
  Hash,
  BrainCircuit,
  Globe,
  Calculator,
  GitBranch,
  Rocket,
  Banknote,
  Minimize2,
  BarChart3,
  Radio,
  Network,
  Share2,
};

const ARENA_EMOJIS = ['🌱', '⚔️', '🛡️', '🏹', '🧙', '🏰', '👑', '🐉', '⭐', '🏆'];

interface WorldsMapPageProps {
  profile: UserProfile | null;
  onSelectArena?: (worldId: WorldId, arenaNumber: number) => void;
}

export function WorldsMapPage({ profile, onSelectArena }: WorldsMapPageProps) {
  const [expandedWorlds, setExpandedWorlds] = useState<Record<WorldId, boolean>>({
    algebra: true,
    analysis: false,
    arithmetic: false,
    combinatorics: false,
    geometry: false,
    logic: false,
    'financial-mathematics': false,
    optimization: false,
    probability: false,
    statistics: false,
    'information-theory': false,
    'category-theory': false,
    'graph-theory': false,
    'number-theory': false,
    topology: false,
  });

  const aura = useMemo(
    () => (profile ? getAuraForHighestArena(profile.highestArena || 1) : null),
    [profile]
  );

  const schoolLevel = profile?.level ?? '6e';

  const toggleWorld = (worldId: WorldId) => {
    setExpandedWorlds((prev) => ({ ...prev, [worldId]: !prev[worldId] }));
  };

  if (!profile) {
    return (
      <div className="text-center py-20">
        <Map className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Carte des mondes</h2>
        <p className="text-gray-500 mt-2">Crée ton profil pour explorer les mondes mathématiques.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bannière gaming */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, white 2px, transparent 2.5px), radial-gradient(circle at 80% 70%, white 1.5px, transparent 2px)',
          backgroundSize: '40px 40px, 24px 24px'
        }} />
        <div className="relative p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center shadow-lg">
            <Map className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-lg">
              Carte des Mondes
            </h1>
            <p className="text-white/90 mt-2 text-lg">
              Tous les mondes sont ouverts ! Avance où tu veux, quand tu veux.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-[160px]">
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 font-bold">
              <Coins className="w-5 h-5 text-amber-300" />
              <span>{profile.currency || 0} {CURRENCY_SYMBOL}</span>
            </div>
            {aura && aura.id !== 'none' && (
              <div className={cn('flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold border bg-gradient-to-r', aura.gradient, 'border-white/30')}>
                <Sparkles className="w-5 h-5" />
                <span>{aura.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickStat icon={Star} label="Arène max" value={profile.highestArena || 1} color="amber" />
        <QuickStat icon={Star} label="Auras" value={aura?.name ?? 'Aucune'} color="purple" isText />
        <QuickStat icon={Target} label="Mondes" value={WORLDS.length} color="emerald" />
        <QuickStat icon={Coins} label="MathCoins" value={profile.currency || 0} color="yellow" />
      </div>

      {/* Grille des mondes */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
        {WORLDS.map((world) => {
          const Icon = ICONS[world.icon] || SquareFunction;
          const worldXp = profile.worldXp[world.id] || 0;
          const rawArena = profile.currentArena[world.id];
          const currentArenaNumber = rawArena === undefined ? getStartingArena(schoolLevel, world.id) : rawArena;
          const isLocked = currentArenaNumber === 0;
          const currentArena = world.arenas.find((a) => a.number === currentArenaNumber) || world.arenas[0];
          const nextThreshold = isLocked ? null : getNextArenaThreshold(world.id, currentArenaNumber);
          const prevThreshold = currentArena.xpThreshold;
          const progress =
            isLocked || nextThreshold === null
              ? isLocked ? 0 : 100
              : Math.min(
                  100,
                  Math.max(0, Math.round(((worldXp - prevThreshold) / (nextThreshold - prevThreshold)) * 100))
                );
          const isExpanded = expandedWorlds[world.id];
          const nextArena = isLocked ? null : world.arenas.find((a) => a.number === currentArenaNumber + 1);
          const requiredLevel = world.minLevel;

          return (
            <Card
              key={world.id}
              className={cn(
                'overflow-hidden border-4 flex flex-col transition-transform hover:-translate-y-1',
                isExpanded ? 'border-opacity-100' : 'border-opacity-60'
              )}
              style={{ borderColor: world.color, backgroundColor: world.bgColor }}
            >
              <CardHeader
                className="p-5 cursor-pointer select-none text-white"
                style={{ background: `linear-gradient(135deg, ${world.color}, ${world.textColor})` }}
                onClick={() => toggleWorld(world.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-white drop-shadow-md">{world.name}</CardTitle>
                      <p className="text-white/90 text-sm font-bold">
                        {isLocked ? (
                          <span className="flex items-center gap-1">
                            🔒 Verrouillé jusqu’au niveau {requiredLevel}
                          </span>
                        ) : (
                          <>Arène {currentArena.number} • {worldXp} XP</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-5 flex-1 flex flex-col">
                {/* Barre de progression gaming */}
                {!isLocked && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-gray-800 flex items-center gap-2">
                        <Star className="w-4 h-4" style={{ color: world.color }} />
                        {currentArena.name}
                      </span>
                      <span className="text-gray-600">
                        {worldXp} / {nextThreshold ?? currentArena.xpThreshold} XP
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-inner">
                      <div
                        className="h-full transition-all duration-700 ease-out rounded-full"
                        style={{
                          width: `${progress}%`,
                          background: `linear-gradient(90deg, ${world.color}, ${world.textColor})`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isLocked && (
                  <div className="py-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200/80 text-gray-600 text-sm font-bold">
                      <Lock className="w-4 h-4" />
                      Débloque ce monde en atteignant le niveau {requiredLevel}
                    </div>
                  </div>
                )}

                {isExpanded && !isLocked && (
                  <>
                    {/* Chemin d'arènes façon Mario */}
                    <ScrollArea className="h-56 -mx-2 px-2">
                      <div className="grid grid-cols-5 gap-3 p-2">
                        {world.arenas.map((arena) => {
                          const reached = currentArenaNumber >= arena.number;
                          const isCurrent = currentArenaNumber === arena.number;
                          const emoji = ARENA_EMOJIS[Math.min(arena.number - 1, ARENA_EMOJIS.length - 1)];
                          return (
                            <div
                              key={arena.id}
                              onClick={() => onSelectArena?.(world.id, arena.number)}
                              className={cn(
                                'relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-center text-xs font-black transition-all cursor-pointer',
                                isCurrent
                                  ? 'bg-white border-amber-400 shadow-lg scale-110 ring-4 ring-amber-200 animate-pulse'
                                  : reached
                                    ? 'bg-white/70 border-gray-300 shadow-sm hover:scale-105'
                                    : 'bg-gray-100/50 border-gray-200 text-gray-400 grayscale hover:grayscale-0 hover:scale-105'
                              )}
                            >
                              <span className="text-lg leading-none mb-1">{emoji}</span>
                              <span className="text-[10px]">{arena.number}</span>
                              {reached && !isCurrent && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center">
                                  <Unlock className="w-2.5 h-2.5" />
                                </div>
                              )}
                              {isCurrent && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] whitespace-nowrap">
                                  ICI
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    {nextArena && (
                      <div className="pt-3 border-t-2 border-dashed border-gray-300">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="text-sm">
                            <span className="font-bold text-gray-800">Prochaine arène :</span>{' '}
                            <span className="font-black" style={{ color: world.color }}>{nextArena.name}</span>
                          </div>
                          <div className="text-xs text-gray-500 text-center sm:text-left">
                            Débloquée en terminant tous les problèmes de l’arène actuelle.
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
  isText,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  isText?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div className={cn('rounded-2xl border-2 p-4 flex items-center gap-3 shadow-sm', colorClasses[color])}>
      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-bold opacity-80 uppercase tracking-wide">{label}</p>
        <p className={cn('font-black', isText ? 'text-sm' : 'text-xl')}>{value}</p>
      </div>
    </div>
  );
}
