import { defineCommand } from 'citty';
import consola from 'consola';
import { resolve } from 'pathe';
import { existsSync, readFileSync } from 'fs';
import pc from 'picocolors';

export const listCommand = defineCommand({
  meta: {
    name: 'list',
    description: 'List installed Nuxt layers',
  },
  args: {
    'target-dir': {
      type: 'string',
      description: 'Target directory to check for installed layers',
      default: './',
    },
    format: {
      type: 'string',
      description: 'Output format (table, json)',
      default: 'table',
      options: ['table', 'json'],
    },
    detailed: {
      type: 'boolean',
      description: 'Show detailed information',
      default: false,
    },
  },
  run: async ({ args }) => {
    const { 'target-dir': targetDir, format, detailed } = args;

    consola.info(`Listing installed Nuxt layers in: ${pc.cyan(targetDir)}`);

    // Resolve the target directory
    const resolvedTargetDir = resolve(process.cwd(), targetDir);

    // Check if the target directory exists
    if (!existsSync(resolvedTargetDir)) {
      consola.error(`Target directory does not exist: ${resolvedTargetDir}`);
      process.exit(1);
    }

    try {
      // Get installed layers
      const layers = getInstalledLayers(resolvedTargetDir);

      if (layers.length === 0) {
        consola.info('No Nuxt layers installed');
        return;
      }

      // Output the layers based on the format
      if (format === 'json') {
        console.log(JSON.stringify(layers, null, 2));
      } else {
        // Table format output
        console.log('');
        console.log(`  ${pc.bold('Installed Nuxt Layers')}`);
        console.log('  ────────────────────────────────────────');
        layers.forEach((layer, index) => {
          console.log(
            `  ${pc.cyan(index + 1)}. ${pc.bold(layer.name)} ${pc.dim(
              `v${layer.version}`
            )}`
          );
          if (detailed) {
            console.log(
              `     ${pc.gray('Description:')} ${
                layer.description || 'No description'
              }`
            );
            console.log(`     ${pc.gray('Path:')} ${layer.path}`);
            if (
              layer.dependencies &&
              Object.keys(layer.dependencies).length > 0
            ) {
              console.log(`     ${pc.gray('Dependencies:')}`);
              Object.entries(layer.dependencies).forEach(([dep, version]) => {
                console.log(`       - ${dep}: ${version}`);
              });
            }
          }
        });
        console.log('');
        console.log(`  ${pc.gray(`Total: ${layers.length} layer(s)`)}`);
        console.log('');
      }
    } catch (_error) {
      consola.error('Failed to list installed layers');
      process.exit(1);
    }
  },
});

interface Layer {
  name: string;
  version: string;
  description?: string;
  path: string;
  dependencies?: Record<string, string>;
}

/**
 * Get installed Nuxt layers in the target directory
 */
function getInstalledLayers(targetDir: string): Layer[] {
  const layers: Layer[] = [];

  try {
    // Check if package.json exists
    const packageJsonPath = resolve(targetDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
      consola.warn(`No package.json found in: ${targetDir}`);
      return layers;
    }

    // Read package.json
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Get dependencies
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Filter for Nuxt layers
    // This is a simplified approach - in a real scenario, you might want to check
    // if the package is actually a Nuxt layer by inspecting its contents
    for (const [name, version] of Object.entries(allDependencies)) {
      if (
        name.includes('layer') ||
        name.includes('nuxt-') ||
        name.startsWith('@nuxt/') ||
        name.startsWith('@bahamut/')
      ) {
        try {
          // Try to find the package's package.json
          const layerPath = resolve(targetDir, 'node_modules', name);
          const layerPackageJsonPath = resolve(layerPath, 'package.json');

          if (existsSync(layerPackageJsonPath)) {
            const layerPackageJson = JSON.parse(
              readFileSync(layerPackageJsonPath, 'utf-8')
            );

            layers.push({
              name,
              version:
                typeof version === 'string'
                  ? version.replace(/^\^|~/, '')
                  : 'unknown',
              description: layerPackageJson.description,
              path: layerPath,
              dependencies: layerPackageJson.dependencies,
            });
          }
        } catch (error) {
          consola.debug(`Failed to read package info for: ${name}`);
        }
      }
    }

    return layers;
  } catch (error) {
    consola.error(`Failed to read package information from: ${targetDir}`);
    throw error;
  }
}
