const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeFolder(dir) {
  const files = fs.readdirSync(dir);
  let savedTotal = 0;
  let count = 0;

  for (const f of files) {
    const p = path.join(dir, f);
    const stat = fs.statSync(p);
    if (!stat.isFile()) continue;
    const ext = path.extname(f).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) continue;

    // Only optimize if > 80 KB
    if (stat.size <= 80 * 1024) continue;

    const origSize = stat.size;
    try {
      const inputBuf = fs.readFileSync(p);
      let pipeline = sharp(inputBuf, { failOn: 'none' })
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true });

      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality: 82 });
      } else if (ext === '.avif') {
        pipeline = pipeline.avif({ quality: 78 });
      } else if (ext === '.png') {
        pipeline = pipeline.png({ quality: 82, compressionLevel: 8 });
      }

      const outBuf = await pipeline.toBuffer();
      if (outBuf.length < origSize) {
        fs.writeFileSync(p, outBuf);
        const saved = origSize - outBuf.length;
        savedTotal += saved;
        count++;
        console.log(`[OK] ${f}: ${(origSize / 1024).toFixed(0)}KB -> ${(outBuf.length / 1024).toFixed(0)}KB`);
      }
    } catch (err) {
      console.warn(`[WARN] Failed on ${f}:`, err.message);
    }
  }

  console.log(`Finished ${dir}: Optimized ${count} images, saved ${(savedTotal / (1024 * 1024)).toFixed(2)} MB`);
}

async function optimizeScanner() {
  const p = path.join('public', 'sudama-scanner.jpg');
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    if (stat.size > 150 * 1024) {
      const inputBuf = fs.readFileSync(p);
      const outBuf = await sharp(inputBuf, { failOn: 'none' })
        .resize(1000, 1000, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
        .toBuffer();
      fs.writeFileSync(p, outBuf);
      console.log(`[OK] sudama-scanner.jpg: ${(stat.size / 1024).toFixed(0)}KB -> ${(outBuf.length / 1024).toFixed(0)}KB`);
    }
  }
}

async function main() {
  await optimizeFolder('public/images/menu');
  await optimizeScanner();
}

main();
