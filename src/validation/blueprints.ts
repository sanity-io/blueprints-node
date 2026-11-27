import type {BlueprintError} from '../index.js'
import {getCollectedErrors, resetCollectedErrors} from '../utils/validation.js'

/**
 * Validates that the given input is a valid Blueprint
 * @param blueprintConfig The blueprint configuration to be validated
 * @category Validation
 * @returns A list of validation errors
 */
export function validateBlueprint(blueprintConfig: unknown): BlueprintError[] {
  if (!blueprintConfig) return [{type: 'invalid_value', message: 'blueprint config must be provided'}]
  if (typeof blueprintConfig !== 'object') return [{type: 'invalid_type', message: 'blueprint config must be an object'}]

  const errors: BlueprintError[] = []

  if ('resources' in blueprintConfig) {
    const {resources} = blueprintConfig

    if (resources) {
      if (!Array.isArray(resources)) errors.push({type: 'invalid_format', message: '`resources` must be an array'})
      else {
        const names = new Set<string>()
        const duplicates = new Set<string>()
        resources.forEach((r) => {
          if (names.has(r.name)) {
            duplicates.add(r.name)
          } else {
            names.add(r.name)
          }
        })
        duplicates.forEach((name) => {
          errors.push({type: 'invalid_value', message: `duplicate name '${name}' in resources`})
        })
      }
    }
  }

  // add any errors that were collected when definers were called
  errors.push(...getCollectedErrors())
  resetCollectedErrors()

  return errors
}
