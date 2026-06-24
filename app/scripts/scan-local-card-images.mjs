import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.resolve(__dirname, '../public/image_card');
const DATA_FILE = path.resolve(__dirname, '../src/data/mathematicians.ts');

async function main() {
  let files;
  try {
    files = await fs.readdir(IMAGE_DIR);
  } catch {
    console.log(`No ${IMAGE_DIR} directory yet.`);
    return;
  }

  const imageFiles = files.filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f));
  const localImages = new Map();

  function slugify(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  for (const file of imageFiles) {
    const base = path.basename(file, path.extname(file));
    localImages.set(base.toLowerCase(), `/image_card/${file}`);
    localImages.set(slugify(base), `/image_card/${file}`);
  }

  let content = await fs.readFile(DATA_FILE, 'utf-8');

  // Parse the array
  const arrayMatch = content.match(/export const ALL_MATHEMATICIANS: MathematicianCard\[\] = ([\s\S]+);\s*$/);
  if (!arrayMatch) {
    console.error('Could not parse mathematicians.ts');
    return;
  }

  const cards = JSON.parse(arrayMatch[1]);
  let updatedCount = 0;

  for (const card of cards) {
    const localUrl = localImages.get(card.id.toLowerCase()) || localImages.get(slugify(card.name));
    if (localUrl) {
      card.imageUrl = localUrl;
      updatedCount++;
    }
  }

  const newContent = `import type { MathematicianCard } from '@/types';\n\n// Généré automatiquement depuis liste_mathematiciens.txt et enrichi via Wikipédia\nexport const ALL_MATHEMATICIANS: MathematicianCard[] = ${JSON.stringify(cards, null, 2)};\n`;

  await fs.writeFile(DATA_FILE, newContent);
  console.log(`Scanned ${imageFiles.length} local image(s).`);
  console.log(`Updated ${updatedCount} card(s) with local images.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
