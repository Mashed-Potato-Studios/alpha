import { join } from 'pathe';
import { writeFileSync, mkdirSync } from 'fs';
import { TemplateDefinition } from './index';

export const basicTemplate: TemplateDefinition = {
  dependencies: {},

  createTemplateFiles: (outputDir: string) => {
    // Create a basic plugin
    const pluginContent = `
export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      hello: (msg: string) => \`Hello \${msg}!\`
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

    // Create a basic component
    const componentContent = `
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
`;

    // Ensure components directory exists
    mkdirSync(join(outputDir, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(outputDir, 'src', 'components', 'BasicComponent.vue'),
      componentContent
    );

    // Create a basic composable
    const composableContent = `
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
`;

    // Ensure composables directory exists
    mkdirSync(join(outputDir, 'src', 'composables'), { recursive: true });
    writeFileSync(
      join(outputDir, 'src', 'composables', 'useBasic.ts'),
      composableContent
    );
  },
};
