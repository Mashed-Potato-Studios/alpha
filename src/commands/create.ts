import { defineCommand } from 'citty';
import consola from 'consola';
import { resolve, join } from 'pathe';
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  readFileSync,
} from 'fs';
import pc from 'picocolors';
import { execSync } from 'child_process';
import { downloadTemplate } from 'giget';
import { getTemplateNames, templates } from '../templates';
// Import the new prompts utility instead of createInterface
import { selectFromOptions, promptConfirm } from '../utils/prompts';

// Remove the old selectFromList function as we'll use the new prompts utility

export const createCommand = defineCommand({
  meta: {
    name: 'create',
    description: 'Create a new Nuxt layer',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Name of the layer to create',
      required: true,
    },
    'output-dir': {
      type: 'string',
      description: 'Directory where the layer will be created',
      default: './',
    },
    template: {
      type: 'string',
      description: 'Template to use for creating the layer',
      default: 'basic',
      options: getTemplateNames(),
    },
    'git-template': {
      type: 'string',
      description:
        'Git repository template URL to use (e.g., "github:user/repo")',
    },
    'custom-template': {
      type: 'string',
      description: 'Custom template path or URL to use',
    },
    description: {
      type: 'string',
      description: 'Description of the layer',
      default: 'A Nuxt layer',
    },
    'package-manager': {
      type: 'string',
      description: 'Package manager to use for initialization',
      default: 'npm',
      options: ['npm', 'yarn', 'pnpm'],
    },
    'skip-install': {
      type: 'boolean',
      description: 'Skip installing dependencies',
      default: false,
    },
    'skip-git': {
      type: 'boolean',
      description: 'Skip Git initialization',
      default: false,
    },
    'giget-provider': {
      type: 'string',
      description: 'Provider for giget (github, gitlab, etc.)',
      default: 'github',
    },
    'use-nuxi-template': {
      type: 'boolean',
      description: 'Use the official Nuxt layer template',
      default: false,
    },
  },
  run: async ({ args }) => {
    const {
      name,
      'output-dir': outputDir,
      template: initialTemplate,
      'git-template': gitTemplate,
      'custom-template': customTemplate,
      description,
      'package-manager': packageManager,
      'skip-install': skipInstall,
      'skip-git': skipGit,
      'giget-provider': gigetProvider,
      'use-nuxi-template': useNuxiTemplate,
    } = args;

    // If no template is specified and not using nuxi template or git template, show selection interface
    let template = initialTemplate;
    if (!template && !useNuxiTemplate && !gitTemplate && !customTemplate) {
      const templateNames = getTemplateNames();
      const templateDescriptions: Record<string, string> = {
        basic: 'A basic Nuxt layer with minimal setup',
        auth: 'Authentication layer with login/register functionality',
        ui: 'UI components and styling utilities',
        api: 'API integration and data fetching utilities',
        convex: 'Real-time database with Convex integration',
        neon: 'Serverless Postgres database with Neon integration',
      };

      // Use the new prompts utility instead of the custom readline implementation
      const selectedTemplate = await selectFromOptions(
        templateNames,
        'Select a template for your Nuxt layer:',
        templateDescriptions
      );

      if (!selectedTemplate) {
        consola.info('Layer creation cancelled.');
        process.exit(0);
      }

      template = selectedTemplate;
      consola.info(`Using template: ${pc.cyan(template)}`);
    } else {
      template = initialTemplate;
    }

    // Sanitize the name for directory creation
    const sanitizedName = name
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();

    // Ensure the name is valid for npm package
    const fullName = name.startsWith('@')
      ? name
      : name.includes('/')
        ? name
        : sanitizedName;

    // Resolve the output directory
    const resolvedOutputDir = resolve(process.cwd(), outputDir, sanitizedName);

    // Check if the directory already exists
    if (existsSync(resolvedOutputDir)) {
      const files = readdirSync(resolvedOutputDir);
      if (files.length > 0) {
        // Use promptConfirm for better UX when directory exists
        const shouldContinue = await promptConfirm(
          `Directory ${pc.yellow(
            resolvedOutputDir
          )} already exists and is not empty. Continue anyway?`,
          false
        );

        if (!shouldContinue) {
          consola.info('Layer creation cancelled.');
          process.exit(0);
        }
      }
    }

    try {
      // If using the official Nuxt layer template
      if (useNuxiTemplate) {
        consola.info('Creating layer using official Nuxt layer template');

        // Create the directory if it doesn't exist
        if (!existsSync(resolvedOutputDir)) {
          mkdirSync(resolvedOutputDir, { recursive: true });
        }

        // Use npm create nuxt@latest -t layer
        const createCommand = `${packageManager} create nuxt@latest -t layer ${resolvedOutputDir} --no-git`;

        consola.info(`Running: ${pc.cyan(createCommand)}`);
        execSync(createCommand, { stdio: 'inherit' });

        // Update package.json with the provided name and description
        updatePackageJson(resolvedOutputDir, fullName, description);

        // Initialize Git if not skipped
        if (!skipGit) {
          initializeGit(resolvedOutputDir);
        }

        consola.success(
          `Nuxt layer ${pc.green(
            fullName
          )} created successfully using the official Nuxt layer template!`
        );
        consola.info('To get started, run:');
        console.log('');
        console.log(`  ${pc.cyan('cd')} ${outputDir}/${sanitizedName}`);
        if (skipInstall) {
          console.log(
            `  ${pc.cyan(
              packageManager === 'npm'
                ? 'npm install'
                : packageManager === 'yarn'
                  ? 'yarn'
                  : 'pnpm install'
            )}`
          );
        }
        console.log(
          `  ${pc.cyan(
            packageManager === 'npm'
              ? 'npm run dev'
              : packageManager === 'yarn'
                ? 'yarn dev'
                : 'pnpm dev'
          )}`
        );
        console.log('');
        return;
      }

      // Create the directory
      mkdirSync(resolvedOutputDir, { recursive: true });
      consola.success(`Created directory: ${pc.green(resolvedOutputDir)}`);

      // Determine how to create the layer
      if (gitTemplate) {
        await createLayerFromGitTemplate(
          gitTemplate,
          resolvedOutputDir,
          fullName,
          description
        );
      } else if (customTemplate) {
        await createLayerFromCustomTemplate(
          customTemplate,
          gigetProvider,
          resolvedOutputDir,
          fullName,
          description
        );
      } else {
        // Use built-in template
        createLayerFromTemplate(
          resolvedOutputDir,
          fullName,
          description,
          template
        );
      }

      // Initialize Git if not skipped
      if (!skipGit) {
        initializeGit(resolvedOutputDir);
      }

      // Install dependencies if not skipped
      if (!skipInstall) {
        installDependencies(resolvedOutputDir, packageManager);
      }

      consola.success(`Nuxt layer ${pc.green(fullName)} created successfully!`);
      consola.info('To get started, run:');
      console.log('');
      console.log(`  ${pc.cyan('cd')} ${outputDir}/${sanitizedName}`);
      if (skipInstall) {
        console.log(
          `  ${pc.cyan(
            packageManager === 'npm'
              ? 'npm install'
              : packageManager === 'yarn'
                ? 'yarn'
                : 'pnpm install'
          )}`
        );
      }
      console.log(
        `  ${pc.cyan(
          packageManager === 'npm'
            ? 'npm run dev'
            : packageManager === 'yarn'
              ? 'yarn dev'
              : 'pnpm dev'
        )}`
      );
      console.log('');
    } catch (_error) {
      consola.error(`Failed to create Nuxt layer: ${_error}`);
      process.exit(1);
    }
  },
});

