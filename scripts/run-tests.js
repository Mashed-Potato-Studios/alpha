#!/usr/bin/env node

import { execSync } from 'child_process';
import consola from 'consola';
import pc from 'picocolors';

// Configuration
const TEST_TYPES = {
  INTEGRATION: 'integration',
  UNIT: 'unit',
  ALL: 'all',
};

// Parse command line arguments
const args = process.argv.slice(2);
const testType = args[0] || TEST_TYPES.ALL;

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
async function runTests() {
  consola.info(pc.bold(pc.green(`Running Alpha CLI tests (${testType})...`)));

  try {
    // Build the package first
    consola.info('Building the package...');
    runCommand('npm run build');

    // Run the appropriate tests
    if (testType === TEST_TYPES.INTEGRATION || testType === TEST_TYPES.ALL) {
      consola.info(pc.cyan('\n=== Running Integration Tests ==='));
      runCommand('node ./scripts/test.js');
    }

    if (testType === TEST_TYPES.UNIT || testType === TEST_TYPES.ALL) {
      consola.info(pc.cyan('\n=== Running Unit Tests ==='));
      runCommand('npm run unit-test');
    }

    consola.success(pc.bold(pc.green('\nAll tests completed successfully!')));
  } catch (error) {
    consola.error('An error occurred during testing:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();
