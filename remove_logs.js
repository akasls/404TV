const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walk(file));
    } else {
      /* Is a file */
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let totalRemoved = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const ogLen = content.length;
  // Regex to match typical console.log statements that are purely for debugging.
  // Avoids replacing console.error or console.warn which might be useful for exceptions.
  const newContent = content.replace(/^[ \t]*console\.log\([^]*?\);?[ \t]*$/gm, '');

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf8');
    const count = content.split('console.log').length - 1;
    totalRemoved += count;
    console.log(`Removed ${count} console.logs from ${file}`);
  }
});

console.log(`Total console.logs removed: ${totalRemoved}`);
