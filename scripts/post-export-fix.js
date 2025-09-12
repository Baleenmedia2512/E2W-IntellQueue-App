// Fix Next.js app dir RSC .txt requests for Capacitor WebView by duplicating index.txt to route.txt
// Example: out/login/index.txt -> out/login.txt
// Also duplicate nested routes: out/QueueSystem/LanguageSelection/index.txt -> out/QueueSystem/LanguageSelection.txt

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'out');

function copyIndexTxtToSiblingTxt(dir) {
  const indexTxt = path.join(dir, 'index.txt');
  if (!fs.existsSync(indexTxt)) return;

  // Compute sibling txt path: parent/<dirname>.txt
  const parent = path.dirname(dir);
  const base = path.basename(dir);
  const siblingTxt = path.join(parent, `${base}.txt`);

  try {
    fs.copyFileSync(indexTxt, siblingTxt);
    console.log(`Created: ${path.relative(OUT_DIR, siblingTxt)} from ${path.relative(OUT_DIR, indexTxt)}`);
  } catch (e) {
    console.warn(`Failed to create sibling txt for ${dir}:`, e.message);
  }
}

function walk(current) {
  let entries;
  try {
    entries = fs.readdirSync(current, { withFileTypes: true });
  } catch (e) {
    return;
  }

  const hasIndexTxt = entries.some(e => e.isFile() && e.name === 'index.txt');
  if (hasIndexTxt) {
    copyIndexTxtToSiblingTxt(current);
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      walk(path.join(current, entry.name));
    }
  }
}

(function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error('Out directory not found:', OUT_DIR);
    process.exit(0);
  }
  walk(OUT_DIR);
})();
