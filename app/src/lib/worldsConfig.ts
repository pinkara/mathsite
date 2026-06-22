// === CONFIGURATION DES MONDES ET ARÈNES GAMING ===

import type { WorldId, Level, ArenaContent, Course, Problem, Formula } from '@/types';
export type { WorldId };

export interface Arena {
  id: string;
  worldId: WorldId;
  number: number;
  name: string;
  xpThreshold: number;
  unlocksCourseId?: string;
  exoticCourseTitle?: string;
}

export interface World {
  id: WorldId;
  name: string;
  shortName: string;
  description: string;
  icon: string; // nom Lucide
  color: string;
  bgColor: string;
  textColor: string;
  gradient: string;
  categories: string[]; // mots-clés pour mapper les problèmes/cours
  arenas: Arena[];
  minLevel?: Level; // Niveau scolaire minimum pour débloquer l'arène 1 de ce monde
}

export interface AuraDef {
  id: string;
  name: string;
  minArena: number;
  color: string;
  gradient: string;
  shadow: string;
  ring: string;
}

export const CURRENCY_NAME = 'MathCoins';
export const CURRENCY_SYMBOL = '🪙';

export const ARENA_COUNT = 15;

// Génère les seuils d'XP pour chaque arène (courbe croissante)
function generateArenas(worldId: WorldId, baseName: string): Arena[] {
  const arenas: Arena[] = [];
  for (let i = 1; i <= ARENA_COUNT; i++) {
    // Courbe : 0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950
    const xpThreshold = i === 1 ? 0 : Math.round(50 * i * i + 50 * i - 100);
    arenas.push({
      id: `${worldId}-${i}`,
      worldId,
      number: i,
      name: `${baseName} ${romanize(i)}`,
      xpThreshold,
    });
  }
  return arenas;
}

function romanize(num: number): string {
  const roman = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90,
    L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1,
  };
  let str = '';
  for (const [letter, value] of Object.entries(roman)) {
    while (num >= value) {
      str += letter;
      num -= value;
    }
  }
  return str;
}

