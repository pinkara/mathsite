import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT = path.resolve(__dirname, '../src/data/mathematicians.json');
const OUTPUT = path.resolve(__dirname, '../src/data/mathematicians.ts');

// Forcément légendaires — incontournables de l’histoire des maths
const MYTHIC_NAMES = new Set([
  'Archimède',
  'Euclide',
  'Pythagore de Samos',
  'Thalès de Milet',
  'Isaac Newton',
  'Leonhard Euler',
  'Carl Friedrich Gauss',
  'Srinivasa Ramanujan',
  'Pierre de Fermat',
  'René Descartes',
  'Blaise Pascal',
  'David Hilbert',
  'Alan Turing',
  'Évariste Galois',
  'Andrew Wiles',
  'Alexander Grothendieck',
]);

const LEGENDARY_NAMES = new Set([
  'Archimède',
  'Euclide',
  'Pythagore de Samos',
  'Thalès de Milet',
  'Isaac Newton',
  'Gottfried Wilhelm Leibniz',
  'René Descartes',
  'Pierre de Fermat',
  'Blaise Pascal',
  'Leonhard Euler',
  'Carl Friedrich Gauss',
  'Bernhard Riemann',
  'Évariste Galois',
  'Henri Poincaré',
  'David Hilbert',
  'Alan Turing',
  'John von Neumann',
  'Srinivasa Ramanujan',
  'Andrew Wiles',
  'Alexander Grothendieck',
  'Hypatie d\'Alexandrie',
  'Émilie du Châtelet',
  'Ada Lovelace',
  'Emmy Noether',
  'Joseph-Louis de Lagrange',
  'Pierre-Simon de Laplace',
  'Augustin Louis Cauchy',
  'Muhammad Ibn Musa Al-Khwarizmi',
  'Léonard de Pise dit Fibonacci',
  'Diophante d\'Alexandrie',
  'Johannes Kepler',
  'John Forbes Nash',
  'Benoit Mandelbrot',
  'Georg Ferdinand Cantor',
  'Kurt Gödel',
  'Nicolas Copernic',
  'Galilée',
  'Thomas Bayes',
  'Andrey Kolmogorov',
  'Jean le Rond d\'Alembert',
  'Joseph Fourier',
  'Siméon Denis Poisson',
  'Niels Henrik Abel',
  'Euclide d\'Alexandrie',
]);

// Forcer une rareté exacte pour certaines cartes (prend le pas sur le score)
const FORCE_RARITY = {
  'Évariste Galois': 'epic',
};

const EPIC_NAMES = new Set([
  'Apollonios de Perga',
  'Ératosthène',
  'Hipparque de Nicée',
  'Aristote',
  'Zénon d\'Élée',
  'Ahmès',
  'Al-Biruni',
  'Omar Khayyam',
  'Bhāskara II',
  'Nicolas Chuquet',
  'François Viète',
  'Marin Mersenne',
  'John Napier',
  'Gilles Personne de Roberval',
  'Christian Huygens',
  'Jacques Bernoulli',
  'Jean Bernoulli',
  'Daniel Bernoulli',
  'Brook Taylor',
  'Colin Maclaurin',
  'Abraham de Moivre',
  'Leonhard Euler', // déjà legendary
  'Joseph-Louis de Lagrange',
  'Pierre-Simon de Laplace',
  'Adrien-Marie Legendre',
  'Jean-Baptiste Joseph Fourier',
  'Siméon Denis Poisson',
  'Augustin Louis Cauchy',
  'Évariste Galois',
  'Niels Henrik Abel',
  'Carl Gustav Jacobi',
  'William Rowan Hamilton',
  'George Boole',
  'Arthur Cayley',
  'James Joseph Sylvester',
  'Charles Hermite',
  'Richard Dedekind',
  'Georg Ferdinand Cantor',
  'Henri Poincaré',
  'David Hilbert',
  'Felix Klein',
  'Sophus Lie',
  'Emmy Noether',
  'John von Neumann',
  'Alan Turing',
  'Kurt Gödel',
  'Andrey Kolmogorov',
  'Sergei Novikov',
  'Vladimir Arnold',
  'Alexander Grothendieck',
  'Pierre Deligne',
  'Andrew Wiles',
  'Terence Tao',
  'Maryam Mirzakhani',
  'Grigori Perelman',
  'Srinivasa Ramanujan',
  'Benoit Mandelbrot',
  'Mikhaïl Gromov',
  'Jean-Pierre Serre',
  'Jacques Tits',
  'Timothy Gowers',
  'Richard Feynman', // physicien mais populaire
]);