/**
 * Create a layer from a Git template using giget
 */
async function createLayerFromGitTemplate(
  gitTemplate: string,
  outputDir: string,
  name: string,
  description: string
) {
  consola.info(`Creating layer from Git template: ${pc.cyan(gitTemplate)}`);

  try {
    // Download the template using giget
    await downloadTemplate(gitTemplate, {
      dir: outputDir,
      force: true,
    });

    consola.success(`Downloaded template from ${gitTemplate}`);

    // Update the package.json with the new name and description
    updatePackageJson(outputDir, name, description);

    return true;
  } catch (_error) {
    consola.error(`Failed to download template from ${gitTemplate}: ${_error}`);
    throw _error;
  }
}

/**
 * Create a layer from a custom template (could be a local path or remote URL)
 */
async function createLayerFromCustomTemplate(
  customTemplate: string,
  provider: string,
  outputDir: string,
  name: string,
  description: string
) {
  consola.info(
    `Creating layer from custom template: ${pc.cyan(customTemplate)}`
  );

  try {
    // Check if it's a local path
    if (existsSync(customTemplate) && !customTemplate.includes(':')) {
      // It's a local path, copy the files
      const files = readdirSync(customTemplate, { withFileTypes: true });

      for (const file of files) {
        if (file.name === 'node_modules' || file.name === '.git') {
          continue;
        }

        // Copy files or directories
        if (file.isDirectory()) {
          execSync(
            `cp -R "${join(customTemplate, file.name)}" "${join(
              outputDir,
              file.name
            )}"`
          );
        } else {
          execSync(
            `cp "${join(customTemplate, file.name)}" "${join(
              outputDir,
              file.name
            )}"`
          );
        }
      }

      consola.success(`Copied template from ${customTemplate}`);
    } else {
      // It's a remote URL, use giget
      const template = customTemplate.includes(':')
        ? customTemplate
        : `${provider}:${customTemplate}`;

      await downloadTemplate(template, {
        dir: outputDir,
        force: true,
      });

      consola.success(`Downloaded template from ${template}`);
    }

    // Update the package.json with the new name and description
    updatePackageJson(outputDir, name, description);

    return true;
  } catch (_error) {
    consola.error(`Failed to use custom template ${customTemplate}: ${_error}`);
    throw _error;
  }
}