export const WORLDS: World[] = [
  {
    id: 'algebra',
    name: 'Algèbre',
    shortName: 'Algèbre',
    description: 'Équations, polynômes, matrices et structures algébriques.',
    icon: 'SquareFunction',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    textColor: '#2563eb',
    gradient: 'from-blue-400 to-blue-600',
    categories: ['algèbre', 'équations', 'polynômes', 'matrices', 'nombres complexes', 'complexes', 'groupe', 'anneau', 'corps', 'linéaire'],
    arenas: generateArenas('algebra', 'Algèbre'),
  },
  {
    id: 'analysis',
    name: 'Analyse',
    shortName: 'Analyse',
    description: 'Limites, dérivées, intégrales, séries et fonctions.',
    icon: 'TrendingUp',
    color: '#f97316',
    bgColor: '#fff7ed',
    textColor: '#ea580c',
    gradient: 'from-orange-400 to-orange-600',
    categories: ['analyse', 'limites', 'dérivées', 'intégrales', 'séries', 'fonctions', 'développements limités', 'dl', 'transformée', 'laplace', 'fourier'],
    arenas: generateArenas('analysis', 'Analyse'),
    minLevel: '2nde',
  },
  {
    id: 'arithmetic',
    name: 'Arithmétique',
    shortName: 'Arithmétique',
    description: 'Opérations, fractions, puissances et calcul numérique.',
    icon: 'Calculator',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    textColor: '#0891b2',
    gradient: 'from-cyan-400 to-cyan-600',
    categories: ['arithmétique', 'calcul', 'fractions', 'puissances', 'racines', 'opérations'],
    arenas: generateArenas('arithmetic', 'Arithmétique'),
  },
  {
    id: 'combinatorics',
    name: 'Combinatoire',
    shortName: 'Combinatoire',
    description: 'Dénombrement, arrangements, permutations et graphes.',
    icon: 'GitBranch',
    color: '#a855f7',
    bgColor: '#faf5ff',
    textColor: '#9333ea',
    gradient: 'from-purple-400 to-purple-600',
    categories: ['combinatoire', 'dénombrement', 'permutations', 'arrangements', 'binomial', 'graphes'],
    arenas: generateArenas('combinatorics', 'Combinatoire'),
  },
  {
    id: 'geometry',
    name: 'Géométrie',
    shortName: 'Géométrie',
    description: 'Figures, vecteurs, coniques et géométrie dans l’espace.',
    icon: 'Triangle',
    color: '#10b981',
    bgColor: '#ecfdf5',
    textColor: '#059669',
    gradient: 'from-emerald-400 to-emerald-600',
    categories: ['géométrie', 'trigonométrie', 'coniques', 'vecteurs', 'espace', 'cercle', 'triangle', 'droite', 'plan'],
    arenas: generateArenas('geometry', 'Géométrie'),
  },
  {
    id: 'logic',
    name: 'Logique',
    shortName: 'Logique',
    description: 'Logique, ensembles, graphes et raisonnement.',
    icon: 'BrainCircuit',
    color: '#06b6d4',
    bgColor: '#ecfeff',
    textColor: '#0891b2',
    gradient: 'from-cyan-400 to-cyan-600',
    categories: ['logique', 'ensembles', 'graphes', 'raisonnement', 'proposition', 'relation', 'application'],
    arenas: generateArenas('logic', 'Logique'),
    minLevel: 'Term',
  },
  {
    id: 'applied-mathematics',
    name: 'Mathématiques appliquées',
    shortName: 'Math appliquées',
    description: 'Modélisation, équations différentielles et méthodes numériques.',
    icon: 'Rocket',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#d97706',
    gradient: 'from-amber-400 to-amber-600',
    categories: ['mathématiques appliquées', 'modélisation', 'équations différentielles', 'numérique', 'simulation'],
    arenas: generateArenas('applied-mathematics', 'Math appliquées'),
  },
  {
    id: 'financial-mathematics',
    name: 'Mathématiques financières',
    shortName: 'Math finance',
    description: 'Intérêts, rentes, obligations et valorisation.',
    icon: 'Banknote',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    textColor: '#16a34a',
    gradient: 'from-green-400 to-green-600',
    categories: ['mathématiques financières', 'finance', 'intérêts', 'rentes', 'obligations', 'valorisation'],
    arenas: generateArenas('financial-mathematics', 'Math finance'),
    minLevel: 'Licence',
  },
  {
    id: 'optimization',
    name: 'Optimisation',
    shortName: 'Optimisation',
    description: 'Minimisation, maximisation, programmation linéaire et convexité.',
    icon: 'Minimize2',
    color: '#6366f1',
    bgColor: '#eef2ff',
    textColor: '#4f46e5',
    gradient: 'from-indigo-400 to-indigo-600',
    categories: ['optimisation', 'programmation linéaire', 'convexité', 'minimisation', 'maximisation', 'gradient'],
    arenas: generateArenas('optimization', 'Optimisation'),
    minLevel: 'Prépa',
  },
  {
    id: 'probability',
    name: 'Probabilités',
    shortName: 'Proba',
    description: 'Probabilités, variables aléatoires et lois.',
    icon: 'Dices',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    textColor: '#7c3aed',
    gradient: 'from-violet-400 to-violet-600',
    categories: ['probabilités', 'variables aléatoires', 'loi', 'bernoulli', 'marche aléatoire', 'espérance'],
    arenas: generateArenas('probability', 'Probabilités'),
  },
  {
    id: 'statistics',
    name: 'Statistique',
    shortName: 'Statistique',
    description: 'Description, estimation, tests et régression.',
    icon: 'BarChart3',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    textColor: '#db2777',
    gradient: 'from-pink-400 to-pink-600',
    categories: ['statistiques', 'estimation', 'tests', 'régression', 'description', 'échantillon'],
    arenas: generateArenas('statistics', 'Statistique'),
  },
  {
    id: 'information-theory',
    name: 'Information & Signal',
    shortName: 'Info & Signal',
    description: 'Entropie, codage, compression et traitement du signal.',
    icon: 'Radio',
    color: '#14b8a6',
    bgColor: '#f0fdfa',
    textColor: '#0d9488',
    gradient: 'from-teal-400 to-teal-600',
    categories: ['théorie de l\'information', 'signal', 'entropie', 'codage', 'compression', 'fourier'],
    arenas: generateArenas('information-theory', 'Info & Signal'),
    minLevel: 'Prépa',
  },
  {
    id: 'category-theory',
    name: 'Théorie des catégories',
    shortName: 'Catégories',
    description: 'Catégories, foncteurs, transformations naturelles et adjonctions.',
    icon: 'Network',
    color: '#78716c',
    bgColor: '#fafaf9',
    textColor: '#57534e',
    gradient: 'from-stone-400 to-stone-600',
    categories: ['théorie des catégories', 'catégories', 'foncteurs', 'adjonctions', 'limites'],
    arenas: generateArenas('category-theory', 'Catégories'),
    minLevel: 'Licence',
  },
  {
    id: 'graph-theory',
    name: 'Théorie des graphes',
    shortName: 'Graphes',
    description: 'Graphes, arbres, chemins, coloration et flots.',
    icon: 'Share2',
    color: '#f43f5e',
    bgColor: '#fff1f2',
    textColor: '#e11d48',
    gradient: 'from-rose-400 to-rose-600',
    categories: ['théorie des graphes', 'graphes', 'arbres', 'chemins', 'coloration', 'flots'],
    arenas: generateArenas('graph-theory', 'Graphes'),
    minLevel: '2nde',
  },
  {
    id: 'number-theory',
    name: 'Théorie des nombres',
    shortName: 'Nombres',
    description: 'Nombres premiers, arithmétique et congruences.',
    icon: 'Hash',
    color: '#eab308',
    bgColor: '#fefce8',
    textColor: '#ca8a04',
    gradient: 'from-yellow-400 to-yellow-600',
    categories: ['nombres premiers', 'arithmétique', 'congruences', 'théorie des nombres', 'divisibilité', 'modulo', 'diophantienne'],
    arenas: generateArenas('number-theory', 'Nombres'),
    minLevel: 'Term',
  },
  {
    id: 'topology',
    name: 'Topologie',
    shortName: 'Topologie',
    description: 'Ouverts, fermés, compacité, continuité et espaces.',
    icon: 'Globe',
    color: '#84cc16',
    bgColor: '#f7fee7',
    textColor: '#65a30d',
    gradient: 'from-lime-400 to-lime-600',
    categories: ['topologie', 'espaces', 'ouverts', 'fermés', 'compacité', 'connexité', 'homéomorphisme'],
    arenas: generateArenas('topology', 'Topologie'),
    minLevel: 'Licence',
  },
];

