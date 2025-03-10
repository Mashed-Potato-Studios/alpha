import { defineCommand, runCommand } from 'citty';
import consola from 'consola';
import { installCommand } from './commands/install';
import { listCommand } from './commands/list';
import { createCommand } from './commands/create';
import { updateCommand } from './commands/update';
import pc from 'picocolors';
import { getTemplateNames } from './templates';

const main = defineCommand({
  meta: {
    name: 'alpha',
    version: '0.1.0',
    description: 'CLI tool for managing Nuxt layers',
  },
  subCommands: {
    install: installCommand,
    list: listCommand,
    create: createCommand,
    update: updateCommand,
  },
  args: {
    verbose: {
      type: 'boolean',
      description: 'Show verbose output',
      alias: 'v',
      default: false,
    },
    silent: {
      type: 'boolean',
      description: 'Suppress all output',
      default: false,
    },
    help: {
      type: 'boolean',
      description: 'Show help',
      alias: 'h',
      default: false,
    },
    version: {
      type: 'boolean',
      description: 'Show version',
      default: false,
    },
  },
  run: async ({ args }) => {
    if (args.version) {
      console.log('alpha v0.1.0');
      return;
    }

    // Show welcome message and help if no subcommand is provided
    showBanner();
    console.log(
      `\n${pc.green('α')} ${pc.bold(
        'Alpha'
      )} - CLI tool for managing Nuxt layers\n`
    );
    console.log(
      `Usage: ${pc.cyan('alpha')} ${pc.yellow('<command>')} ${pc.gray(
        '[options]'
      )}\n`
    );
    console.log('Commands:');
    console.log(`  ${pc.yellow('install')}  Install a Nuxt layer`);
    console.log(`  ${pc.yellow('list')}     List installed Nuxt layers`);
    console.log(`  ${pc.yellow('create')}   Create a new Nuxt layer`);
    console.log(`  ${pc.yellow('update')}   Update installed Nuxt layers`);

    console.log('\nTemplates:');
    getTemplateNames().forEach((templateName) => {
      console.log(`  ${pc.magenta(templateName)}`);
    });

    console.log('\nPro Tip:');
    console.log(
      `  Use ${pc.cyan(
        'alpha create my-layer --use-nuxi-template'
      )} to create a layer using the official Nuxt layer template`
    );

    console.log('\nOptions:');
    console.log(`  ${pc.gray('-h, --help')}     Show help`);
    console.log(`  ${pc.gray('-v, --verbose')}  Show verbose output`);
    console.log(`  ${pc.gray('--version')}      Show version\n`);
    console.log(
      `Run ${pc.cyan('alpha')} ${pc.yellow('<command>')} ${pc.gray(
        '--help'
      )} for help with a specific command.\n`
    );
  },
});

function showBanner() {
  const banner = `
  ${pc.cyan('     _    _       _           ')}
  ${pc.cyan('    / \\  | |_ __ | |__   __ _ ')}
  ${pc.cyan("   / _ \\ | | '_ \\| '_ \\ / _` |")}
  ${pc.cyan('  / ___ \\| | |_) | | | | (_| |')}
  ${pc.cyan(' /_/   \\_\\_| .__/|_| |_|\\__,_|')}
  ${pc.cyan('          |_|                 ')}
  ${pc.gray('v0.1.0')}`;

  console.log(banner);
}

export async function runMain() {
  await runCommand(main, { rawArgs: process.argv.slice(2) });
}

// Allow running directly with Node.js
if (process.argv[1] === import.meta.url) {
  runMain().catch((error) => {
    consola.error(error);
    process.exit(1);
  });
}