/**
 * Create a layer using one of the built-in templates
 */
function createLayerFromTemplate(
  outputDir: string,
  name: string,
  description: string,
  templateName: string
) {
  consola.info(`Creating layer using template: ${pc.cyan(templateName)}`);

  // Get the specified template
  const template = templates[templateName];

  if (!template) {
    consola.error(`Template '${templateName}' not found`);
    process.exit(1);
  }

  // Create the base layer structure
  createLayerStructure(outputDir, name, description, template.dependencies);

  // Apply the template-specific files
  template.createTemplateFiles(outputDir);

  // Run any post-setup functions if provided
  if (template.postSetup) {
    template.postSetup(outputDir, name, description);
  }

  consola.success(`Applied template: ${pc.green(templateName)}`);
}

/**
 * Update package.json with the new name and description
 */
function updatePackageJson(
  outputDir: string,
  name: string,
  description: string
) {
  const packageJsonPath = join(outputDir, 'package.json');

  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      packageJson.name = name;
      packageJson.description = description;

      // Reset version to 0.1.0
      packageJson.version = '0.1.0';

      writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n'
      );

      consola.success('Updated package.json with new name and description');
    } catch (_error) {
      consola.warn(`Could not update package.json: ${_error}`);
    }
  } else {
    consola.warn(
      'No package.json found in the template. Creating a basic one.'
    );

    const packageJson = {
      name,
      version: '0.1.0',
      description,
      type: 'module',
      main: './nuxt.config.ts',
      scripts: {
        dev: 'nuxi dev playground',
        build: 'nuxi build playground',
        generate: 'nuxi generate playground',
        preview: 'nuxi preview playground',
        lint: 'eslint .',
        prepare: 'nuxi prepare playground',
      },
      dependencies: {},
      devDependencies: {
        '@nuxt/module-builder': '^0.5.0',
        '@nuxt/schema': '^3.7.0',
        nuxt: '^3.7.0',
        typescript: '^5.2.2',
        vitest: '^0.34.3',
      },
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    consola.success('Created new package.json');
  }
}

/**
 * Create the base layer structure
 */
