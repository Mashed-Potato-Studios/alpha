import { join } from 'pathe';
import { writeFileSync, mkdirSync } from 'fs';
import { TemplateDefinition } from './index';

export const apiTemplate: TemplateDefinition = {
  dependencies: {
    h3: '^1.7.1',
    ofetch: '^1.3.3',
  },

  createTemplateFiles: (outputDir: string) => {
    // Create API plugin
    const pluginContent = `
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
`;

    // Ensure runtime directory exists
    mkdirSync(join(outputDir, 'src', 'runtime'), { recursive: true });
    writeFileSync(
      join(outputDir, 'src', 'runtime', 'plugin.ts'),
      pluginContent
    );

    // Create API endpoint files
    mkdirSync(join(outputDir, 'src', 'runtime', 'server', 'api'), {
      recursive: true,
    });

    const apiEndpointContent = `
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  return {
    message: 'API endpoint is working!'
  };
});
`;

    writeFileSync(
      join(outputDir, 'src', 'runtime', 'server', 'api', 'hello.ts'),
      apiEndpointContent
    );

    // Create API composable
    mkdirSync(join(outputDir, 'src', 'composables'), { recursive: true });
    const composableContent = `
export function useApi() {
  const { $api } = useNuxtApp();
  
  async function fetchData(endpoint: string, options = {}) {
    return await $api(endpoint, options);
  }
  
  return {
    fetchData
  };
}
`;

    writeFileSync(
      join(outputDir, 'src', 'composables', 'useApi.ts'),
      composableContent
    );
  },
};
