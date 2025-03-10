# Alpha CLI

Alpha is a powerful CLI tool for creating, installing, listing, and updating Nuxt layers in your projects. It simplifies the management of Nuxt layers with an intuitive command-line interface and interactive selection menus.

## Installation

Alpha can be accessed it through your package manager:

```bash
# Using npm
npx alpha <command>

# Using yarn
yarn alpha <command>

# Using pnpm
pnpm alpha <command>
```

## Usage

```bash
alpha <command> [options]
```

## Interactive Interface

Alpha CLI now features an interactive selection interface for a more user-friendly experience. When running commands without specifying all required arguments, Alpha will prompt you with easy-to-use selection menus:

- Use arrow keys (↑/↓) to navigate through options
- Press Enter to select an option
- Press Ctrl+C to cancel at any time

## Available Commands

### install

Install a Nuxt layer either from a local path or package registry. If no layer is specified, an interactive selection menu will display common layers to choose from.

```bash
alpha install [layer] [options]
```

**Options:**

- `--target-dir <dir>` - Directory where the layer will be installed (default: "./")
- `--registry <npm|yarn|pnpm>` - Package registry to use (default: "npm")
- `--force` - Force installation even if the layer is already installed

**Examples:**

```bash
# Launch interactive layer selection
alpha install

# Install from npm registry
alpha install nuxt-auth

# Install from a local path
alpha install /path/to/local/layer

# Install with a specific registry
alpha install nuxt-ui --registry yarn

# Force reinstallation of an existing layer
alpha install nuxt-content --force
```

### list

List all installed Nuxt layers in a project.

```bash
alpha list [options]
```

**Options:**

- `--target-dir <dir>` - Directory to check for installed layers (default: "./")
- `--format <table|json>` - Output format (default: "table")
- `--detailed` - Show detailed information about each layer

**Examples:**

```bash
# List layers in the current directory
alpha list

# List layers in another directory
alpha list --target-dir ./my-project

# Get detailed JSON output
alpha list --format json --detailed
```

### create

Create a new Nuxt layer with a predefined template or from a Git repository. If no template is specified, an interactive selection menu will display available templates.

```bash
alpha create <name> [options]
```

**Options:**

- `--output-dir <dir>` - Directory where the layer will be created (default: "./")
- `--template <basic|auth|ui|api|convex|neon>` - Built-in template to use (default: "basic")
- `--git-template <repo>` - Git repository template URL (e.g., "github:user/repo")
- `--custom-template <path|url>` - Custom template path or URL
- `--giget-provider <provider>` - Provider for giget (default: "github")
- `--description <description>` - Description of the layer (default: "A Nuxt layer")
- `--package-manager <npm|yarn|pnpm>` - Package manager to use (default: "npm")
- `--skip-install` - Skip installing dependencies
- `--skip-git` - Skip Git initialization
- `--use-nuxi-template` - Use the official Nuxt layer template (recommended)

**Examples:**

```bash
# Launch interactive template selection
alpha create my-layer

# Create a basic layer using built-in template
alpha create my-layer --template basic

# Create a layer using the official Nuxt layer template (recommended)
alpha create my-layer --use-nuxi-template

# Create a Convex layer for real-time backend integration
alpha create convex-layer --template convex

# Create a Neon database layer
alpha create neon-layer --template neon

# Create a layer from a GitHub repository
alpha create my-layer --git-template github:nuxt/starter

# Create a layer from a custom template
alpha create my-layer --custom-template ./my-custom-template

# Create a layer with custom package manager and description
alpha create auth-layer --template auth --description "Authentication layer for Nuxt" --package-manager pnpm
```

### update

Update installed Nuxt layers to newer versions. If no layer is specified, an interactive selection menu will display installed layers to choose from.

```bash
alpha update [layer] [options]
```

**Options:**

- `--target-dir <dir>` - Directory containing the project to update (default: "./")
- `--registry <npm|yarn|pnpm>` - Package registry to use (default: "npm")
- `--dry-run` - Show what would be updated without making changes
- `--latest` - Update to the latest version (ignores semver constraints)

**Examples:**

```bash
# Launch interactive layer selection for update
alpha update

# Update all layers
alpha update

# Update a specific layer
alpha update nuxt-auth

# Check what would be updated without making changes
alpha update --dry-run

# Update to latest versions, ignoring semver constraints
alpha update --latest

# Update using a specific package manager
alpha update --registry pnpm
```

## Using Templates with giget

Alpha supports creating layers from Git repositories or custom templates using [giget](https://unjs.io/packages/giget). This allows you to use any repository as a template for your Nuxt layer.

### GitHub Templates

You can use any GitHub repository as a template for your layer:

```bash
# Using the git-template option (full URL format)
alpha create my-layer --git-template github:user/repo

# Using a custom template with GitHub provider
alpha create my-layer --custom-template user/repo --giget-provider github
```

### GitLab Templates

```bash
# Using GitLab
alpha create my-layer --git-template gitlab:user/repo
```

### Local Templates

You can also use a local directory as a template:

```bash
alpha create my-layer --custom-template ./path/to/template
```

When using a template, Alpha will:

1. Download or copy the template to the target directory
2. Update the package.json with your layer's name and description
3. Initialize Git (if not skipped)
4. Install dependencies (if not skipped)

## Built-in Templates

Alpha comes with several built-in templates to help you get started quickly.

### Basic Template

The default template that provides a minimal structure for a Nuxt layer.

```bash
alpha create my-layer --template basic
```

### Auth Template

A template for creating authentication layers with Supabase integration.

```bash
alpha create auth-layer --template auth
```

### UI Template

A template for creating UI component libraries as Nuxt layers.

```bash
alpha create ui-layer --template ui
```

### API Template

A template for creating API integration layers.

```bash
alpha create api-layer --template api
```

### Convex Template

The Convex template creates a Nuxt layer with [Convex](https://docs.convex.dev/home) integration, providing:

- 🔄 Real-time database with automatic syncing
- 🔐 Authentication integration
- ⚡ Serverless functions (queries, mutations, and actions)
- 🧩 Vue composables for Convex data
- 🧪 Ready-to-use components

To use it:

```bash
alpha create convex-layer --template convex
```

The generated layer includes:

- Vue plugin for Convex integration
- Example schema, queries, mutations, and actions
- Reusable components for common UI patterns
- Authentication utilities
- Comprehensive documentation

### Neon Template

The Neon template creates a Nuxt layer with [Neon Database](https://neon.tech) integration, providing:

- 🚀 Serverless Postgres database integration
- 🔄 Drizzle ORM for type-safe database operations
- 🧩 Vue composables for database access
- 📊 Example schema and database models
- 🔌 Ready-to-use plugins for Nuxt

To use it:

```bash
alpha create neon-layer --template neon
```

The generated layer includes:

- Vue plugin for Neon database integration
- Example schema with Drizzle ORM models
- Database connection utilities
- Type-safe query builders
- Server and client-side database access

## Development

To develop the Alpha CLI tool:

```bash
# Clone the repository
git clone https://github.com/your-org/bahamut.git
cd bahamut/packages/utils/alpha

# Install dependencies
npm install

# Build the CLI
npm run build

# Run in development mode
npm run dev

# Link for local testing
npm link
```

## Troubleshooting

### Common Issues

- **Permission denied**: If you encounter permission issues when running Alpha, try using `sudo` or fix your npm permissions.
- **Template not found**: Ensure you're using a valid template name or path.
- **Installation fails**: Check your network connection and package registry access.

## License

MIT License © 2023 Bahamut
