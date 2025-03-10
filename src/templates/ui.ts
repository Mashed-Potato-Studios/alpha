import { join } from 'pathe';
import { writeFileSync, mkdirSync } from 'fs';
import { TemplateDefinition } from './index';

export const uiTemplate: TemplateDefinition = {
  dependencies: {
    '@nuxtjs/tailwindcss': '^6.8.0',
  },

  createTemplateFiles: (outputDir: string) => {
    // Create UI plugin
    const pluginContent = `
export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      ui: {
        // UI utilities here
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

    // Create button component
    const buttonComponentContent = `
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
`;

    // Ensure components directory exists
    mkdirSync(join(outputDir, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(outputDir, 'src', 'components', 'Button.vue'),
      buttonComponentContent
    );

    // Create UI theme composable
    const composableContent = `
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
`;

    // Ensure composables directory exists
    mkdirSync(join(outputDir, 'src', 'composables'), { recursive: true });
    writeFileSync(
      join(outputDir, 'src', 'composables', 'useTheme.ts'),
      composableContent
    );
  },
};
