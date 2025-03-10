import prompts from 'prompts';
import pc from 'picocolors';

/**
 * Utility functions for interactive prompts using the prompts package
 */

/**
 * Create an interactive selection menu
 * @param options Array of options to select from
 * @param message Prompt message
 * @param descriptions Optional descriptions for each option
 * @returns Selected option or null if cancelled
 */
export async function selectFromOptions<T extends string>(
  options: T[],
  message: string = 'Select an option:',
  descriptions?: Record<string, string>
): Promise<T | null> {
  if (options.length === 0) {
    return null;
  }

  const choices = options.map((option) => ({
    title: option,
    description: descriptions?.[option] || undefined,
    value: option,
  }));

  try {
    const response = await prompts(
      {
        type: 'select',
        name: 'value',
        message,
        choices,
        hint: 'Use arrow keys and press Enter to select',
        initial: 0,
      },
      {
        onCancel: () => {
          throw new Error('Operation cancelled');
        },
      }
    );

    return response.value;
  } catch (_error) {
    return null;
  }
}

/**
 * Prompt for text input
 * @param message Prompt message
 * @param defaultValue Optional default value
 * @param validate Optional validation function
 * @returns Input value or null if cancelled
 */
export async function promptText(
  message: string,
  defaultValue?: string,
  validate?: (value: string) => boolean | string
): Promise<string | null> {
  try {
    const response = await prompts(
      {
        type: 'text',
        name: 'value',
        message,
        initial: defaultValue,
        validate,
      },
      {
        onCancel: () => {
          throw new Error('Operation cancelled');
        },
      }
    );

    return response.value;
  } catch (_error) {
    return null;
  }
}

/**
 * Prompt for confirmation
 * @param message Prompt message
 * @param defaultValue Optional default value (true/false)
 * @returns Boolean response or null if cancelled
 */
export async function promptConfirm(
  message: string,
  defaultValue: boolean = false
): Promise<boolean | null> {
  try {
    const response = await prompts(
      {
        type: 'confirm',
        name: 'value',
        message,
        initial: defaultValue,
      },
      {
        onCancel: () => {
          throw new Error('Operation cancelled');
        },
      }
    );

    return response.value;
  } catch (_error) {
    return null;
  }
}

/**
 * Prompt for multiple selections
 * @param options Array of options to select from
 * @param message Prompt message
 * @param descriptions Optional descriptions for each option
 * @returns Array of selected options or null if cancelled
 */
export async function promptMultiSelect<T extends string>(
  options: T[],
  message: string = 'Select options:',
  descriptions?: Record<string, string>
): Promise<T[] | null> {
  if (options.length === 0) {
    return [];
  }

  const choices = options.map((option) => ({
    title: option,
    description: descriptions?.[option] || undefined,
    value: option,
  }));

  try {
    const response = await prompts(
      {
        type: 'multiselect',
        name: 'value',
        message,
        choices,
        hint: 'Space to select, Enter to confirm',
        instructions: false,
      },
      {
        onCancel: () => {
          throw new Error('Operation cancelled');
        },
      }
    );

    return response.value;
  } catch (_error) {
    return null;
  }
}

/**
 * Display a spinner with a message
 * This is a placeholder - for actual implementation, consider using a package like ora
 * @param message Message to display
 * @returns Function to stop the spinner
 */
export function showSpinner(message: string): () => void {
  console.log(`${pc.cyan('⟳')} ${message}`);
  return () => {};
}
