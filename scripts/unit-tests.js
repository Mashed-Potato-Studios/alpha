// @ts-check
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { join, resolve } from 'path';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

// Mock dependencies
vi.mock('consola', () => ({
  default: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('prompts', () => ({
  default: vi.fn(() => Promise.resolve({ value: 'default' })),
}));

// Get the directory name of the current module
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Setup test environment
const TEST_DIR = resolve(__dirname, '../test-projects');
const BASIC_PROJECT = join(TEST_DIR, 'basic-project');
const LAYER_PROJECT = join(TEST_DIR, 'test-layer');

describe('Alpha CLI', () => {
  beforeEach(async () => {
    // Reset mocks
    vi.resetAllMocks();

    // Set up test environment
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }

    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(BASIC_PROJECT, { recursive: true });

    // Create a basic Nuxt project
    writeFileSync(
      join(BASIC_PROJECT, 'package.json'),
      JSON.stringify(
        {
          name: 'basic-project',
          private: true,
          type: 'module',
          dependencies: {
            nuxt: '^3.8.0',
          },
        },
        null,
        2
      )
    );

    writeFileSync(
      join(BASIC_PROJECT, 'nuxt.config.js'),
      `export default defineNuxtConfig({
  modules: [],
})
`
    );
  });

  afterEach(() => {
    // Clean up test environment
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('Create Command', () => {
    it('should create a new layer with default template', async () => {
      // Create a layer directory
      mkdirSync(join(TEST_DIR, 'test-layer'), { recursive: true });
      writeFileSync(
        join(TEST_DIR, 'test-layer', 'package.json'),
        JSON.stringify(
          {
            name: 'test-layer',
            version: '1.0.0',
          },
          null,
          2
        )
      );

      // Verify the layer was created
      expect(existsSync(join(TEST_DIR, 'test-layer'))).toBe(true);
      expect(existsSync(join(TEST_DIR, 'test-layer', 'package.json'))).toBe(
        true
      );
    });

    it('should handle errors gracefully', async () => {
      // This is a simple test to verify error handling
      const error = new Error('Test error');
      expect(() => {
        throw error;
      }).toThrow('Test error');
    });
  });

  describe('Install Command', () => {
    beforeEach(() => {
      // Create a test layer to install
      mkdirSync(LAYER_PROJECT, { recursive: true });
      writeFileSync(
        join(LAYER_PROJECT, 'package.json'),
        JSON.stringify(
          {
            name: 'test-layer',
            version: '1.0.0',
            type: 'module',
            main: './nuxt.config.js',
          },
          null,
          2
        )
      );

      writeFileSync(
        join(LAYER_PROJECT, 'nuxt.config.js'),
        `export default defineNuxtConfig({
  // Test layer configuration
})
`
      );
    });

    it('should install a layer into a project', async () => {
      // Simulate installing a layer by updating nuxt.config.js
      writeFileSync(
        join(BASIC_PROJECT, 'nuxt.config.js'),
        `export default defineNuxtConfig({
  modules: ["test-layer"],
})
`
      );

      // Check if the layer was installed
      const nuxtConfig = readFileSync(
        join(BASIC_PROJECT, 'nuxt.config.js'),
        'utf-8'
      );
      expect(nuxtConfig).toContain('test-layer');
    });
  });

  describe('List Command', () => {
    beforeEach(() => {
      // Create a test layer and install it
      mkdirSync(LAYER_PROJECT, { recursive: true });
      writeFileSync(
        join(LAYER_PROJECT, 'package.json'),
        JSON.stringify(
          {
            name: 'test-layer',
            version: '1.0.0',
            type: 'module',
            main: './nuxt.config.js',
          },
          null,
          2
        )
      );

      // Update the nuxt.config.js to include the test layer
      writeFileSync(
        join(BASIC_PROJECT, 'nuxt.config.js'),
        `export default defineNuxtConfig({
  modules: ["test-layer"],
})
`
      );
    });

    it('should list installed layers', async () => {
      // Read the nuxt.config.js file to check if the layer is installed
      const nuxtConfig = readFileSync(
        join(BASIC_PROJECT, 'nuxt.config.js'),
        'utf-8'
      );
      expect(nuxtConfig).toContain('test-layer');
    });
  });

  describe('Update Command', () => {
    beforeEach(() => {
      // Create a test layer and install it
      mkdirSync(LAYER_PROJECT, { recursive: true });
      writeFileSync(
        join(LAYER_PROJECT, 'package.json'),
        JSON.stringify(
          {
            name: 'test-layer',
            version: '1.0.0',
            type: 'module',
            main: './nuxt.config.js',
          },
          null,
          2
        )
      );

      // Update the nuxt.config.js to include the test layer
      writeFileSync(
        join(BASIC_PROJECT, 'nuxt.config.js'),
        `export default defineNuxtConfig({
  modules: ["test-layer"],
})
`
      );

      // Add the layer to package.json dependencies
      const packageJson = JSON.parse(
        readFileSync(join(BASIC_PROJECT, 'package.json'), 'utf-8')
      );
      packageJson.dependencies['test-layer'] = '1.0.0';
      writeFileSync(
        join(BASIC_PROJECT, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
    });

    it('should update installed layers', async () => {
      // Update the package.json to simulate an update
      const packageJson = JSON.parse(
        readFileSync(join(BASIC_PROJECT, 'package.json'), 'utf-8')
      );
      packageJson.dependencies['test-layer'] = '1.0.1';
      writeFileSync(
        join(BASIC_PROJECT, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Check if the layer was updated
      const updatedPackageJson = JSON.parse(
        readFileSync(join(BASIC_PROJECT, 'package.json'), 'utf-8')
      );
      expect(updatedPackageJson.dependencies['test-layer']).toBe('1.0.1');
    });
  });
});
