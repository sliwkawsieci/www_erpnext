/**
 * Script to inject GA4 tracking code into all HTML files
 * Usage: node scripts/inject-ga4.js
 */

const fs = require('fs');
const path = require('path');

const GA4_MARKER = '<!-- GA4_INJECT_HERE -->';
const GA4_CODE = fs.readFileSync(path.join(__dirname, '../partials/ga4-head.html'), 'utf8');

// Find all HTML files in root directory
const rootDir = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir)
  .filter(file => file.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files to process...\n`);

htmlFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if GA4 marker exists
  if (content.includes(GA4_MARKER)) {
    // Replace marker with GA4 code
    content = content.replace(GA4_MARKER, GA4_CODE);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Injected GA4 into: ${file}`);
  } else if (content.includes('gtag.js?id=G-E6J3XF4YDF')) {
    console.log(`⊘ Already has GA4: ${file}`);
  } else {
    console.log(`⚠ No marker found in: ${file} (add ${GA4_MARKER} in <head>)`);
  }
});

console.log('\n✅ GA4 injection complete!');