export const STARTING_ARENA_BY_LEVEL: Record<Level, number> = {
  '6e': 1,
  '5e': 2,
  '4e': 3,
  '3e': 4,
  '2nde': 5,
  '1re': 6,
  'Term': 7,
  'Prépa': 9,
  'Licence': 11,
  'Master': 13,
  'Expert': 15,
};

const LEVEL_ORDER: Level[] = ['6e', '5e', '4e', '3e', '2nde', '1re', 'Term', 'Prépa', 'Licence', 'Master', 'Expert'];

export function getLevelFromArena(arenaNumber: number): Level {
  let bestLevel: Level = '6e';
  let bestArena = 1;
  for (const level of LEVEL_ORDER) {
    const arena = STARTING_ARENA_BY_LEVEL[level];
    if (arena <= arenaNumber && arena >= bestArena) {
      bestLevel = level;
      bestArena = arena;
    }
  }
  return bestLevel;
}

export function getUserLevelFromArenas(currentArena: Partial<Record<WorldId, number>>): Level {
  const arenas = Object.values(currentArena).filter((v): v is number => typeof v === 'number');
  if (arenas.length === 0) return '6e';
  const indices = arenas.map((a) => LEVEL_ORDER.indexOf(getLevelFromArena(a)));
  const avg = indices.reduce((sum, idx) => sum + idx, 0) / indices.length;
  const rounded = Math.round(avg);
  return LEVEL_ORDER[Math.max(0, Math.min(LEVEL_ORDER.length - 1, rounded))];
}

