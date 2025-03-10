#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import consola from 'consola';
import pc from 'picocolors';

// Configuration
const PACKAGE_ROOT = resolve('.');
const PACKAGE_JSON = join(PACKAGE_ROOT, 'package.json');

// Utility function to run a command
function runCommand(command) {
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (_error) {
    consola.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

// Main function
async function prepublish() {
  consola.info(pc.bold(pc.green('Preparing Alpha CLI for publishing...')));

  try {
    // Check if the package.json exists
    const packageJson = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8'));
    consola.info(`Package name: ${packageJson.name}`);
    consola.info(`Package version: ${packageJson.version}`);

    // Run lint:fix
    consola.info(pc.cyan('\n=== Running Lint Fix ==='));
    runCommand('npm run lint:fix');

    // Run tests
    consola.info(pc.cyan('\n=== Running Tests ==='));
    runCommand('npm run test');

    // Build the package
    consola.info(pc.cyan('\n=== Building Package ==='));
    runCommand('npm run build');

    // Check if the dist directory exists
    consola.info(pc.cyan('\n=== Checking Build Output ==='));
    runCommand('ls -la dist');

    // Check if the bin directory exists
    consola.info(pc.cyan('\n=== Checking Bin Output ==='));
    runCommand('ls -la bin');

    consola.success(pc.bold(pc.green('\nPackage is ready for publishing!')));
    consola.info(pc.cyan('To publish to npm, run:'));
    consola.info(`  ${pc.gray('npm publish')}`);
    consola.info(pc.cyan('To publish to JSR, run:'));
    consola.info(`  ${pc.gray('npx jsr publish')}`);
  } catch (error) {
    consola.error('An error occurred during prepublish:', error);
    process.exit(1);
  }
}

// Run the prepublish script
prepublish();
