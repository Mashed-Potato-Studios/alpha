import { join } from 'pathe';
import { writeFileSync, mkdirSync } from 'fs';
import { TemplateDefinition } from './index';

export const authTemplate: TemplateDefinition = {
  dependencies: {
    '@nuxtjs/supabase': '^1.0.2',
    zod: '^3.21.4',
  },

  createTemplateFiles: (outputDir: string) => {
    // Create auth plugin
    const pluginContent = `
export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      auth: {
        // Auth utilities here
      }
    }
  }
})
`;

    // Ensure runtime directory exists
    mkdirSync(join(outputDir, 'src', 'runtime'), { recursive: true });
    writeFileSync(
      join(outputDir, 'src', 'runtime', 'plugin.ts'),
      pluginContent
    );

    // Create auth login component
    const loginComponentContent = `
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
`;

    // Ensure components directory exists
    mkdirSync(join(outputDir, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(outputDir, 'src', 'components', 'AuthLogin.vue'),
      loginComponentContent
    );

    // Create auth composable
    const composableContent = `
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
`;

    // Ensure composables directory exists
    mkdirSync(join(outputDir, 'src', 'composables'), { recursive: true });
    writeFileSync(
      join(outputDir, 'src', 'composables', 'useAuth.ts'),
      composableContent
    );
  },
};
