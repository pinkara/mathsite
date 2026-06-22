import { useMemo, useState } from 'react';
import { Search, Sparkles, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ALL_CARDS, RARITY_ORDER, RARITY_LABELS } from '@/lib/mathematiciansParser';
import { RARITY_COLORS, type UserProfile, type CardRarity, type MathematicianCard } from '@/types';
import { TradingCard } from '@/components/TradingCard';
import { CardDetailDialog } from '@/components/CardDetailDialog';

interface CollectionPageProps {
  profile: UserProfile | null;
}

export function CollectionPage({ profile }: CollectionPageProps) {
  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<CardRarity | 'all'>('all');
  const [selectedCard, setSelectedCard] = useState<MathematicianCard | null>(null);

  const collected = profile?.cardCollection || {};

  const filteredCards = useMemo(() => {
    return ALL_CARDS.filter((card) => {
      const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase());
      const matchesRarity = rarityFilter === 'all' || card.rarity === rarityFilter;
      return matchesSearch && matchesRarity;
    });
  }, [search, rarityFilter]);

  const stats = useMemo(() => {
    const total = ALL_CARDS.length;
    const collectedCount = Object.keys(collected).length;
    return {
      total,
      collectedCount,
      percent: total ? Math.round((collectedCount / total) * 100) : 0,
    };
  }, [collected]);

  const rarityStats = useMemo(() => {
    return RARITY_ORDER.map((rarity) => {
      const total = ALL_CARDS.filter((c) => c.rarity === rarity).length;
      const have = Object.values(collected).filter((c) => c.rarity === rarity).length;
      return { rarity, total, have, colors: RARITY_COLORS[rarity] };
    });
  }, [collected]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Collection MathUnivers
          </h1>
          <p className="text-gray-500 mt-2 text-base">
            {stats.collectedCount} / {stats.total} cartes collectionnées ({stats.percent}%)
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 font-bold border border-amber-200 shadow-sm">
          <Trophy className="w-5 h-5 text-amber-600" />
          <span>{stats.collectedCount} cartes possédées</span>
        </div>
      </div>

      {/* Rarity stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {rarityStats.map(({ rarity, total, have, colors }) => (
          <button
            key={rarity}
            onClick={() => setRarityFilter(rarityFilter === rarity ? 'all' : rarity)}
            className={cn(
              'text-left p-3 rounded-xl border-2 transition-all',
              rarityFilter === rarity && 'ring-2 ring-offset-2'
            )}
            style={{
              backgroundColor: colors.bg,
              borderColor: rarityFilter === rarity ? colors.text : colors.border,
              '--tw-ring-color': colors.text,
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              if (rarityFilter !== rarity) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wide" style={{ color: colors.text }}>
                {RARITY_LABELS[rarity]}
              </span>
              <Sparkles className="w-3.5 h-3.5" style={{ color: colors.text }} />
            </div>
            <p className="mt-1 text-lg font-black" style={{ color: colors.text }}>
              {have} <span className="text-sm font-medium opacity-70">/ {total}</span>
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher un mathématicien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={rarityFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setRarityFilter('all')}
            className="rounded-full"
          >
            Toutes
          </Button>
          {RARITY_ORDER.map((rarity) => (
            <Button
              key={rarity}
              size="sm"
              variant={rarityFilter === rarity ? 'default' : 'outline'}
              onClick={() => setRarityFilter(rarityFilter === rarity ? 'all' : rarity)}
              className="rounded-full"
              style={
                rarityFilter === rarity
                  ? { backgroundColor: RARITY_COLORS[rarity].text, borderColor: RARITY_COLORS[rarity].text }
                  : { borderColor: RARITY_COLORS[rarity].border, color: RARITY_COLORS[rarity].text }
              }
            >
              {RARITY_LABELS[rarity]}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-5 sm:gap-5">
        {filteredCards.map((card) => {
          const collectedCard = collected[card.id];
          const isCollected = !!collectedCard;
          return (
            <TradingCard
              key={card.id}
              card={collectedCard ? { ...card, collectedAt: collectedCard.collectedAt } : card}
              collected={isCollected}
              variant="grid"
              onClick={() => {
                if (isCollected) {
                  setSelectedCard(collectedCard ? { ...card, collectedAt: collectedCard.collectedAt } : card);
                }
              }}
            />
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <p className="text-gray-500 font-medium">Aucune carte ne correspond à ta recherche.</p>
        </div>
      )}

      <CardDetailDialog
        card={selectedCard}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </div>
  );
}
