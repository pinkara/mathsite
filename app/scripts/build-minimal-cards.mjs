import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, '../src/data/mathematicians.ts');
const INPUT = path.resolve(__dirname, '../../liste_mathematiciens.txt');

const KNOWN_COUNTRIES = [
  'Égypte de Ptolémée',
  'Égypte',
  'Grèce',
  'Chine',
  'Inde',
  'Byzance',
  'Italie',
  'France',
  'Allemagne',
  'Angleterre',
  'Écosse',
  'Pays-Bas',
  'Suisse',
  'Russie',
  'Pologne',
  'États-Unis',
  'Iran',
  'Perse',
  'Syrie',
  'Irak',
  'Arabie',
  'Turquie',
  'Espagne',
  'Portugal',
  'Belgique',
  'Autriche',
  'Hongrie',
  'Suède',
  'Norvège',
  'Danemark',
  'Finlande',
  'Japon',
  'Corée',
  'Vietnam',
  'Malaisie',
  'Brésil',
  'Canada',
  'Australie',
  'Nouvelle-Zélande',
  'Afrique du Sud',
  'Israël',
  'Pakistan',
  'Bangladesh',
  'Indonésie',
  'Philippines',
  'Thaïlande',
  'Mexique',
  'Argentine',
  'Chili',
  'Colombie',
  'Venezuela',
  'Ukraine',
  'Tchéquie',
  'Slovaquie',
  'Roumanie',
  'Bulgarie',
  'Croatie',
  'Serbie',
  'Slovénie',
  'Estonie',
  'Lettonie',
  'Lituanie',
  'Bélarus',
  'Géorgie',
  'Arménie',
  'Azerbaïdjan',
  'Kazakhstan',
  'Ouzbékistan',
  'Mongolie',
  'Népal',
  'Sri Lanka',
  'Myanmar',
  'Cambodge',
  'Laos',
  'Singapour',
  'Islande',
  'Irlande',
  'Pays de Galles',
  'Luxembourg',
  'Malte',
  'Chypre',
  'Andorre',
  'Monaco',
  'Liechtenstein',
  'San Marin',
  'Vatican',
];

function cleanLine(line) {
  return line
    .replace(/\[\d+\]/g, '')
    .replace(/\(à confirmer\)/gi, '')
    .replace(/[\]\[]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseLine(rawLine) {
  const line = cleanLine(rawLine);
  const match = line.match(/^([^(]+)\s+\(([^)]+)\)\s*$/);
  if (!match) return null;

  const name = match[1].trim().replace(/,$/, '');
  const inside = match[2].trim();

  const commaIndex = inside.indexOf(',');
  if (commaIndex !== -1) {
    return { name, country: inside.slice(0, commaIndex).trim(), dates: inside.slice(commaIndex + 1).trim() };
  }

  for (const country of KNOWN_COUNTRIES) {
    const lowerInside = inside.toLowerCase();
    const lowerCountry = country.toLowerCase();
    if (lowerInside.startsWith(lowerCountry + ' ') || lowerInside === lowerCountry) {
      return { name, country, dates: inside.slice(country.length).trim() };
    }
  }

  return { name, country: '', dates: inside };
}

function parseDates(dates) {
  const years = dates.match(/-?\d+/g)?.map(Number) || [];
  return { birthYear: years[0] ?? null, deathYear: years[1] ?? null };
}

function hashRarity(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const r = (Math.abs(hash) % 10000) / 10000;
  if (r < 0.7353) return 'common';
  if (r < 0.9333) return 'rare';
  if (r < 0.9783) return 'epic';
  return 'legendary';
}

async function main() {
  const raw = await fs.readFile(INPUT, 'utf-8');
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^(Ier|IIe|IIIe|IVe|Ve|VIe|VIIe|VIIIe|IXe|Xe|XIe|XIIe|XIIIe|XIVe|XVe|XVIe|XVIIe|XVIIIe|XIXe|XXe|XXIe)\s+siècle/i.test(l));

  const mathematicians = [];

  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) continue;
    const { birthYear, deathYear } = parseDates(parsed.dates);
    mathematicians.push({
      id: slugify(parsed.name),
      name: parsed.name,
      country: parsed.country,
      dates: parsed.dates,
      birthYear: birthYear ?? undefined,
      deathYear: deathYear ?? undefined,
      rarity: hashRarity(parsed.name),
      imageUrl: undefined,
      bio: '',
      contributions: [],
      wikipediaUrl: '',
    });
  }

  const fileContent = `import type { MathematicianCard } from '@/types';

// Généré automatiquement depuis liste_mathematiciens.txt
export const ALL_MATHEMATICIANS: MathematicianCard[] = ${JSON.stringify(mathematicians, null, 2)};
`;

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, fileContent);
  console.log(`Done. ${mathematicians.length} mathematicians written to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
