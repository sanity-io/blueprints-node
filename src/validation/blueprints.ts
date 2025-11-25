import type {Blueprint, BlueprintsApiConfig} from '../index.js'
import type {BlueprintError} from '../types/errors.js'

export function validateBlueprint(blueprintConfig: Partial<Blueprint> & Partial<BlueprintsApiConfig>): BlueprintError[] {
  const {resources} = blueprintConfig
  const errors: BlueprintError[] = []

  if (resources && !Array.isArray(resources)) errors.push({type: 'invalid_format', message: '`resources` must be an array'})

  return errors
}
