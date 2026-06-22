import type { MathematicianCard, CardRarity } from '@/types';
import { ALL_MATHEMATICIANS } from '@/data/mathematicians';

export const ALL_CARDS: MathematicianCard[] = ALL_MATHEMATICIANS;

export const RARITY_ORDER: CardRarity[] = ['common', 'rare', 'epic', 'legendary'];

export const RARITY_LABELS: Record<CardRarity, string> = {
  common: 'Commune',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

export function getCardById(id: string): MathematicianCard | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export function getRandomCard(targetRarity?: CardRarity): MathematicianCard {
  const pool = targetRarity ? ALL_CARDS.filter((c) => c.rarity === targetRarity) : ALL_CARDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function openCardPack(): MathematicianCard {
  const rand = Math.random();
  if (rand < 0.0217) return getRandomCard('legendary');
  if (rand < 0.0667) return getRandomCard('epic');
  if (rand < 0.2647) return getRandomCard('rare');
  return getRandomCard('common');
}

export function getCardImageUrl(name: string): string {
  const encoded = encodeURIComponent(name);
  return `https://placehold.co/300x400/3b82f6/ffffff?text=${encoded}`;
}

export async function fetchWikipediaImage(name: string): Promise<string | null> {
  try {
    const searchTerm = encodeURIComponent(name);
    const response = await fetch(
      `https://fr.wikipedia.org/api/rest_v1/page/summary/${searchTerm}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.thumbnail?.source || null;
  } catch {
    return null;
  }
}
