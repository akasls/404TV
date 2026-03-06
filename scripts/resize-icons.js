const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  require.resolve('sharp');
} catch (e) {
  console.log('Installing sharp...');
  execSync('npm install sharp --no-save', { stdio: 'inherit' });
}

const sharp = require('sharp');

const publicDir = path.join(__dirname, '../public');
const logoPath = path.join(publicDir, 'logo.png');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [192, 256, 384, 512];

async function generate() {
  try {
    for (const size of sizes) {
      const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(outPath);
      console.log(`Generated ${outPath}`);
    }
  } catch (error) {
    console.error('Failed to generate icons:', error);
  }
}

generate();
