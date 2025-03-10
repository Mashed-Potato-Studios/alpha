// Template definitions
export interface TemplateDefinition {
  // Function to create the template files
  createTemplateFiles: (outputDir: string) => void;

  // Dependencies to add to package.json
  dependencies: Record<string, string>;

  // Additional setup to be done after template creation
  postSetup?: (outputDir: string, name: string, description: string) => void;
}

// Template implementations
import { basicTemplate } from './basic';
import { authTemplate } from './auth';
import { uiTemplate } from './ui';
import { apiTemplate } from './api';
import { convexTemplate } from './convex';
import { neonTemplate } from './neon';

// Export all templates
export const templates: Record<string, TemplateDefinition> = {
  basic: basicTemplate,
  auth: authTemplate,
  ui: uiTemplate,
  api: apiTemplate,
  convex: convexTemplate,
  neon: neonTemplate,
};

// Helper to get template names for CLI options
export function getTemplateNames(): string[] {
  return Object.keys(templates);
}
