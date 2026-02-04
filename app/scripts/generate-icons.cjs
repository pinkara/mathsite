const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/icon-base.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...');
  
  try {
    // Vérifier que le fichier source existe
    if (!fs.existsSync(inputFile)) {
      console.error('❌ Fichier source non trouvé:', inputFile);
      process.exit(1);
    }

    // Lire le SVG
    const svgBuffer = fs.readFileSync(inputFile);

    // Générer chaque taille
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`✅ ${size}x${size}px`);
    }

    // Générer aussi un favicon.ico (32x32)
    const faviconFile = path.join(outputDir, 'favicon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFile(faviconFile);
    console.log('✅ favicon.ico (32x32px)');

    console.log('\n🎉 Toutes les icônes ont été générées !');
    console.log(`📁 Dossier: ${outputDir}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

generateIcons();