export function getStartingArena(level: Level, worldId?: WorldId): number {
  const playerArena = STARTING_ARENA_BY_LEVEL[level] ?? 1;
  if (!worldId) return playerArena;

  const world = WORLDS_BY_ID[worldId];
  if (!world?.minLevel) return playerArena;

  const minArena = STARTING_ARENA_BY_LEVEL[world.minLevel];
  if (playerArena < minArena) return 0; // monde verrouillé

  return Math.min(ARENA_COUNT, Math.max(1, playerArena - minArena + 1));
}

export const WORLDS_BY_ID: Record<WorldId, World> = WORLDS.reduce((acc, world) => {
  acc[world.id] = world;
  return acc;
}, {} as Record<WorldId, World>);

export function getWorldByCategory(category: string): World | null {
  const normalized = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const world of WORLDS) {
    for (const keyword of world.categories) {
      const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.includes(normalizedKeyword)) {
        return world;
      }
    }
  }
  return WORLDS[0]; // fallback Algèbre
}

export function getWorldById(id: WorldId): World {
  return WORLDS_BY_ID[id] || WORLDS[0];
}

export function getArenaForXp(worldId: WorldId, xp: number): Arena {
  const world = getWorldById(worldId);
  let current = world.arenas[0];
  for (const arena of world.arenas) {
    if (xp >= arena.xpThreshold) {
      current = arena;
    } else {
      break;
    }
  }
  return current;
}

export function getCurrentArenaNumber(worldId: WorldId, xp: number): number {
  return getArenaForXp(worldId, xp).number;
}

export function getNextArenaThreshold(worldId: WorldId, currentArenaNumber: number): number | null {
  const world = getWorldById(worldId);
  const next = world.arenas.find(a => a.number === currentArenaNumber + 1);
  return next ? next.xpThreshold : null;
}

export function getArenaUnlockCost(arenaNumber: number): number {
  return arenaNumber * 50; // MathCoins
}

export function getHintCost(): number {
  return 10; // MathCoins
}

export function getSolutionCost(): number {
  return 25; // MathCoins
}

export function getChestCurrencyReward(): number {
  return Math.floor(Math.random() * 16) + 5; // 5–20 MathCoins
}

