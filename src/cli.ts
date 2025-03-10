import pc from 'picocolors';

/**
 * Help text for the Alpha CLI
 */
export const helpText = `
${pc.bold(pc.green('Alpha CLI'))} - A CLI for Nuxt layers

${pc.bold('Usage:')}
  $ alpha <command> [options]

${pc.bold('Commands:')}
  ${pc.cyan('create')}     Create a new Nuxt layer
  ${pc.cyan('install')}    Install a Nuxt layer
  ${pc.cyan('list')}       List installed Nuxt layers
  ${pc.cyan('update')}     Update installed Nuxt layers
  ${pc.cyan('help')}       Show help for a command

${pc.bold('Examples:')}
  $ alpha create my-layer
  $ alpha create my-layer --template ui
  $ alpha create my-layer --use-nuxi-template
  $ alpha install @nuxt/ui-layer
  $ alpha list
  $ alpha update

${pc.bold('Options:')}
  -h, --help     Show help
  -v, --version  Show version
`;