function cleanValue(v) {
  if (v === null) return undefined;
  return v;
}

function computeScore(card) {
  const bio = card.bio || '';
  const contributions = card.contributions || [];
  const contribText = contributions.join(' ');

  let bonus = 0;
  if (MYTHIC_NAMES.has(card.name)) bonus += 50000;
  else if (LEGENDARY_NAMES.has(card.name)) bonus += 10000;
  else if (EPIC_NAMES.has(card.name)) bonus += 3000;

  // Small keyword boost
  const fameKeywords = ['célèbre', 'renommé', 'important', 'majeur', 'fondamental', 'prestigieux'];
  const fameScore = fameKeywords.reduce((sum, kw) => sum + (bio.toLowerCase().includes(kw) ? 200 : 0), 0);

  return bonus + bio.length * 0.5 + contribText.length * 1.5 + fameScore;
}

async function main() {
  const raw = await fs.readFile(INPUT, 'utf-8');
  const cards = JSON.parse(raw);

  // Compute scores and sort
  const scored = cards.map((card) => ({ card, score: computeScore(card) }));
  scored.sort((a, b) => b.score - a.score);

  const total = scored.length;
  const legendaryCount = Math.max(1, Math.floor(total * 0.0217));
  const epicCount = Math.max(1, Math.floor(total * 0.0450));
  const rareCount = Math.max(1, Math.floor(total * 0.1980));

  scored.forEach(({ card }, index) => {
    let rarity;
    if (index < legendaryCount) rarity = 'legendary';
    else if (index < legendaryCount + epicCount) rarity = 'epic';
    else if (index < legendaryCount + epicCount + rareCount) rarity = 'rare';
    else rarity = 'common';
    card.rarity = rarity;
  });

  // Forcer certaines raretés exactes
  for (const card of cards) {
    if (FORCE_RARITY[card.name]) {
      card.rarity = FORCE_RARITY[card.name];
    }
  }

  // Restore original order (by file order)
  cards.sort((a, b) => a.name.localeCompare(b.name));

  const cleaned = cards.map((card) => ({
    id: card.id,
    name: card.name,
    country: cleanValue(card.country),
    dates: cleanValue(card.dates),
    birthYear: cleanValue(card.birthYear),
    deathYear: cleanValue(card.deathYear),
    rarity: card.rarity,
    imageUrl: cleanValue(card.imageUrl),
    bio: cleanValue(card.bio),
    contributions: card.contributions || [],
    wikipediaUrl: cleanValue(card.wikipediaUrl),
  }));

  const fileContent = `import type { MathematicianCard } from '@/types';

// Généré automatiquement depuis liste_mathematiciens.txt et enrichi via Wikipédia
export const ALL_MATHEMATICIANS: MathematicianCard[] = ${JSON.stringify(cleaned, null, 2)};
`;

  await fs.writeFile(OUTPUT, fileContent);
  // Also update the JSON source so scans / checks stay consistent
  await fs.writeFile(INPUT, JSON.stringify(cleaned, null, 2));

  const counts = cleaned.reduce((acc, c) => {
    acc[c.rarity] = (acc[c.rarity] || 0) + 1;
    return acc;
  }, {});

  console.log(`Done. ${cleaned.length} mathematicians written to ${OUTPUT}`);
  console.log('Rarity distribution:', counts);
  console.log('Legendary:', cleaned.filter((c) => c.rarity === 'legendary').map((c) => c.name).join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
