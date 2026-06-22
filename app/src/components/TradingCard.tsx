import { useMemo } from 'react';
import { HelpCircle, Sparkles, Crown, Gem, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MathematicianCard, CardRarity } from '@/types';
import { RARITY_COLORS } from '@/types';
import { RARITY_LABELS } from '@/lib/mathematiciansParser';

export type TradingCardVariant = 'grid' | 'detail';

interface TradingCardProps {
  card: MathematicianCard;
  collected?: boolean;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
  variant?: TradingCardVariant;
}

const RARITY_ICONS: Record<CardRarity, typeof Star> = {
  common: Star,
  rare: Gem,
  epic: Sparkles,
  legendary: Crown,
};

export function TradingCard({
  card,
  collected = false,
  onClick,
  className,
  interactive = true,
  variant = 'grid',
}: TradingCardProps) {
  const colors = RARITY_COLORS[card.rarity];
  const RarityIcon = RARITY_ICONS[card.rarity];
  const isFullCard = collected && card.imageUrl?.startsWith('/image_card/');

  const initials = useMemo(() => {
    return card.name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }, [card.name]);

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'relative group select-none',
        'w-full rounded-2xl',
        variant === 'grid' && 'aspect-[2/3]',
        'transition-all duration-300 ease-out',
        interactive && 'cursor-pointer hover:-translate-y-2 hover:scale-[1.03]',
        interactive && [
          'hover:shadow-2xl',
          card.rarity === 'common' && 'hover:shadow-gray-400/40',
          card.rarity === 'rare' && 'hover:shadow-blue-400/50',
          card.rarity === 'epic' && 'hover:shadow-purple-400/50',
          card.rarity === 'legendary' && 'hover:shadow-amber-400/60',
        ],
        className
      )}
      style={{ perspective: '1000px' }}
    >
      {isFullCard ? (
        <FullCardImage card={card} colors={colors} variant={variant} />
      ) : (
        <>
      {/* Outer metallic frame */}
      <div
        className={cn(
          'absolute -inset-1 rounded-2xl opacity-60 blur-sm',
          collected && card.rarity === 'legendary' && 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600',
          collected && card.rarity === 'epic' && 'bg-gradient-to-br from-purple-300 via-fuchsia-500 to-purple-600',
          collected && card.rarity === 'rare' && 'bg-gradient-to-br from-blue-300 via-cyan-400 to-blue-500',
          collected && card.rarity === 'common' && 'bg-gray-400',
          !collected && 'bg-gray-600'
        )}
      />

      {/* Inner card face */}
      <div
        className={cn(
          'relative w-full h-full rounded-2xl overflow-hidden',
          'border-[5px]',
          'flex flex-col',
          'shadow-xl',
          !collected && 'opacity-95'
        )}
        style={{
          borderColor: colors.border,
          background: collected
            ? `linear-gradient(145deg, ${colors.bg} 0%, #ffffff 50%, ${colors.bg} 100%)`
            : 'linear-gradient(145deg, #4b5563, #1f2937)',
        }}
      >
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0%, transparent 20%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.05) 0%, transparent 25%)',
          }}
        />

        {/* Holographic overlay for rare+ */}
        {collected && card.rarity !== 'common' && (
          <div
            className={cn(
              'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10',
              'bg-gradient-to-tr from-transparent via-white/25 to-transparent',
              card.rarity === 'legendary' && 'bg-gradient-to-tr from-amber-200/10 via-white/35 to-amber-400/10'
            )}
          />
        )}

        {/* Top header */}
        <div
          className="relative flex items-center justify-between px-3 py-2 border-b-2 shrink-0 z-20"
          style={{ borderColor: colors.border }}
        >
          <span
            className="text-[10px] font-black uppercase tracking-wider"
            style={{ color: colors.text }}
          >
            {RARITY_LABELS[card.rarity]}
          </span>
          <RarityIcon
            className="w-4 h-4"
            style={{ color: colors.text }}
            fill={colors.text}
          />
        </div>

        {/* Portrait frame */}
        <div className="flex-1 p-3 min-h-0 z-20">
          <div
            className={cn(
              'relative w-full h-full rounded-xl overflow-hidden',
              'border-[3px] shadow-inner',
              collected ? 'bg-white' : 'bg-gray-800'
            )}
            style={{ borderColor: colors.border }}
          >
            {collected ? (
              <>
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center',
                    card.imageUrl ? 'opacity-0' : 'opacity-100'
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${colors.bg}, ${colors.border})`,
                  }}
                >
                  <span
                    className="text-5xl font-black drop-shadow-md"
                    style={{ color: colors.text }}
                  >
                    {initials}
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-400">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 8px, #ffffff 8px, #ffffff 16px)',
                  }}
                />
                <div
                  className="w-16 h-16 rounded-full border-4 border-gray-600 flex items-center justify-center mb-3"
                >
                  <HelpCircle className="w-8 h-8 text-gray-500" />
                </div>
                <span className="text-xl font-black tracking-widest text-gray-500">???</span>
              </div>
            )}
          </div>
        </div>

        {/* Name banner */}
        <div
          className="relative px-3 py-2 border-t-2 shrink-0 z-20"
          style={{ borderColor: colors.border }}
        >
          <p
            className={cn(
              'text-center text-sm font-black leading-tight line-clamp-2',
              collected ? '' : 'text-gray-400'
            )}
            style={{ color: collected ? colors.text : undefined }}
          >
            {collected ? card.name : 'Mathématicien mystère'}
          </p>
        </div>
      </div>

      {/* Legendary shine effect */}
      {collected && card.rarity === 'legendary' && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden z-30"
          aria-hidden="true"
        >
          <div
            className="absolute -inset-[200%] animate-shine"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 45%, rgba(255,223,128,0.45) 50%, rgba(255,255,255,0.35) 55%, transparent 60%)',
            }}
          />
        </div>
      )}
        </>
      )}
    </div>
  );
}

function FullCardImage({
  card,
  colors,
  variant,
}: {
  card: MathematicianCard;
  colors: (typeof RARITY_COLORS)['common'];
  variant: TradingCardVariant;
}) {
  return (
    <>
      <div
        className="absolute -inset-1 rounded-2xl opacity-70 blur-sm"
        style={{
          background:
            card.rarity === 'legendary'
              ? 'linear-gradient(135deg, #fbbf24, #f59e0b, #fcd34d)'
              : card.rarity === 'epic'
              ? 'linear-gradient(135deg, #c084fc, #a855f7, #e879f9)'
              : card.rarity === 'rare'
              ? 'linear-gradient(135deg, #60a5fa, #3b82f6, #22d3ee)'
              : '#9ca3af',
        }}
      />
      <div
        className={cn(
          'relative w-full rounded-2xl overflow-hidden border-[5px] shadow-2xl',
          'transition-transform duration-300',
          variant === 'grid' ? 'h-full bg-slate-900' : 'h-auto'
        )}
        style={{ borderColor: colors.border }}
      >
        <img
          src={card.imageUrl}
          alt={card.name}
          className={cn(
            'w-full block',
            variant === 'grid'
              ? 'h-full object-cover'
              : 'h-auto max-h-[85vh] object-contain'
          )}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {card.rarity === 'legendary' && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
            <div
              className="absolute -inset-[200%] animate-shine"
              style={{
                background:
                  'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 45%, rgba(255,223,128,0.45) 50%, rgba(255,255,255,0.35) 55%, transparent 60%)',
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
