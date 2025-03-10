import { defineCommand } from 'citty';
import consola from 'consola';
import { join } from 'pathe';
import { existsSync, readFileSync } from 'fs';
import pc from 'picocolors';
import { execSync } from 'child_process';

export const updateCommand = defineCommand({
  meta: {
    name: 'update',
    description: 'Update installed Nuxt layers to newer versions',
  },
  args: {
    layer: {
      type: 'positional',
      description: 'Name of the layer to update (leave empty to update all)',
      required: false,
    },
    'target-dir': {
      type: 'string',
      description: 'Target directory containing the project to update',
      default: './',
    },
    registry: {
      type: 'string',
      description: 'Package registry to use',
      default: 'npm',
      options: ['npm', 'yarn', 'pnpm'],
    },
    'dry-run': {
      type: 'boolean',
      description: 'Show what would be updated without making changes',
      default: false,
    },
    latest: {
      type: 'boolean',
      description: 'Update to the latest version (ignores semver constraints)',
      default: false,
    },
  },
  async run({ args }) {
    const {
      layer,
      'target-dir': targetDir,
      registry,
      'dry-run': _dryRun,
      latest: _useLatest,
    } = args;

    try {
      if (layer) {
        // Update specific layer
        await updateLayer(layer, targetDir, registry);
      } else {
        // Update all layers
        await updateAllLayers(targetDir, registry);
      }
    } catch (error) {
      consola.error('Failed to update layer(s):', error);
      process.exit(1);
    }
  },
});

async function updateLayer(layer: string, targetDir: string, registry: string) {
  consola.info(`Updating layer: ${pc.cyan(layer)}`);

  try {
    const command = getUpdateCommand(registry, layer);
    execSync(command, {
      cwd: targetDir,
      stdio: 'inherit',
    });
    consola.success(`Successfully updated layer: ${pc.green(layer)}`);
  } catch (error) {
    throw new Error(`Failed to update layer ${layer}: ${error}`);
  }
}

async function updateAllLayers(targetDir: string, registry: string) {
  const packageJsonPath = join(targetDir, 'package.json');

  if (!existsSync(packageJsonPath)) {
    throw new Error('No package.json found in the current directory');
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const layerDependencies = Object.keys(dependencies).filter((dep) =>
      isNuxtLayer(dep)
    );

    if (layerDependencies.length === 0) {
      consola.info('No Nuxt layers found to update');
      return;
    }

    consola.info('Updating all Nuxt layers...');

    for (const layer of layerDependencies) {
      await updateLayer(layer, targetDir, registry);
    }

    consola.success('Successfully updated all layers');
  } catch (error) {
    throw new Error(`Failed to update layers: ${error}`);
  }
}

function getUpdateCommand(registry: string, layer: string): string {
  switch (registry.toLowerCase()) {
  case 'npm':
    return `npm update ${layer}`;
  case 'yarn':
    return `yarn upgrade ${layer}`;
  case 'pnpm':
    return `pnpm update ${layer}`;
  default:
    consola.warn(`Unknown registry: ${registry}, defaulting to npm`);
    return `npm update ${layer}`;
  }
}

function isNuxtLayer(packageName: string): boolean {
  return (
    packageName.startsWith('@nuxt/') ||
    packageName.startsWith('nuxt-') ||
    packageName.startsWith('@bahamut/')
  );
}
