import { useMemo } from 'react';
import { Award, RotateCcw, Star, Target, User, Coins, Sparkles, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeGrid } from '@/components/BadgeGrid';
import { ChestReward } from '@/components/ChestReward';
import { StreakBadge } from '@/components/StreakBadge';
import { XPBar } from '@/components/XPBar';
import { ActivityCalendar } from '@/components/ActivityCalendar';
import { getLevelConfig, type UserProfile, type Level, LEVELS, getUserLevel } from '@/types';
import { getAuraForHighestArena, CURRENCY_NAME, CURRENCY_SYMBOL } from '@/lib/worldsConfig';

interface ProfilePageProps {
  profile: UserProfile | null;
  onReset: () => void;
  onOpenChest: (bonusXp: number) => void;
  onNavigate?: (route: string, params?: any) => void;
  onSetLevel?: (level: Level) => void;
}

export function ProfilePage({ profile, onReset, onOpenChest, onNavigate, onSetLevel }: ProfilePageProps) {
  const levelConfig = useMemo(
    () => (profile ? getLevelConfig(profile.level) : getLevelConfig('Term')),
    [profile]
  );

  const aura = useMemo(() => (profile ? getAuraForHighestArena(profile.highestArena || 1) : null), [profile]);

  const accountLevel = profile ? getUserLevel(profile.xp) : 1;

  const collectedCards = useMemo(() => {
    if (!profile) return 0;
    return Object.keys(profile.cardCollection || {}).length;
  }, [profile]);

  if (!profile) {
    return (
      <div className="text-center py-20">
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Profil non créé</h2>
        <p className="text-gray-500 mt-2">Crée ton compte élève pour voir tes stats ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header card */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${levelConfig.gradient} text-white flex items-center justify-center text-4xl font-bold shadow-xl shrink-0 ring-4 ${aura?.ring ?? 'ring-white'}`}
            >
              {aura && aura.id !== 'none' && (
                <Sparkles className={`absolute top-2 right-2 w-5 h-5 text-white drop-shadow`} />
              )}
              {profile.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.name}</h1>
                <StreakBadge streak={profile.streak} />
              </div>

              <p className="text-gray-500 mt-1">
                Niveau scolaire : <span className="font-medium text-gray-700">{levelConfig.label}</span>
              </p>
              <p className="text-gray-500 mt-1">
                Niveau du compte : <span className="font-bold text-purple-600">{accountLevel}</span>
              </p>

              {onSetLevel && (
                <div className="mt-2 flex items-center gap-2 justify-center sm:justify-start">
                  <label htmlFor="level-select" className="text-sm text-gray-500">Modifier :</label>
                  <select
                    id="level-select"
                    value={profile.level}
                    onChange={(e) => onSetLevel(e.target.value as Level)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {LEVELS.map((l) => (
                      <option key={l.name} value={l.name}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 justify-center sm:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold">
                  <Star className="w-5 h-5" />
                  <span>Niveau {accountLevel}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 font-bold">
                  <Target className="w-5 h-5" />
                  <span>{profile.xp} XP</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 font-bold">
                  <Award className="w-5 h-5" />
                  <span>{profile.badges.length} badge{profile.badges.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 font-bold">
                  <Coins className="w-5 h-5" />
                  <span>
                    {profile.currency || 0} {CURRENCY_SYMBOL} {CURRENCY_NAME}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold">
                  <Sparkles className="w-5 h-5" />
                  <span>Arène max {profile.highestArena || 1}</span>
                </div>
              </div>

              <div className="mt-5 max-w-md mx-auto sm:mx-0">
                <XPBar xp={profile.xp} size="md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Calendrier d’activité</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityCalendar dailyActivity={profile.dailyActivity} />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <ChestReward chestCount={profile.chestCount} onOpen={onOpenChest} />

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => onNavigate?.('collection')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                  <LayoutGrid className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-white/80 text-sm font-bold">Collection MathUnivers</p>
                  <p className="text-2xl font-black">{collectedCards} cartes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mes badges</CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeGrid unlocked={profile.badges} />
        </CardContent>
      </Card>

      {/* Reset */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onReset} className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser ma progression
        </Button>
      </div>
    </div>
  );
}
