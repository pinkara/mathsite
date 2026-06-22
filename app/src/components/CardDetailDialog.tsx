import { ExternalLink, Calendar, MapPin, Sparkles, Crown, Gem, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { MathematicianCard, CardRarity } from '@/types';
import { RARITY_COLORS } from '@/types';
import { RARITY_LABELS } from '@/lib/mathematiciansParser';
import { TradingCard } from './TradingCard';

interface CardDetailDialogProps {
  card: MathematicianCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RARITY_ICONS: Record<CardRarity, typeof Star> = {
  common: Star,
  rare: Gem,
  epic: Sparkles,
  legendary: Crown,
};

export function CardDetailDialog({ card, open, onOpenChange }: CardDetailDialogProps) {
  if (!card) return null;

  const colors = RARITY_COLORS[card.rarity];
  const RarityIcon = RARITY_ICONS[card.rarity];
  const collected = !!card.collectedAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl xl:max-w-[1400px] p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-0 max-h-[95vh]">
          {/* Left: large card */}
          <div
            className="p-4 sm:p-6 lg:p-10 flex items-center justify-center min-h-[35vh] lg:min-h-0"
            style={{
              background: `linear-gradient(145deg, ${colors.bg}, #ffffff)`,
            }}
          >
            <div className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[520px] lg:max-w-[640px] xl:max-w-[800px]">
              <TradingCard card={card} collected={collected} interactive={false} variant="detail" />
            </div>
          </div>

          {/* Right: details */}
          <ScrollArea className="max-h-[45vh] lg:max-h-[95vh]">
            <div className="p-6 space-y-5">
              <DialogHeader className="space-y-2 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className="gap-1 text-xs font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: colors.border,
                    }}
                    variant="outline"
                  >
                    <RarityIcon className="w-3 h-3" fill={colors.text} />
                    {RARITY_LABELS[card.rarity]}
                  </Badge>
                  {collected && (
                    <Badge variant="secondary" className="text-xs">
                      Obtenue le {new Date(card.collectedAt!).toLocaleDateString('fr-FR')}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-3xl font-black leading-tight">
                  {card.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Détails de la carte {card.name}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {card.country && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" style={{ color: colors.text }} />
                    <span>{card.country}</span>
                  </div>
                )}
                {card.dates && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" style={{ color: colors.text }} />
                    <span>{card.dates}</span>
                  </div>
                )}
              </div>

              {card.bio && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black uppercase tracking-wide text-gray-500">
                    Biographie
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-sm">{card.bio}</p>
                </div>
              )}

              {card.contributions && card.contributions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black uppercase tracking-wide text-gray-500">
                    Contributions principales
                  </h4>
                  <ul className="space-y-2">
                    {card.contributions.map((contrib, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-gray-700">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: colors.text }}
                        />
                        <span className="leading-relaxed">{contrib}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {card.wikipediaUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <a
                    href={card.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir sur Wikipédia
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
