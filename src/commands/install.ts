import { defineCommand } from 'citty';
import consola from 'consola';
import { resolve, join } from 'pathe';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import pc from 'picocolors';

export const installCommand = defineCommand({
  meta: {
    name: 'install',
    description: 'Install a Nuxt layer',
  },
  args: {
    layer: {
      type: 'positional',
      description: 'Layer name or path to install',
      required: true,
    },
    registry: {
      type: 'string',
      description: 'Package registry to use (npm, yarn, pnpm)',
      default: 'npm',
    },
  },
  async run({ args }) {
    const targetDir = process.cwd();
    const { layer, registry } = args;

    // Check if the layer is a local path or a package
    if (layer.startsWith('.') || layer.startsWith('/')) {
      await installLocalLayer(layer, targetDir);
    } else {
      await installPackageLayer(layer, targetDir, registry as string);
    }
  },
});

/**
 * Install a layer from a local directory
 */
async function installLocalLayer(layerPath: string, targetDir: string) {
  const resolvedLayerPath = resolve(process.cwd(), layerPath);

  if (!existsSync(resolvedLayerPath)) {
    consola.error(`Layer path not found: ${resolvedLayerPath}`);
    process.exit(1);
  }

  consola.info(`Copying layer files from ${resolvedLayerPath} to ${targetDir}`);

  try {
    // Check if the layer has a package.json
    const packageJsonPath = join(resolvedLayerPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      consola.warn(`No package.json found in layer: ${resolvedLayerPath}`);
      consola.warn('This might not be a valid Nuxt layer.');
    }

    // Read the target project's package.json
    const targetPackageJsonPath = join(targetDir, 'package.json');
    if (!existsSync(targetPackageJsonPath)) {
      consola.error(`No package.json found in target directory: ${targetDir}`);
      process.exit(1);
    }

    const targetPackageJson = JSON.parse(
      readFileSync(targetPackageJsonPath, 'utf-8')
    );

    // Read the layer's package.json to get dependencies
    const layerPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Add the layer as a dependency in the target project
    if (!targetPackageJson.dependencies) {
      targetPackageJson.dependencies = {};
    }

    // Use the layer's name and version from its package.json
    targetPackageJson.dependencies[
      layerPackageJson.name
    ] = `file:${resolvedLayerPath}`;

    // Write the updated package.json
    writeFileSync(
      targetPackageJsonPath,
      JSON.stringify(targetPackageJson, null, 2)
    );

    consola.success(
      `Local layer ${pc.green(layerPackageJson.name)} installed successfully`
    );
  } catch (error) {
    consola.error(`Failed to install local layer: ${error}`);
    process.exit(1);
  }
}

/**
 * Install a layer from a package registry
 */
async function installPackageLayer(
  layerPackage: string,
  targetDir: string,
  registry: string
) {
  consola.info(`Installing layer package: ${layerPackage}`);

  try {
    // Example: Using npm/yarn/pnpm to install the package
    const command = getPackageManagerCommand(registry, layerPackage);

    consola.debug(`Running command: ${command}`);
    execSync(command, {
      cwd: targetDir,
      stdio: 'inherit',
    });

    consola.success(`Layer package installed: ${layerPackage}`);
  } catch (error) {
    consola.error(`Failed to install layer package: ${layerPackage}`);
    throw error;
  }
}

/**
 * Get the appropriate package manager command based on the registry
 */
function getPackageManagerCommand(
  registry: string,
  layerPackage: string
): string {
  switch (registry.toLowerCase()) {
  case 'npm':
    return `npm install ${layerPackage}`;
  case 'yarn':
    return `yarn add ${layerPackage}`;
  case 'pnpm':
    return `pnpm add ${layerPackage}`;
  default:
    consola.warn(`Unknown registry: ${registry}, defaulting to npm`);
    return `npm install ${layerPackage}`;
  }
}
