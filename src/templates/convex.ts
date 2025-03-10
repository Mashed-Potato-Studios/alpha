import { join } from 'pathe';
import { writeFileSync, mkdirSync } from 'fs';
import { TemplateDefinition } from './index';

export const convexTemplate: TemplateDefinition = {
  dependencies: {
    '@convex-vue/core': '^0.0.4',
    '@vueuse/core': '^10.7.0',
    convex: '^1.5.0',
  },

  createTemplateFiles: (outputDir: string) => {
    // Create Convex plugin
    const pluginContent = `
import { defineNuxtPlugin } from '#app';
import { createConvexVue } from '@convex-vue/core';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  if (!config.public.convex?.url) {
    console.warn('CONVEX_URL is not set. Convex client will not be initialized properly.');
    return;
  }
  
  // Create Convex Vue integration
  const convexVue = createConvexVue({
    convexUrl: config.public.convex.url,
  });
  
  // Use the Convex Vue plugin
  nuxtApp.vueApp.use(convexVue);
});
`;

    // Ensure plugins directory exists
    mkdirSync(join(outputDir, 'plugins'), { recursive: true });
    writeFileSync(join(outputDir, 'plugins', 'convex.ts'), pluginContent);

    // Create Convex directory structure
    mkdirSync(join(outputDir, 'convex'), { recursive: true });
    mkdirSync(join(outputDir, 'convex', '_generated'), { recursive: true });
    mkdirSync(join(outputDir, 'convex', 'schema'), { recursive: true });

    // Create schema.ts
    const schemaContent = `
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    userId: v.optional(v.string()),
    createdAt: v.number(),
  }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
  }).index("by_token", ["tokenIdentifier"]),
});
`;

    writeFileSync(join(outputDir, 'convex', 'schema.ts'), schemaContent);

    // Create tasks.ts (queries)
    const queriesContent = `
import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return await ctx.db.query("tasks").collect();
    }
    return await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});
`;

    writeFileSync(join(outputDir, 'convex', 'tasks.ts'), queriesContent);

    // Create mutations.ts
    const mutationsContent = `
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { text: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      text: args.text,
      isCompleted: false,
      userId: args.userId ?? "anonymous",
      createdAt: Date.now(),
    });
    return taskId;
  },
});

export const toggleComplete = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    await ctx.db.patch(args.id, {
      isCompleted: !task.isCompleted,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
`;

    writeFileSync(join(outputDir, 'convex', 'mutations.ts'), mutationsContent);

    // Create components
    mkdirSync(join(outputDir, 'components'), { recursive: true });

    // Create ConvexTaskList.vue
    const taskListComponent = `
<script setup>
import { useConvexQuery, useConvexMutation } from '@convex-vue/core';
import { api } from '../convex/_generated/api';

const { data: tasks, isLoading } = useConvexQuery(api.tasks.get);
const toggleComplete = useConvexMutation(api.mutations.toggleComplete);
const removeTask = useConvexMutation(api.mutations.remove);

const handleToggle = (id) => {
  toggleComplete.mutate({ id });
};

const handleDelete = (id) => {
  removeTask.mutate({ id });
};
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Tasks</h2>
    <div v-if="isLoading">Loading tasks...</div>
    <div v-else-if="!tasks || tasks.length === 0">No tasks yet.</div>
    <ul v-else class="space-y-2">
      <li v-for="task in tasks" :key="task._id" class="flex items-center gap-2 p-2 border rounded">
        <input 
          type="checkbox" 
          :checked="task.isCompleted" 
          @change="handleToggle(task._id)" 
        />
        <span :class="{ 'line-through': task.isCompleted }">{{ task.text }}</span>
        <button @click="handleDelete(task._id)" class="ml-auto text-red-500">Delete</button>
      </li>
    </ul>
  </div>
</template>
`;

    writeFileSync(
      join(outputDir, 'components', 'ConvexTaskList.vue'),
      taskListComponent
    );

    // Create ConvexTaskForm.vue
    const taskFormComponent = `
<script setup>
import { ref } from 'vue';
import { useConvexMutation } from '@convex-vue/core';
import { api } from '../convex/_generated/api';

const taskText = ref('');
const createTask = useConvexMutation(api.mutations.create);

const addTask = () => {
  if (!taskText.value.trim()) return;
  
  createTask.mutate({ text: taskText.value })
    .then(() => {
      taskText.value = '';
    })
    .catch(error => {
      console.error('Failed to create task:', error);
    });
};
</script>

<template>
  <form @submit.prevent="addTask" class="flex gap-2 mb-4">
    <input 
      v-model="taskText" 
      type="text" 
      placeholder="Add a new task..." 
      class="flex-1 p-2 border rounded"
      :disabled="createTask.isLoading"
    />
    <button 
      type="submit" 
      class="px-4 py-2 bg-blue-500 text-white rounded" 
      :disabled="createTask.isLoading || !taskText.trim()"
    >
      {{ createTask.isLoading ? 'Adding...' : 'Add' }}
    </button>
  </form>
</template>
`;

    writeFileSync(
      join(outputDir, 'components', 'ConvexTaskForm.vue'),
      taskFormComponent
    );

    // Create ConvexDemo.vue
    const demoComponent = `
<script setup>
// Main demo component that combines the task form and list
</script>

<template>
  <div class="p-4 border rounded max-w-lg mx-auto my-8">
    <h1 class="text-2xl font-bold mb-4">Convex Tasks Demo</h1>
    <ConvexTaskForm />
    <ConvexTaskList />
  </div>
</template>
`;

    writeFileSync(
      join(outputDir, 'components', 'ConvexDemo.vue'),
      demoComponent
    );

    // Create composables
    mkdirSync(join(outputDir, 'composables'), { recursive: true });

    // Create useConvexTasks.ts
    const tasksComposable = `
import { useConvexQuery, useConvexMutation } from '@convex-vue/core';
import { api } from '../convex/_generated/api';
import { ref, computed } from 'vue';

export function useConvexTasks() {
  const { data: tasks, isLoading } = useConvexQuery(api.tasks.get);
  const createTask = useConvexMutation(api.mutations.create);
  const toggleComplete = useConvexMutation(api.mutations.toggleComplete);
  const removeTask = useConvexMutation(api.mutations.remove);
  
  const newTaskText = ref('');
  
  const completedTasks = computed(() => 
    tasks.value?.filter(task => task.isCompleted) || []
  );
  
  const pendingTasks = computed(() => 
    tasks.value?.filter(task => !task.isCompleted) || []
  );
  
  const addTask = async () => {
    if (!newTaskText.value.trim()) return;
    
    await createTask.mutate({ text: newTaskText.value });
    newTaskText.value = '';
  };
  
  return {
    tasks,
    isLoading,
    newTaskText,
    completedTasks,
    pendingTasks,
    addTask,
    toggleTask: (id) => toggleComplete.mutate({ id }),
    deleteTask: (id) => removeTask.mutate({ id }),
  };
}
`;

    writeFileSync(
      join(outputDir, 'composables', 'useConvexTasks.ts'),
      tasksComposable
    );

    // Create useConvexAuth.ts
    const authComposable = `
import { ref } from 'vue';

export function useConvexAuth() {
  const user = ref(null);
  const isLoading = ref(true);
  const error = ref(null);

  // This is a simplified version - in a real app you would integrate with an auth provider
  
  return {
    user,
    isLoading,
    error,
    login: () => {
      // Implement login logic
    },
    logout: () => {
      // Implement logout logic
    }
  };
}
`;

    writeFileSync(
      join(outputDir, 'composables', 'useConvexAuth.ts'),
      authComposable
    );

    // Create SETUP.md
    const setupGuideMd = `# Setting up Convex with Nuxt

This guide will help you set up and use Convex with your Nuxt application.

## Prerequisites

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Install the Convex CLI: \`npm install -g convex\`

## Getting Started

### 1. Initialize your Convex project

\`\`\`bash
npx convex init
\`\`\`

This will create a Convex deployment and provide you with a deployment URL.

### 2. Set up your environment variables

Create a \`.env\` file in your project root:

\`\`\`
CONVEX_URL=your_deployment_url_here
\`\`\`

### 3. Push your schema to Convex

\`\`\`bash
npx convex push
\`\`\`

## Working with Convex

### Using the composables

\`\`\`vue
<script setup>
import { useConvexQuery, useConvexMutation } from '@convex-vue/core';
import { api } from '../convex/_generated/api';

// Query data
const { data: tasks } = useConvexQuery(api.tasks.get);

// Mutate data
const createTask = useConvexMutation(api.mutations.create);
createTask.mutate({ text: 'New task' });
</script>
\`\`\`

### Adding authentication

Convex works with various auth providers like Clerk, Auth0, and more. Check the Convex documentation for integration guides.

## Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex + Vue Guide](https://docs.convex.dev/vue)
- [Convex Discord Community](https://discord.com/invite/convex)
`;

    mkdirSync(join(outputDir, 'docs'), { recursive: true });
    writeFileSync(join(outputDir, 'docs', 'SETUP.md'), setupGuideMd);
  },

  postSetup: (outputDir: string, name: string, description: string) => {
    // Update nuxt.config.ts to include Convex setup
    const nuxtConfig = `
export default defineNuxtConfig({
  // Layer configuration
  runtimeConfig: {
    // Runtime configuration for the layer
    public: {
      convex: {
        // Public runtime configuration
        url: process.env.CONVEX_URL || '',
      }
    }
  },
  
  // Auto-import components
  components: [
    { path: './components' }
  ],
  
  // Add Convex plugin
  plugins: [
    './plugins/convex'
  ],
  
  // Additional modules or configuration
  modules: []
})`;

    writeFileSync(join(outputDir, 'nuxt.config.ts'), nuxtConfig);

    // Create convex.json
    const convexConfig = {
      project: name.replace(/^nuxt-/, ''),
      functions: './convex',
      origin: 'https://relaxed-swan-82.convex.cloud',
    };

    writeFileSync(
      join(outputDir, 'convex.json'),
      JSON.stringify(convexConfig, null, 2)
    );

    // Update README.md with Convex-specific instructions
    const readmeMd = `# ${name}

${description}

## Features

- Seamless integration with Convex backend
- Ready-to-use components for common Convex operations
- Composables for querying and mutating Convex data
- Authentication helpers

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

Create a \`.env\` file with your Convex deployment URL:

\`\`\`
CONVEX_URL=your_deployment_url_here
\`\`\`

### Initialize Convex

\`\`\`bash
npx convex init
npx convex push
\`\`\`

## Components

This layer provides the following components:

- \`ConvexTaskList\`: Display a list of tasks from Convex
- \`ConvexTaskForm\`: Form for creating new tasks
- \`ConvexDemo\`: Complete demo combining the above components

## Composables

- \`useConvexTasks\`: Comprehensive composable for task management
- \`useConvexAuth\`: Handle authentication with Convex

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

See the [Convex documentation](https://docs.convex.dev) for more information.
`;

    writeFileSync(join(outputDir, 'README.md'), readmeMd);
  },
};
