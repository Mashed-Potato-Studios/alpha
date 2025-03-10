#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory of current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');

// Create bin directory if it doesn't exist
const binDir = path.join(packageRoot, 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

// Create the bin/alpha.js file
const binFile = path.join(binDir, 'alpha.js');
fs.writeFileSync(
  binFile,
  `#!/usr/bin/env node
import { runMain } from '../dist/index.js';

runMain().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
`,
  'utf8'
);

// Make it executable
try {
  fs.chmodSync(binFile, '755');
  console.log('✅ Successfully created bin/alpha.js');
} catch (error) {
  console.error('Error setting executable permission:', error);
}
