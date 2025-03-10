#!/usr/bin/env node
import { runMain } from '../dist/index.js';

runMain().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
