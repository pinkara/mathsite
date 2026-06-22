import { useMemo, useState } from 'react';
import { Gift, Coins, Star, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { openCardPack, RARITY_LABELS } from '@/lib/mathematiciansParser';
import { RARITY_COLORS, type MathematicianCard } from '@/types';
import { TradingCard } from './TradingCard';

interface ChestRewardProps {
  chestCount: number;
  onOpen: (bonusXp: number) => void;
}

const RARITY_GLOW: Record<MathematicianCard['rarity'], string> = {
  common: 'from-gray-200/40 to-gray-400/40',
  rare: 'from-blue-200/50 to-blue-500/50',
  epic: 'from-purple-200/50 to-fuchsia-500/50',
  legendary: 'from-amber-200/60 to-yellow-500/60',
};

export function ChestReward({ chestCount, onOpen }: ChestRewardProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [rewardXp, setRewardXp] = useState<number | null>(null);
  const [rewardCard, setRewardCard] = useState<MathematicianCard | null>(null);

  const handleOpen = () => {
    if (chestCount <= 0 || isOpening) return;
    setIsOpening(true);
    setShowReveal(false);
    setRewardXp(null);
    setRewardCard(null);

    setTimeout(() => {
      const bonusXp = Math.floor(Math.random() * 41) + 10; // 10-50 XP
      const card = openCardPack();
      onOpen(bonusXp);
      setRewardXp(bonusXp);
      setRewardCard(card);
      setIsOpening(false);
      setShowReveal(true);
    }, 2200);
  };

  const closeReveal = () => {
    setShowReveal(false);
    setRewardCard(null);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Gift className="w-6 h-6 text-amber-600" />
          <h3 className="text-lg font-bold text-gray-900">Booster MathUnivers</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Tu as <strong>{chestCount}</strong> booster{chestCount > 1 ? 's' : ''} en attente.
        </p>

        <button
          onClick={handleOpen}
          disabled={chestCount <= 0 || isOpening}
          className={cn(
            'relative w-24 h-24 mx-auto rounded-2xl flex items-center justify-center transition-transform border-4 border-amber-300 shadow-lg',
            chestCount > 0 && !isOpening && 'hover:scale-105 active:scale-95 cursor-pointer',
            isOpening && 'animate-chest-shake',
            chestCount <= 0 && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            boxShadow: isOpening ? '0 0 40px 10px rgba(251, 191, 36, 0.5)' : undefined,
          }}
        >
          <Gift className="w-12 h-12 text-white" />
          {chestCount > 0 && (
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {chestCount}
            </span>
          )}
        </button>

        {isOpening && (
          <p className="mt-4 text-sm font-black uppercase tracking-wide text-amber-700 animate-pulse">
            Ouverture en cours...
          </p>
        )}

        <Button
          onClick={handleOpen}
          disabled={chestCount <= 0 || isOpening}
          className="mt-5 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-black"
        >
          {isOpening ? 'Ouverture...' : 'Ouvrir un booster'}
        </Button>
      </div>

      {/* Full-screen reveal overlay */}
      {showReveal && rewardCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeReveal}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-sm text-center">
            <button
              onClick={closeReveal}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glow background */}
            <div
              className={cn(
                'absolute inset-0 -m-20 rounded-full blur-3xl opacity-60 animate-glow-pulse bg-gradient-to-r',
                RARITY_GLOW[rewardCard.rarity]
              )}
            />

            {/* Particles */}
            <Particles />

            {/* Card */}
            <div className="relative animate-card-appear mx-auto w-64 sm:w-72">
              <TradingCard card={rewardCard} collected interactive={false} variant="grid" />
            </div>

            {/* Rarity badge */}
            <div
              className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full border-2 font-black text-sm uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{
                backgroundColor: RARITY_COLORS[rewardCard.rarity].bg,
                borderColor: RARITY_COLORS[rewardCard.rarity].border,
                color: RARITY_COLORS[rewardCard.rarity].text,
              }}
            >
              <Sparkles className="w-4 h-4" />
              {RARITY_LABELS[rewardCard.rarity]}
            </div>

            <h3 className="mt-3 text-2xl font-black text-white drop-shadow-lg animate-in fade-in zoom-in duration-700">
              {rewardCard.name}
            </h3>

            <div className="mt-4 flex items-center justify-center gap-4 text-sm font-black animate-in fade-in duration-1000">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                <Star className="w-4 h-4" />
                +{rewardXp} XP
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Coins className="w-4 h-4" />
                +MathCoins
              </span>
            </div>

            <Button
              onClick={closeReveal}
              className="mt-8 px-8 py-2 rounded-full font-black bg-white text-gray-900 hover:bg-gray-100"
            >
              Super !
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function Particles() {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      angle: (i / 24) * 360,
      distance: 80 + Math.random() * 80,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.3,
      color: ['#fbbf24', '#f59e0b', '#fcd34d', '#ffffff'][Math.floor(Math.random() * 4)],
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance;
        return (
          <div
            key={p.id}
            className="absolute left-1/2 top-1/2 animate-particle-float rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              animationDelay: `${p.delay}s`,
              '--tw-translate-x': `${tx}px`,
              '--tw-translate-y': `${ty}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}
