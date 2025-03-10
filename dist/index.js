#!/usr/bin/env node
import { defineCommand, runCommand } from 'citty';
import i from 'consola';
import { resolve, join } from 'pathe';
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import l from 'picocolors';
import { downloadTemplate } from 'giget';
import de from 'prompts';

var ne=defineCommand({meta:{name:"install",description:"Install a Nuxt layer"},args:{layer:{type:"positional",description:"Layer name or path to install",required:!0},registry:{type:"string",description:"Package registry to use (npm, yarn, pnpm)",default:"npm"}},async run({args:e}){let t=process.cwd(),{layer:n,registry:o}=e;n.startsWith(".")||n.startsWith("/")?await Se(n,t):await _e(n,t,o);}});async function Se(e,t){let n=resolve(process.cwd(),e);existsSync(n)||(i.error(`Layer path not found: ${n}`),process.exit(1)),i.info(`Copying layer files from ${n} to ${t}`);try{let o=join(n,"package.json");existsSync(o)||(i.warn(`No package.json found in layer: ${n}`),i.warn("This might not be a valid Nuxt layer."));let s=join(t,"package.json");existsSync(s)||(i.error(`No package.json found in target directory: ${t}`),process.exit(1));let r=JSON.parse(readFileSync(s,"utf-8")),a=JSON.parse(readFileSync(o,"utf-8"));r.dependencies||(r.dependencies={}),r.dependencies[a.name]=`file:${n}`,writeFileSync(s,JSON.stringify(r,null,2)),i.success(`Local layer ${l.green(a.name)} installed successfully`);}catch(o){i.error(`Failed to install local layer: ${o}`),process.exit(1);}}async function _e(e,t,n){i.info(`Installing layer package: ${e}`);try{let o=Le(n,e);i.debug(`Running command: ${o}`),execSync(o,{cwd:t,stdio:"inherit"}),i.success(`Layer package installed: ${e}`);}catch(o){throw i.error(`Failed to install layer package: ${e}`),o}}function Le(e,t){switch(e.toLowerCase()){case"npm":return `npm install ${t}`;case"yarn":return `yarn add ${t}`;case"pnpm":return `pnpm add ${t}`;default:return i.warn(`Unknown registry: ${e}, defaulting to npm`),`npm install ${t}`}}var se=defineCommand({meta:{name:"list",description:"List installed Nuxt layers"},args:{"target-dir":{type:"string",description:"Target directory to check for installed layers",default:"./"},format:{type:"string",description:"Output format (table, json)",default:"table",options:["table","json"]},detailed:{type:"boolean",description:"Show detailed information",default:!1}},run:async({args:e})=>{let{"target-dir":t,format:n,detailed:o}=e;i.info(`Listing installed Nuxt layers in: ${l.cyan(t)}`);let s=resolve(process.cwd(),t);existsSync(s)||(i.error(`Target directory does not exist: ${s}`),process.exit(1));try{let r=Ie(s);if(r.length===0){i.info("No Nuxt layers installed");return}n==="json"?console.log(JSON.stringify(r,null,2)):(console.log(""),console.log(`  ${l.bold("Installed Nuxt Layers")}`),console.log("  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"),r.forEach((a,p)=>{console.log(`  ${l.cyan(p+1)}. ${l.bold(a.name)} ${l.dim(`v${a.version}`)}`),o&&(console.log(`     ${l.gray("Description:")} ${a.description||"No description"}`),console.log(`     ${l.gray("Path:")} ${a.path}`),a.dependencies&&Object.keys(a.dependencies).length>0&&(console.log(`     ${l.gray("Dependencies:")}`),Object.entries(a.dependencies).forEach(([f,x])=>{console.log(`       - ${f}: ${x}`);})));}),console.log(""),console.log(`  ${l.gray(`Total: ${r.length} layer(s)`)}`),console.log(""));}catch{i.error("Failed to list installed layers"),process.exit(1);}}});function Ie(e){let t=[];try{let n=resolve(e,"package.json");if(!existsSync(n))return i.warn(`No package.json found in: ${e}`),t;let o=JSON.parse(readFileSync(n,"utf-8")),s={...o.dependencies,...o.devDependencies};for(let[r,a]of Object.entries(s))if(r.includes("layer")||r.includes("nuxt-")||r.startsWith("@nuxt/")||r.startsWith("@bahamut/"))try{let p=resolve(e,"node_modules",r),f=resolve(p,"package.json");if(existsSync(f)){let x=JSON.parse(readFileSync(f,"utf-8"));t.push({name:r,version:typeof a=="string"?a.replace(/^\^|~/,""):"unknown",description:x.description,path:p,dependencies:x.dependencies});}}catch{i.debug(`Failed to read package info for: ${r}`);}return t}catch(n){throw i.error(`Failed to read package information from: ${e}`),n}}var re={dependencies:{},createTemplateFiles:e=>{let t=`
export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      hello: (msg: string) => \`Hello \${msg}!\`
    }
  }
})
`;mkdirSync(join(e,"src","runtime"),{recursive:!0}),writeFileSync(join(e,"src","runtime","plugin.ts"),t);let n=`
<template>
  <div class="basic-component">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Component logic here
</script>

<style scoped>
.basic-component {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
}
</style>
`;mkdirSync(join(e,"src","components"),{recursive:!0}),writeFileSync(join(e,"src","components","BasicComponent.vue"),n);let o=`
export function useBasic() {
  const count = ref(0);
  
  function increment() {
    count.value++;
  }
  
  return {
    count,
    increment
  };
}
`;mkdirSync(join(e,"src","composables"),{recursive:!0}),writeFileSync(join(e,"src","composables","useBasic.ts"),o);}};var ae={dependencies:{"@nuxtjs/supabase":"^1.0.2",zod:"^3.21.4"},createTemplateFiles:e=>{let t=`
export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      auth: {
        // Auth utilities here
      }
    }
  }
})
`;mkdirSync(join(e,"src","runtime"),{recursive:!0}),writeFileSync(join(e,"src","runtime","plugin.ts"),t);let n=`
<template>
  <div class="auth-login">
    <h2 class="text-xl font-bold mb-4">Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="mb-4">
        <label class="block mb-1">Email</label>
        <input
          type="email"
          v-model="email"
          class="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Password</label>
        <input
          type="password"
          v-model="password"
          class="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        class="w-full px-4 py-2 bg-blue-500 text-white rounded"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Login' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    // Login logic here
  } catch (error) {
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};
</script>
`;mkdirSync(join(e,"src","components"),{recursive:!0}),writeFileSync(join(e,"src","components","AuthLogin.vue"),n);let o=`
export function useAuth() {
  const user = useState('auth:user', () => null);
  const loggedIn = computed(() => !!user.value);
  
  async function login(email: string, password: string) {
    // Login implementation
  }
  
  async function logout() {
    // Logout implementation
  }
  
  return {
    user,
    loggedIn,
    login,
    logout
  };
}
`;mkdirSync(join(e,"src","composables"),{recursive:!0}),writeFileSync(join(e,"src","composables","useAuth.ts"),o);}};var ie={dependencies:{"@nuxtjs/tailwindcss":"^6.8.0"},createTemplateFiles:e=>{let t=`
export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      ui: {
        // UI utilities here
      }
    }
  }
})
`;mkdirSync(join(e,"src","runtime"),{recursive:!0}),writeFileSync(join(e,"src","runtime","plugin.ts"),t);let n=`
<template>
  <button
    :class="[
      'ui-button',
      \`ui-button--\${variant}\`,
      \`ui-button--\${size}\`,
      block && 'ui-button--block'
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'outline'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['click']);
</script>

<style>
.ui-button {
  @apply inline-flex items-center justify-center rounded font-medium transition-colors;
}

.ui-button--primary {
  @apply bg-blue-500 text-white hover:bg-blue-600;
}

.ui-button--secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}

.ui-button--outline {
  @apply bg-transparent border border-gray-300 hover:bg-gray-100;
}

.ui-button--sm {
  @apply px-3 py-1.5 text-sm;
}

.ui-button--md {
  @apply px-4 py-2;
}

.ui-button--lg {
  @apply px-5 py-2.5 text-lg;
}

.ui-button--block {
  @apply w-full;
}

.ui-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
`;mkdirSync(join(e,"src","components"),{recursive:!0}),writeFileSync(join(e,"src","components","Button.vue"),n);let o=`
export function useTheme() {
  const isDark = useState('ui:dark', () => false);
  
  function toggleTheme() {
    isDark.value = !isDark.value;
  }
  
  return {
    isDark,
    toggleTheme
  };
}
`;mkdirSync(join(e,"src","composables"),{recursive:!0}),writeFileSync(join(e,"src","composables","useTheme.ts"),o);}};var le={dependencies:{h3:"^1.7.1",ofetch:"^1.3.3"},createTemplateFiles:e=>{let t=`
import { $fetch } from 'ofetch';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  const apiFetch = $fetch.create({
    baseURL: config.public.apiBaseUrl || '/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
  });
  
  return {
    provide: {
      api: apiFetch
    }
  }
})
`;mkdirSync(join(e,"src","runtime"),{recursive:!0}),writeFileSync(join(e,"src","runtime","plugin.ts"),t),mkdirSync(join(e,"src","runtime","server","api"),{recursive:!0});let n=`
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  return {
    message: 'API endpoint is working!'
  };
});
`;writeFileSync(join(e,"src","runtime","server","api","hello.ts"),n),mkdirSync(join(e,"src","composables"),{recursive:!0});let o=`
export function useApi() {
  const { $api } = useNuxtApp();
  
  async function fetchData(endpoint: string, options = {}) {
    return await $api(endpoint, options);
  }
  
  return {
    fetchData
  };
}
`;writeFileSync(join(e,"src","composables","useApi.ts"),o);}};var ce={dependencies:{"@convex-vue/core":"^0.0.4","@vueuse/core":"^10.7.0",convex:"^1.5.0"},createTemplateFiles:e=>{let t=`
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
`;mkdirSync(join(e,"plugins"),{recursive:!0}),writeFileSync(join(e,"plugins","convex.ts"),t),mkdirSync(join(e,"convex"),{recursive:!0}),mkdirSync(join(e,"convex","_generated"),{recursive:!0}),mkdirSync(join(e,"convex","schema"),{recursive:!0});let n=`
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
`;writeFileSync(join(e,"convex","schema.ts"),n);let o=`
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
`;writeFileSync(join(e,"convex","tasks.ts"),o);let s=`
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
`;writeFileSync(join(e,"convex","mutations.ts"),s),mkdirSync(join(e,"components"),{recursive:!0});let r=`
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
`;writeFileSync(join(e,"components","ConvexTaskList.vue"),r);let a=`
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
`;writeFileSync(join(e,"components","ConvexTaskForm.vue"),a);let p=`
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
`;writeFileSync(join(e,"components","ConvexDemo.vue"),p),mkdirSync(join(e,"composables"),{recursive:!0});let f=`
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
`;writeFileSync(join(e,"composables","useConvexTasks.ts"),f);let x=`
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
`;writeFileSync(join(e,"composables","useConvexAuth.ts"),x);let A=`# Setting up Convex with Nuxt

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
`;mkdirSync(join(e,"docs"),{recursive:!0}),writeFileSync(join(e,"docs","SETUP.md"),A);},postSetup:(e,t,n)=>{let o=`
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
})`;writeFileSync(join(e,"nuxt.config.ts"),o);let s={project:t.replace(/^nuxt-/,""),functions:"./convex",origin:"https://relaxed-swan-82.convex.cloud"};writeFileSync(join(e,"convex.json"),JSON.stringify(s,null,2));let r=`# ${t}

${n}

## Features

- Seamless integration with Convex backend
- Ready-to-use components for common Convex operations
- Composables for querying and mutating Convex data
- Authentication helpers

## Setup

\`\`\`bash
# npm
npm install ${t}

# yarn
yarn add ${t}

# pnpm
pnpm add ${t}
\`\`\`

## Usage

Add the layer to your \`nuxt.config.ts\`:

\`\`\`ts
export default defineNuxtConfig({
  extends: ['${t}']
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
`;writeFileSync(join(e,"README.md"),r);}};var pe={dependencies:{"@neondatabase/serverless":"^0.6.0",pg:"^8.11.3","drizzle-orm":"^0.28.6","drizzle-kit":"^0.19.13",dotenv:"^16.3.1"},createTemplateFiles:e=>{let t=`
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
`;mkdirSync(join(e,"plugins"),{recursive:!0}),writeFileSync(join(e,"plugins","neon.ts"),t),mkdirSync(join(e,"db"),{recursive:!0}),mkdirSync(join(e,"db","schema"),{recursive:!0});let n=`
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
`;writeFileSync(join(e,"db","index.ts"),n);let o=`
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
`;writeFileSync(join(e,"db","schema","schema.ts"),o);let s=`
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
`;writeFileSync(join(e,"drizzle.config.ts"),s),mkdirSync(join(e,"server"),{recursive:!0}),mkdirSync(join(e,"server","api"),{recursive:!0});let r=`
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
`;writeFileSync(join(e,"server","api","db-status.ts"),r);let a=`
import { createPoolClient } from '../db';

export const useNeonPool = () => {
  const config = useRuntimeConfig();
  
  if (!config.neon?.connectionString) {
    throw new Error('NEON_CONNECTION_STRING is not configured');
  }
  
  return createPoolClient(config.neon.connectionString);
};
`;writeFileSync(join(e,"server","config.ts"),a),mkdirSync(join(e,"scripts"),{recursive:!0});let p=`
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
`;writeFileSync(join(e,"scripts","setup-db.ts"),p),mkdirSync(join(e,"composables"),{recursive:!0});let f=`
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
`;writeFileSync(join(e,"composables","useNeonDb.ts"),f),mkdirSync(join(e,"components"),{recursive:!0});let x=`
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
`;writeFileSync(join(e,"components","NeonUsersList.vue"),x);let A=`# Neon Database
NEON_CONNECTION_STRING=postgres://user:password@host/database
`;writeFileSync(join(e,".env.example"),A);let j=`# Setting up Neon Database with Nuxt

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
`;mkdirSync(join(e,"docs"),{recursive:!0}),writeFileSync(join(e,"docs","SETUP.md"),j);},postSetup:(e,t,n)=>{let o=`
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
})`;writeFileSync(join(e,"nuxt.config.ts"),o);let s=join(e,"package.json");try{let a=JSON.parse(readFileSync(s,"utf8"));a.scripts={...a.scripts,"db:generate":"drizzle-kit generate","db:push":"drizzle-kit push","db:studio":"drizzle-kit studio","db:setup":"tsx scripts/setup-db.ts"},writeFileSync(s,JSON.stringify(a,null,2));}catch(a){console.error("Failed to update package.json:",a);}let r=`# ${t}

${n}

## Features

- Serverless PostgreSQL database integration with Neon
- Type-safe database access with Drizzle ORM
- Ready-to-use components for database operations
- Server API endpoints for database access
- Database migration and seeding utilities

## Setup

\`\`\`bash
# npm
npm install ${t}

# yarn
yarn add ${t}

# pnpm
pnpm add ${t}
\`\`\`

## Usage

Add the layer to your \`nuxt.config.ts\`:

\`\`\`ts
export default defineNuxtConfig({
  extends: ['${t}']
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
`;writeFileSync(join(e,"README.md"),r);}};var K={basic:re,auth:ae,ui:ie,api:le,convex:ce,neon:pe};function F(){return Object.keys(K)}async function ue(e,t="Select an option:",n){if(e.length===0)return null;let o=e.map(s=>({title:s,description:n?.[s]||void 0,value:s}));try{return (await de({type:"select",name:"value",message:t,choices:o,hint:"Use arrow keys and press Enter to select",initial:0},{onCancel:()=>{throw new Error("Operation cancelled")}})).value}catch{return null}}async function me(e,t=!1){try{return (await de({type:"confirm",name:"value",message:e,initial:t},{onCancel:()=>{throw new Error("Operation cancelled")}})).value}catch{return null}}var ve=defineCommand({meta:{name:"create",description:"Create a new Nuxt layer"},args:{name:{type:"positional",description:"Name of the layer to create",required:!0},"output-dir":{type:"string",description:"Directory where the layer will be created",default:"./"},template:{type:"string",description:"Template to use for creating the layer",default:"basic",options:F()},"git-template":{type:"string",description:'Git repository template URL to use (e.g., "github:user/repo")'},"custom-template":{type:"string",description:"Custom template path or URL to use"},description:{type:"string",description:"Description of the layer",default:"A Nuxt layer"},"package-manager":{type:"string",description:"Package manager to use for initialization",default:"npm",options:["npm","yarn","pnpm"]},"skip-install":{type:"boolean",description:"Skip installing dependencies",default:!1},"skip-git":{type:"boolean",description:"Skip Git initialization",default:!1},"giget-provider":{type:"string",description:"Provider for giget (github, gitlab, etc.)",default:"github"},"use-nuxi-template":{type:"boolean",description:"Use the official Nuxt layer template",default:!1}},run:async({args:e})=>{let{name:t,"output-dir":n,template:o,"git-template":s,"custom-template":r,description:a,"package-manager":p,"skip-install":f,"skip-git":x,"giget-provider":A,"use-nuxi-template":j}=e,E=o;if(!E&&!j&&!s&&!r){let k=F(),Z=await ue(k,"Select a template for your Nuxt layer:",{basic:"A basic Nuxt layer with minimal setup",auth:"Authentication layer with login/register functionality",ui:"UI components and styling utilities",api:"API integration and data fetching utilities",convex:"Real-time database with Convex integration",neon:"Serverless Postgres database with Neon integration"});Z||(i.info("Layer creation cancelled."),process.exit(0)),E=Z,i.info(`Using template: ${l.cyan(E)}`);}else E=o;let R=t.replace(/[^a-zA-Z0-9-_]/g,"-").replace(/-+/g,"-").toLowerCase(),_=t.startsWith("@")||t.includes("/")?t:R,g=resolve(process.cwd(),n,R);existsSync(g)&&readdirSync(g).length>0&&(await me(`Directory ${l.yellow(g)} already exists and is not empty. Continue anyway?`,!1)||(i.info("Layer creation cancelled."),process.exit(0)));try{if(j){i.info("Creating layer using official Nuxt layer template"),existsSync(g)||mkdirSync(g,{recursive:!0});let k=`${p} create nuxt@latest -t layer ${g} --no-git`;i.info(`Running: ${l.cyan(k)}`),execSync(k,{stdio:"inherit"}),Y(g,_,a),x||ge(g),i.success(`Nuxt layer ${l.green(_)} created successfully using the official Nuxt layer template!`),i.info("To get started, run:"),console.log(""),console.log(`  ${l.cyan("cd")} ${n}/${R}`),f&&console.log(`  ${l.cyan(p==="npm"?"npm install":p==="yarn"?"yarn":"pnpm install")}`),console.log(`  ${l.cyan(p==="npm"?"npm run dev":p==="yarn"?"yarn dev":"pnpm dev")}`),console.log("");return}mkdirSync(g,{recursive:!0}),i.success(`Created directory: ${l.green(g)}`),s?await Pe(s,g,_,a):r?await je(r,A,g,_,a):Re(g,_,a,E),x||ge(g),f||Ue(g,p),i.success(`Nuxt layer ${l.green(_)} created successfully!`),i.info("To get started, run:"),console.log(""),console.log(`  ${l.cyan("cd")} ${n}/${R}`),f&&console.log(`  ${l.cyan(p==="npm"?"npm install":p==="yarn"?"yarn":"pnpm install")}`),console.log(`  ${l.cyan(p==="npm"?"npm run dev":p==="yarn"?"yarn dev":"pnpm dev")}`),console.log("");}catch(k){i.error(`Failed to create Nuxt layer: ${k}`),process.exit(1);}}});async function Pe(e,t,n,o){i.info(`Creating layer from Git template: ${l.cyan(e)}`);try{return await downloadTemplate(e,{dir:t,force:!0}),i.success(`Downloaded template from ${e}`),Y(t,n,o),!0}catch(s){throw i.error(`Failed to download template from ${e}: ${s}`),s}}async function je(e,t,n,o,s){i.info(`Creating layer from custom template: ${l.cyan(e)}`);try{if(existsSync(e)&&!e.includes(":")){let r=readdirSync(e,{withFileTypes:!0});for(let a of r)a.name==="node_modules"||a.name===".git"||(a.isDirectory()?execSync(`cp -R "${join(e,a.name)}" "${join(n,a.name)}"`):execSync(`cp "${join(e,a.name)}" "${join(n,a.name)}"`));i.success(`Copied template from ${e}`);}else {let r=e.includes(":")?e:`${t}:${e}`;await downloadTemplate(r,{dir:n,force:!0}),i.success(`Downloaded template from ${r}`);}return Y(n,o,s),!0}catch(r){throw i.error(`Failed to use custom template ${e}: ${r}`),r}}function Re(e,t,n,o){i.info(`Creating layer using template: ${l.cyan(o)}`);let s=K[o];s||(i.error(`Template '${o}' not found`),process.exit(1)),qe(e,t,n,s.dependencies),s.createTemplateFiles(e),s.postSetup&&s.postSetup(e,t,n),i.success(`Applied template: ${l.green(o)}`);}function Y(e,t,n){let o=join(e,"package.json");if(existsSync(o))try{let s=JSON.parse(readFileSync(o,"utf-8"));s.name=t,s.description=n,s.version="0.1.0",writeFileSync(o,JSON.stringify(s,null,2)+`
`),i.success("Updated package.json with new name and description");}catch(s){i.warn(`Could not update package.json: ${s}`);}else i.warn("No package.json found in the template. Creating a basic one."),writeFileSync(o,JSON.stringify({name:t,version:"0.1.0",description:n,type:"module",main:"./nuxt.config.ts",scripts:{dev:"nuxi dev playground",build:"nuxi build playground",generate:"nuxi generate playground",preview:"nuxi preview playground",lint:"eslint .",prepare:"nuxi prepare playground"},dependencies:{},devDependencies:{"@nuxt/module-builder":"^0.5.0","@nuxt/schema":"^3.7.0",nuxt:"^3.7.0",typescript:"^5.2.2",vitest:"^0.34.3"}},null,2)+`
`),i.success("Created new package.json");}function qe(e,t,n,o){i.info("Creating layer structure"),mkdirSync(join(e,"components"),{recursive:!0}),mkdirSync(join(e,"composables"),{recursive:!0}),mkdirSync(join(e,"utils"),{recursive:!0}),mkdirSync(join(e,"plugins"),{recursive:!0}),mkdirSync(join(e,"server"),{recursive:!0}),mkdirSync(join(e,"runtime"),{recursive:!0}),mkdirSync(join(e,"playground"),{recursive:!0});let s={name:t,version:"0.1.0",description:n,type:"module",main:"./nuxt.config.ts",scripts:{dev:"nuxi dev playground",build:"nuxi build playground",generate:"nuxi generate playground",preview:"nuxi preview playground",lint:"eslint .",prepare:"nuxi prepare playground"},dependencies:{...o},devDependencies:{"@nuxt/eslint-config":"^0.2.0",eslint:"^8.49.0",nuxt:"^3.7.4"}};writeFileSync(join(e,"package.json"),JSON.stringify(s,null,2));let r=`# ${t}

${n}

## Setup

\`\`\`bash
# npm
npm install ${t}

# yarn
yarn add ${t}

# pnpm
pnpm add ${t}
\`\`\`

## Usage

Add the layer to your \`nuxt.config.ts\`:

\`\`\`ts
export default defineNuxtConfig({
  extends: ['${t}']
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
`;writeFileSync(join(e,"README.md"),r);let a=`<template>
  <div>
    <h1>Welcome to ${t} playground!</h1>
    <p>This is a playground for testing the ${t} layer.</p>
  </div>
</template>
`;writeFileSync(join(e,"playground","app.vue"),a);let p=`
export default defineNuxtConfig({
  extends: ['..'],
  // Additional configuration specific to the playground
})
`;writeFileSync(join(e,"playground","nuxt.config.ts"),p);let f=`
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
`;writeFileSync(join(e,".gitignore"),f),i.success("Layer structure created successfully");}function ge(e){try{i.info("Initializing Git repository..."),execSync("git init",{cwd:e,stdio:"ignore"}),i.success("Git repository initialized");}catch{i.warn("Failed to initialize Git repository. Continuing without Git.");}}function Ue(e,t){try{i.info(`Installing dependencies using ${t}...`);let n="";switch(t){case"npm":n="npm install";break;case"yarn":n="yarn";break;case"pnpm":n="pnpm install";break;default:n="npm install";}execSync(n,{cwd:e,stdio:"inherit"}),i.success("Dependencies installed successfully");}catch{i.error("Failed to install dependencies. You can install them manually later.");}}var xe=defineCommand({meta:{name:"update",description:"Update installed Nuxt layers to newer versions"},args:{layer:{type:"positional",description:"Name of the layer to update (leave empty to update all)",required:!1},"target-dir":{type:"string",description:"Target directory containing the project to update",default:"./"},registry:{type:"string",description:"Package registry to use",default:"npm",options:["npm","yarn","pnpm"]},"dry-run":{type:"boolean",description:"Show what would be updated without making changes",default:!1},latest:{type:"boolean",description:"Update to the latest version (ignores semver constraints)",default:!1}},async run({args:e}){let{layer:t,"target-dir":n,registry:o,"dry-run":s,latest:r}=e;try{t?await be(t,n,o):await Ve(n,o);}catch(a){i.error("Failed to update layer(s):",a),process.exit(1);}}});async function be(e,t,n){i.info(`Updating layer: ${l.cyan(e)}`);try{let o=We(n,e);execSync(o,{cwd:t,stdio:"inherit"}),i.success(`Successfully updated layer: ${l.green(e)}`);}catch(o){throw new Error(`Failed to update layer ${e}: ${o}`)}}async function Ve(e,t){let n=join(e,"package.json");if(!existsSync(n))throw new Error("No package.json found in the current directory");try{let o=JSON.parse(readFileSync(n,"utf-8")),s={...o.dependencies,...o.devDependencies},r=Object.keys(s).filter(a=>Qe(a));if(r.length===0){i.info("No Nuxt layers found to update");return}i.info("Updating all Nuxt layers...");for(let a of r)await be(a,e,t);i.success("Successfully updated all layers");}catch(o){throw new Error(`Failed to update layers: ${o}`)}}function We(e,t){switch(e.toLowerCase()){case"npm":return `npm update ${t}`;case"yarn":return `yarn upgrade ${t}`;case"pnpm":return `pnpm update ${t}`;default:return i.warn(`Unknown registry: ${e}, defaulting to npm`),`npm update ${t}`}}function Qe(e){return e.startsWith("@nuxt/")||e.startsWith("nuxt-")||e.startsWith("@bahamut/")}var Ye=defineCommand({meta:{name:"alpha",version:"0.1.0",description:"CLI tool for managing Nuxt layers"},subCommands:{install:ne,list:se,create:ve,update:xe},args:{verbose:{type:"boolean",description:"Show verbose output",alias:"v",default:!1},silent:{type:"boolean",description:"Suppress all output",default:!1},help:{type:"boolean",description:"Show help",alias:"h",default:!1},version:{type:"boolean",description:"Show version",default:!1}},run:async({args:e})=>{if(e.version){console.log("alpha v0.1.0");return}Ze(),console.log(`
${l.green("\u03B1")} ${l.bold("Alpha")} - CLI tool for managing Nuxt layers
`),console.log(`Usage: ${l.cyan("alpha")} ${l.yellow("<command>")} ${l.gray("[options]")}
`),console.log("Commands:"),console.log(`  ${l.yellow("install")}  Install a Nuxt layer`),console.log(`  ${l.yellow("list")}     List installed Nuxt layers`),console.log(`  ${l.yellow("create")}   Create a new Nuxt layer`),console.log(`  ${l.yellow("update")}   Update installed Nuxt layers`),console.log(`
Templates:`),F().forEach(t=>{console.log(`  ${l.magenta(t)}`);}),console.log(`
Pro Tip:`),console.log(`  Use ${l.cyan("alpha create my-layer --use-nuxi-template")} to create a layer using the official Nuxt layer template`),console.log(`
Options:`),console.log(`  ${l.gray("-h, --help")}     Show help`),console.log(`  ${l.gray("-v, --verbose")}  Show verbose output`),console.log(`  ${l.gray("--version")}      Show version
`),console.log(`Run ${l.cyan("alpha")} ${l.yellow("<command>")} ${l.gray("--help")} for help with a specific command.
`);}});function Ze(){let e=`
  ${l.cyan("     _    _       _           ")}
  ${l.cyan("    / \\  | |_ __ | |__   __ _ ")}
  ${l.cyan("   / _ \\ | | '_ \\| '_ \\ / _` |")}
  ${l.cyan("  / ___ \\| | |_) | | | | (_| |")}
  ${l.cyan(" /_/   \\_\\_| .__/|_| |_|\\__,_|")}
  ${l.cyan("          |_|                 ")}
  ${l.gray("v0.1.0")}`;console.log(e);}async function et(){await runCommand(Ye,{rawArgs:process.argv.slice(2)});}process.argv[1]===import.meta.url&&et().catch(e=>{i.error(e),process.exit(1);});

export { et as runMain };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map