export const AURAS: AuraDef[] = [
  { id: 'none', name: 'Aucune', minArena: 0, color: '#9ca3af', gradient: 'from-gray-200 to-gray-300', shadow: 'shadow-gray-200', ring: 'ring-gray-200' },
  { id: 'bronze', name: 'Aura de Bronze', minArena: 5, color: '#b45309', gradient: 'from-amber-600 to-orange-700', shadow: 'shadow-amber-500/50', ring: 'ring-amber-500' },
  { id: 'silver', name: 'Aura d’Argent', minArena: 10, color: '#64748b', gradient: 'from-slate-300 to-slate-500', shadow: 'shadow-slate-400/50', ring: 'ring-slate-400' },
  { id: 'gold', name: 'Aura d’Or', minArena: 15, color: '#ca8a04', gradient: 'from-yellow-400 to-amber-500', shadow: 'shadow-yellow-400/50', ring: 'ring-yellow-400' },
  { id: 'legendary', name: 'Aura Légendaire', minArena: 20, color: '#9333ea', gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/50', ring: 'ring-purple-500' },
];

export function getAuraForHighestArena(highestArena: number): AuraDef {
  let aura = AURAS[0];
  for (const a of AURAS) {
    if (highestArena >= a.minArena) {
      aura = a;
    }
  }
  return aura;
}

// Chaque arène terminée débloque un contenu bonus/olympiade.
// La configuration se fait via la table arena_contents.
export function getArenaBadgeId(worldId: WorldId, arenaNumber: number): string {
  return `arena-${worldId}-${arenaNumber}`;
}

export interface ArenaContents {
  courses: Course[];
  formulas: Formula[];
  problems: Problem[];
  bonusCourses: Course[];
  bonusProblems: Problem[];
}

export function getArenaContents(
  worldId: WorldId,
  arenaNumber: number,
  courses: Course[],
  problems: Problem[],
  formulas: Formula[],
  arenaContents: ArenaContent[]
): ArenaContents {
  const world = getWorldById(worldId);

  // Contenu explicitement configuré
  const explicit = arenaContents.filter(
    (ac) => ac.worldId === worldId && ac.arenaNumber === arenaNumber
  );

  if (explicit.length > 0) {
    const contentIds = new Map<string, ArenaContent>();
    for (const ac of explicit) contentIds.set(`${ac.contentType}:${ac.contentId}`, ac);

    const byType = (type: ArenaContent['contentType']) =>
      explicit
        .filter((ac) => ac.contentType === type)
        .map((ac) => {
          if (type === 'course') return courses.find((c) => c.id === ac.contentId);
          if (type === 'problem') return problems.find((p) => p.id === ac.contentId);
          return formulas.find((f) => f.id === ac.contentId);
        })
        .filter(Boolean) as any;

    return {
      courses: byType('course').filter(
        (c: Course) => !contentIds.get(`course:${c.id}`)?.isBonus && !contentIds.get(`course:${c.id}`)?.isOlympiad
      ),
      formulas: byType('formula'),
      problems: byType('problem').filter(
        (p: Problem) => !contentIds.get(`problem:${p.id}`)?.isBonus && !contentIds.get(`problem:${p.id}`)?.isOlympiad
      ),
      bonusCourses: byType('course').filter(
        (c: Course) => contentIds.get(`course:${c.id}`)?.isBonus || contentIds.get(`course:${c.id}`)?.isOlympiad
      ),
      bonusProblems: byType('problem').filter(
        (p: Problem) => contentIds.get(`problem:${p.id}`)?.isBonus || contentIds.get(`problem:${p.id}`)?.isOlympiad
      ),
    };
  }

  // Fallback intelligent : répartir les contenus existants par catégorie/niveau
  const matchesCategory = (category: string) =>
    world.categories.some((kw) =>
      category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
        kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    );

  const worldCourses = courses.filter((c) => matchesCategory(c.category));
  const worldFormulas = formulas.filter((f) => matchesCategory(f.category));
  const worldProblems = problems.filter((p) => matchesCategory(p.category));

  // Répartition des problèmes par arène (20 par arène : 10F, 5M, 5D)
  const byDifficulty = (d: Problem['difficulty']) => worldProblems.filter((p) => p.difficulty === d);
  const easy = byDifficulty('Facile');
  const medium = byDifficulty('Moyen');
  const hard = byDifficulty('Difficile');

  const pick = (arr: Problem[], start: number, count: number) =>
    arr.slice(start * count, start * count + count);

  const arenaIndex = arenaNumber - 1;
  const arenaProblems: Problem[] = [
    ...pick(easy, arenaIndex, 10),
    ...pick(medium, arenaIndex, 5),
    ...pick(hard, arenaIndex, 5),
  ].slice(0, 20);

  // Répartition des cours/formules : 1-2 par arène
  const arenaCourses = worldCourses.slice(arenaIndex * 1, arenaIndex * 1 + 1);
  const arenaFormulas = worldFormulas.slice(arenaIndex * 2, arenaIndex * 2 + 2);

  // Bonus : dernier problème difficile + premier cours exotic disponible
  const bonusCourses = worldCourses.filter((c) => c.subjectType === 'exotic').slice(0, 1);
  const bonusProblems = hard.slice(arenaIndex * 5 + 5, arenaIndex * 5 + 6);

  return {
    courses: arenaCourses,
    formulas: arenaFormulas,
    problems: arenaProblems,
    bonusCourses,
    bonusProblems,
  };
}