function createLayerStructure(
  outputDir: string,
  name: string,
  description: string,
  dependencies: Record<string, string>
) {
  consola.info('Creating layer structure');

  // Create directories
  mkdirSync(join(outputDir, 'components'), { recursive: true });
  mkdirSync(join(outputDir, 'composables'), { recursive: true });
  mkdirSync(join(outputDir, 'utils'), { recursive: true });
  mkdirSync(join(outputDir, 'plugins'), { recursive: true });
  mkdirSync(join(outputDir, 'server'), { recursive: true });
  mkdirSync(join(outputDir, 'runtime'), { recursive: true });
  mkdirSync(join(outputDir, 'playground'), { recursive: true });

  // Create package.json
  const packageJson = {
    name,
    version: '0.1.0',
    description,
    type: 'module',
    main: './nuxt.config.ts',
    scripts: {
      dev: 'nuxi dev playground',
      build: 'nuxi build playground',
      generate: 'nuxi generate playground',
      preview: 'nuxi preview playground',
      lint: 'eslint .',
      prepare: 'nuxi prepare playground',
    },
    dependencies: {
      ...dependencies,
    },
    devDependencies: {
      '@nuxt/eslint-config': '^0.2.0',
      eslint: '^8.49.0',
      nuxt: '^3.7.4',
    },
  };

  writeFileSync(
    join(outputDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create README.md
  const readme = `# ${name}

${description}

## Setup

\`\`\`bash
# npm
npm install ${name}

# yarn
yarn add ${name}

# pnpm
pnpm add ${name}
\`\`\`

## Usage

Add the layer to your \`nuxt.config.ts\`:

\`\`\`ts
export default defineNuxtConfig({
  extends: ['${name}']
})
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`
`;

  writeFileSync(join(outputDir, 'README.md'), readme);

  // Create playground/app.vue
  const playgroundApp = `<template>
  <div>
    <h1>Welcome to ${name} playground!</h1>
    <p>This is a playground for testing the ${name} layer.</p>
  </div>
</template>
`;

  writeFileSync(join(outputDir, 'playground', 'app.vue'), playgroundApp);

  // Create playground/nuxt.config.ts
  const playgroundConfig = `
export default defineNuxtConfig({
  extends: ['..'],
  // Additional configuration specific to the playground
})
`;

  writeFileSync(
    join(outputDir, 'playground', 'nuxt.config.ts'),
    playgroundConfig
  );

  // Create .gitignore
  const gitignore = `
# Dependencies
node_modules

# Logs
*.log*

# Temp directories
.temp
.tmp
.cache

# Nuxt
.nuxt
.output
.vercel_build_output
.build-*
.env
.netlify

# Testing
coverage
.nyc_output

# VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
!.vscode/*.code-snippets

# Intellij idea
*.iml
.idea

# OSX
.DS_Store
.AppleDouble
.LSOverride
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk
`;

  writeFileSync(join(outputDir, '.gitignore'), gitignore);

  consola.success('Layer structure created successfully');
}

/**
 * Initialize Git repository in the output directory
 */
function initializeGit(outputDir: string) {
  try {
    consola.info('Initializing Git repository...');
    execSync('git init', { cwd: outputDir, stdio: 'ignore' });
    consola.success('Git repository initialized');
  } catch (_error) {
    consola.warn(
      'Failed to initialize Git repository. Continuing without Git.'
    );
  }
}

/**
 * Install dependencies using the specified package manager
 */
function installDependencies(outputDir: string, packageManager: string) {
  try {
    consola.info(`Installing dependencies using ${packageManager}...`);

    let command = '';
    switch (packageManager) {
    case 'npm':
      command = 'npm install';
      break;
    case 'yarn':
      command = 'yarn';
      break;
    case 'pnpm':
      command = 'pnpm install';
      break;
    default:
      command = 'npm install';
    }

    execSync(command, { cwd: outputDir, stdio: 'inherit' });
    consola.success('Dependencies installed successfully');
  } catch (_error) {
    consola.error(
      'Failed to install dependencies. You can install them manually later.'
    );
  }
}
