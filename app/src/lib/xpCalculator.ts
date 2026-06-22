import { LEVELS, type Level, type Problem, type WorldId } from '@/types';
import { getWorldByCategory } from './worldsConfig';

export function getProblemXp(
  level: Level,
  difficulty: 'Facile' | 'Moyen' | 'Difficile'
): number {
  const levelIndex = LEVELS.findIndex((l) => l.name === level);
  const safeIndex = levelIndex >= 0 ? levelIndex : 0;
  // +10 % par palier de niveau
  const levelMultiplier = 1 + safeIndex * 0.1;
  const diffMultiplier = difficulty === 'Facile' ? 1 : difficulty === 'Moyen' ? 1.5 : 2;
  return Math.round(30 * diffMultiplier * levelMultiplier);
}

export function getCourseXp(level: Level): number {
  const levelIndex = LEVELS.findIndex((l) => l.name === level);
  const safeIndex = levelIndex >= 0 ? levelIndex : 0;
  const levelMultiplier = 1 + safeIndex * 0.05;
  return Math.round(50 * levelMultiplier);
}

export function getProblemWorldXp(problem: Problem): { worldId: WorldId; xp: number } | null {
  const world = getWorldByCategory(problem.category);
  if (!world) return null;

  const baseXp = getProblemXp(problem.level, problem.difficulty);
  // Légère augmentation pour les problèmes difficiles dans leur monde
  return { worldId: world.id, xp: baseXp };
}
