import { join } from 'pathe';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { TemplateDefinition } from './index';

export const neonTemplate: TemplateDefinition = {
  dependencies: {
    '@neondatabase/serverless': '^0.6.0',
    pg: '^8.11.3',
    'drizzle-orm': '^0.28.6',
    'drizzle-kit': '^0.19.13',
    dotenv: '^16.3.1',
  },

  createTemplateFiles: (outputDir: string) => {
    // Create Neon plugin
    const pluginContent = `
import { defineNuxtPlugin } from '#app';
import { Pool } from 'pg';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  if (!config.neon || !config.neon.connectionString) {
    console.warn('NEON_CONNECTION_STRING is not set. Neon database will not be initialized properly.');
    return;
  }
  
  // Create a connection pool
  const sql = neon(config.neon.connectionString);
  const db = drizzle(sql);
  
  // Provide the database client to the application
  return {
    provide: {
      neonDb: db,
      neonSql: sql,
    }
  };
});
`;

    // Ensure plugins directory exists
    mkdirSync(join(outputDir, 'plugins'), { recursive: true });
    writeFileSync(join(outputDir, 'plugins', 'neon.ts'), pluginContent);

    // Create db directory structure
    mkdirSync(join(outputDir, 'db'), { recursive: true });
    mkdirSync(join(outputDir, 'db', 'schema'), { recursive: true });

    // Create db/index.ts
    const dbIndexContent = `
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema/schema';

// For client-side usage, import and use this
export const createNeonClient = (connectionString: string) => {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
};

// For server-side usage in Nuxt server routes
export const createPoolClient = (connectionString: string) => {
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString });
  return pool;
};
`;

    writeFileSync(join(outputDir, 'db', 'index.ts'), dbIndexContent);

    // Create db/schema/schema.ts
    const schemaContent = `
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

// Example User table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Example Post table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  published: boolean('published').default(false).notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
`;

    writeFileSync(join(outputDir, 'db', 'schema', 'schema.ts'), schemaContent);

    // Create drizzle.config.ts
    const drizzleConfigContent = `
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './db/schema/*',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.NEON_CONNECTION_STRING || '',
  },
} satisfies Config;
`;

    writeFileSync(join(outputDir, 'drizzle.config.ts'), drizzleConfigContent);

    // Create server directory
    mkdirSync(join(outputDir, 'server'), { recursive: true });
    mkdirSync(join(outputDir, 'server', 'api'), { recursive: true });

    // Create server/api/db-status.ts
    const dbStatusApiContent = `
import { createPoolClient } from '../../db';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  if (!config.neon?.connectionString) {
    return {
      status: 'error',
      message: 'Database connection string not configured'
    };
  }
  
  try {
    const pool = createPoolClient(config.neon.connectionString);
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT NOW()');
      return {
        status: 'connected',
        timestamp: result.rows[0].now,
        message: 'Successfully connected to Neon database'
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      status: 'error',
      message: \`Failed to connect to database: \${error.message}\`
    };
  }
});
`;

    writeFileSync(
      join(outputDir, 'server', 'api', 'db-status.ts'),
      dbStatusApiContent
    );

    // Create server/config.ts
    const serverConfigContent = `
import { createPoolClient } from '../db';

export const useNeonPool = () => {
  const config = useRuntimeConfig();
  
  if (!config.neon?.connectionString) {
    throw new Error('NEON_CONNECTION_STRING is not configured');
  }
  
  return createPoolClient(config.neon.connectionString);
};
`;

    writeFileSync(join(outputDir, 'server', 'config.ts'), serverConfigContent);

    // Create scripts directory
    mkdirSync(join(outputDir, 'scripts'), { recursive: true });

    // Create scripts/setup-db.ts
    const setupDbContent = `
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import * as dotenv from 'dotenv';
import * as schema from '../db/schema/schema';

dotenv.config();

async function main() {
  const connectionString = process.env.NEON_CONNECTION_STRING;
  
  if (!connectionString) {
    console.error('NEON_CONNECTION_STRING is not set');
    process.exit(1);
  }
  
  console.log('Connecting to Neon database...');
  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });
  
  console.log('Running migrations...');
  // Uncomment when you have migrations
  // await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Inserting sample data...');
  
  // Insert sample users
  const users = await db.insert(schema.users).values([
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123', // In a real app, hash this!
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password456', // In a real app, hash this!
    },
  ]).returning();
  
  console.log('Inserted users:', users);
  
  // Insert sample posts
  const posts = await db.insert(schema.posts).values([
    {
      title: 'Getting Started with Neon',
      content: 'Neon is a serverless PostgreSQL database that scales automatically.',
      published: true,
      authorId: users[0].id,
    },
    {
      title: 'Using Drizzle ORM with Neon',
      content: 'Drizzle ORM provides a type-safe way to interact with your database.',
      published: true,
      authorId: users[0].id,
    },
    {
      title: 'Draft Post',
      content: 'This is a draft post that is not published yet.',
      published: false,
      authorId: users[1].id,
    },
  ]).returning();
  
  console.log('Inserted posts:', posts);
  
  console.log('Database setup complete!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error setting up database:', error);
  process.exit(1);
});
`;

    writeFileSync(join(outputDir, 'scripts', 'setup-db.ts'), setupDbContent);

    // Create composables directory
    mkdirSync(join(outputDir, 'composables'), { recursive: true });

    // Create composables/useNeonDb.ts
    const neonDbComposable = `
import { useNuxtApp } from '#app';
import { ref, computed } from 'vue';

export function useNeonDb() {
  const { $neonDb, $neonSql } = useNuxtApp();
  
  if (!$neonDb || !$neonSql) {
    console.warn('Neon database client not available. Make sure NEON_CONNECTION_STRING is set.');
  }
  
  return {
    db: $neonDb,
    sql: $neonSql,
    
    // Helper function to execute a query with error handling
    async query(queryFn) {
      try {
        return {
          data: await queryFn($neonDb),
          error: null
        };
      } catch (error) {
        console.error('Database query error:', error);
        return {
          data: null,
          error
        };
      }
    }
  };
}
`;

    writeFileSync(
      join(outputDir, 'composables', 'useNeonDb.ts'),
      neonDbComposable
    );

    // Create components directory
    mkdirSync(join(outputDir, 'components'), { recursive: true });

    // Create components/NeonUsersList.vue
    const usersListComponent = `
<script setup>
import { ref, onMounted } from 'vue';
import { useNeonDb } from '../composables/useNeonDb';

const { db, query } = useNeonDb();
const users = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const result = await query(db => db.query.users.findMany());
    if (result.error) {
      error.value = result.error;
    } else {
      users.value = result.data;
    }
  } catch (err) {
    error.value = err;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Users</h2>
    <div v-if="loading">Loading users...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="users.length === 0">No users found.</div>
    <ul v-else class="space-y-2">
      <li v-for="user in users" :key="user.id" class="p-3 border rounded">
        <div class="font-bold">{{ user.name }}</div>
        <div class="text-gray-600">{{ user.email }}</div>
      </li>
    </ul>
  </div>
</template>
`;

    writeFileSync(
      join(outputDir, 'components', 'NeonUsersList.vue'),
      usersListComponent
    );

    // Create .env.example
    const envExampleContent = `# Neon Database
NEON_CONNECTION_STRING=postgres://user:password@host/database
`;

    writeFileSync(join(outputDir, '.env.example'), envExampleContent);

    // Create README.md with Neon setup instructions
    const setupGuideMd = `# Setting up Neon Database with Nuxt

This guide will help you set up and use a Neon serverless Postgres database with your Nuxt application.

## Prerequisites

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project in your Neon dashboard

## Getting Started

### 1. Install the neonctl CLI

\`\`\`bash
# Using npm
npm install -g neonctl

# Using Homebrew (macOS)
brew install -g neonctl
\`\`\`

### 2. Authenticate with Neon

\`\`\`bash
neon auth
\`\`\`

### 3. Create a dedicated branch for development

\`\`\`bash
neon branches create --name dev/myname
\`\`\`

### 4. Get your connection string

\`\`\`bash
neon connection-string dev/myname
\`\`\`

### 5. Set up your environment variables

Create a \`.env\` file in your project root with:

\`\`\`
NEON_CONNECTION_STRING=your_connection_string_here
\`\`\`

### 6. Initialize your database

\`\`\`bash
npx tsx src/scripts/setup-db.ts
\`\`\`

## Working with the database

### Using the composable

\`\`\`vue
<script setup>
import { useNeonDb } from '../composables/useNeonDb';

const { db, query } = useNeonDb();

// Example query
const fetchUsers = async () => {
  const result = await query(db => db.query.users.findMany());
  const users = await db.query.users.findMany();
};
</script>
\`\`\`

### Schema migrations with Drizzle

1. Make changes to your schema files in \`db/schema/\`.

2. Generate migrations:

\`\`\`bash
npx drizzle-kit generate
\`\`\`

3. Apply migrations:

\`\`\`bash
npx drizzle-kit push
\`\`\`

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon + Node.js Guide](https://neon.tech/docs/guides/node)
`;

    mkdirSync(join(outputDir, 'docs'), { recursive: true });
    writeFileSync(join(outputDir, 'docs', 'SETUP.md'), setupGuideMd);
  },

  postSetup: (outputDir: string, name: string, description: string) => {
    // Update nuxt.config.ts to include Neon runtime config
    const nuxtConfig = `
export default defineNuxtConfig({
  // Layer configuration
  runtimeConfig: {
    // Runtime configuration for the layer
    neon: {
      // Private runtime configuration
      connectionString: process.env.NEON_CONNECTION_STRING || '',
    }
  },
  
  // Auto-import components
  components: [
    { path: './components' }
  ],
  
  // Add Neon plugin
  plugins: [
    './plugins/neon'
  ],
  
  // Additional modules or configuration
  modules: []
})`;

    writeFileSync(join(outputDir, 'nuxt.config.ts'), nuxtConfig);

    // Update package.json with scripts for database management
    const packageJsonPath = join(outputDir, 'package.json');
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

      packageJson.scripts = {
        ...packageJson.scripts,
        'db:generate': 'drizzle-kit generate',
        'db:push': 'drizzle-kit push',
        'db:studio': 'drizzle-kit studio',
        'db:setup': 'tsx scripts/setup-db.ts',
      };

      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    } catch (error) {
      console.error('Failed to update package.json:', error);
    }

    // Update README.md with Neon-specific instructions
    const readmeMd = `# ${name}

${description}

## Features

- Serverless PostgreSQL database integration with Neon
- Type-safe database access with Drizzle ORM
- Ready-to-use components for database operations
- Server API endpoints for database access
- Database migration and seeding utilities

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

### Environment Variables

Create a \`.env\` file with your Neon connection string:

\`\`\`
NEON_CONNECTION_STRING=postgres://user:password@host/database
\`\`\`

### Initialize Database

\`\`\`bash
# Set up the database with sample data
npm run db:setup

# Generate migrations
npm run db:generate

# Apply migrations
npm run db:push

# Open Drizzle Studio to manage your database
npm run db:studio
\`\`\`

## Components

This layer provides the following components:

- \`NeonUsersList\`: Display a list of users from the database

## Composables

- \`useNeonDb\`: Access the Neon database client

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

See the [Neon documentation](https://neon.tech/docs) for more information.
`;

    writeFileSync(join(outputDir, 'README.md'), readmeMd);
  },
};
