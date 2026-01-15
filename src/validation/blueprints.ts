import type {BlueprintError} from '../index.js'

/**
 * Validates that the given input is a valid Blueprint
 * @param blueprintConfig The blueprint configuration to be validated
 * @returns A list of validation errors
 */
export function validateBlueprint(blueprintConfig: unknown): BlueprintError[] {
  if (!blueprintConfig) return [{type: 'invalid_value', message: 'blueprint config must be provided'}]
  if (typeof blueprintConfig !== 'object') return [{type: 'invalid_type', message: 'blueprint config must be an object'}]

  const errors: BlueprintError[] = []

  if ('resources' in blueprintConfig) {
    const {resources} = blueprintConfig

    if (resources && !Array.isArray(resources)) errors.push({type: 'invalid_format', message: '`resources` must be an array'})
  }

  return errors
}
