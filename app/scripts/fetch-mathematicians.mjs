import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, '../src/data/mathematicians.json');
const INPUT = path.resolve(__dirname, '../../liste_mathematiciens.txt');

const SLEEP_MS = 800;
const MAX_RETRIES = 2;

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  // Cas "Pays, dates"
  const commaIndex = inside.indexOf(',');
  if (commaIndex !== -1) {
    return {
      name,
      country: inside.slice(0, commaIndex).trim(),
      dates: inside.slice(commaIndex + 1).trim(),
    };
  }

  // Essayer de matcher un pays connu au début
  for (const country of KNOWN_COUNTRIES) {
    const lowerInside = inside.toLowerCase();
    const lowerCountry = country.toLowerCase();
    if (lowerInside.startsWith(lowerCountry + ' ') || lowerInside === lowerCountry) {
      return {
        name,
        country,
        dates: inside.slice(country.length).trim(),
      };
    }
  }

  // Sinon tout est date
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

async function loadExisting() {
  try {
    const data = await fs.readFile(OUTPUT, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [];
}

async function save(data) {
  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, JSON.stringify(data, null, 2));
}

async function fetchJson(url, retries = 0) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'MathUnivers-Builder/1.0 (contact@example.com)' },
  });
  if (!res.ok) {
    if (res.status === 429 && retries < MAX_RETRIES) {
      const wait = Math.min(1500 * 2 ** retries, 6000);
      console.warn(`  429, retry ${retries + 1}/${MAX_RETRIES} after ${wait}ms`);
      await sleep(wait);
      return fetchJson(url, retries + 1);
    }
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchWikipediaData(name) {
  // Use generator=search to get the best matching page + extracts + images in one call
  const url = `https://fr.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrlimit=1&prop=extracts|pageimages|info|description&exchars=1200&explaintext=1&piprop=thumbnail|original&pithumbsize=400&inprop=url&format=json&origin=*`;
  const data = await fetchJson(url);
  const pages = data?.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined) return null;

  const extract = page.extract || '';
  const description = page.description || '';
  const imageUrl = page.thumbnail?.source || page.original?.source || null;
  const title = page.title;
  const wikipediaUrl =
    page.fullurl || page.canonicalurl || `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`;

  const firstSentence = extract.split(/[.!?]\s+/)[0] || '';
  const bio = description || firstSentence;

  return {
    wikipediaTitle: title,
    wikipediaUrl,
    imageUrl,
    bio: bio.slice(0, 500),
    contributions: extractContributions(extract),
  };
}

function extractContributions(text) {
  if (!text) return [];
  const sentences = text.split(/[.!?]\s+/);
  const keywords = [
    'connu pour',
    'découvert',
    'découverte',
    'introduit',
    'théorème',
    'conjecture',
    'lemme',
    'principe',
    'méthode',
    'loi',
    'équation',
    'formule',
    'travaux portent',
    'a montré',
    'a démontré',
    'a établi',
    'a fondé',
    'a développé',
    'a introduit',
    'a donné',
    'a résolu',
    'a publié',
    'a écrit',
    'a inventé',
    'théorie',
    'axiome',
    'algorithme',
  ];
  const found = [];
  for (const s of sentences) {
    const lower = s.toLowerCase();
    if (keywords.some((k) => lower.includes(k))) {
      const clean = s.trim();
      if (clean.length > 15 && clean.length < 320 && !found.includes(clean)) {
        found.push(clean);
      }
    }
  }
  return found.slice(0, 5);
}

async function main() {
  const raw = await fs.readFile(INPUT, 'utf-8');
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^(Ier|IIe|IIIe|IVe|Ve|VIe|VIIe|VIIIe|IXe|Xe|XIe|XIIe|XIIIe|XIVe|XVe|XVIe|XVIIe|XVIIIe|XIXe|XXe|XXIe)\s+siècle/i.test(l));

  const mathematicians = await loadExisting();
  const existingIds = new Set(mathematicians.map((m) => m.id));
  const failed = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parsed = parseLine(line);
    if (!parsed) {
      console.log(`Skipping non-parsable line: ${line}`);
      continue;
    }

    const id = slugify(parsed.name);
    if (existingIds.has(id)) {
      console.log(`[${i + 1}/${lines.length}] ${parsed.name} already exists, skipping.`);
      continue;
    }

    const { birthYear, deathYear } = parseDates(parsed.dates);
    const rarity = hashRarity(parsed.name);

    console.log(`[${i + 1}/${lines.length}] Fetching ${parsed.name}...`);
    let wiki = null;
    try {
      wiki = await fetchWikipediaData(parsed.name);
    } catch (e) {
      console.warn(`  Failed for ${parsed.name}:`, e.message);
      failed.push(parsed.name);
    }

    const entry = {
      id,
      name: parsed.name,
      country: parsed.country,
      dates: parsed.dates,
      birthYear,
      deathYear,
      rarity,
      imageUrl: wiki?.imageUrl || null,
      bio: wiki?.bio || '',
      contributions: wiki?.contributions || [],
      wikipediaUrl: wiki?.wikipediaUrl || '',
    };

    mathematicians.push(entry);
    existingIds.add(id);
    await save(mathematicians);

    if (i < lines.length - 1) await sleep(SLEEP_MS);
  }

  console.log(`\nDone. ${mathematicians.length} mathematicians written to ${OUTPUT}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) console.log(failed.join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
