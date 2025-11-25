import {type BlueprintResource, validateResource} from '../index.js'
import {runValidation} from '../utils/validation.js'

export function defineResource(resourceConfig: Partial<BlueprintResource>): BlueprintResource {
  runValidation(() => validateResource(resourceConfig))

  const {name, type} = resourceConfig

  // validate again to satisfy type checks
  if (!name || !type) throw new Error('name and type are required')

  return {
    ...resourceConfig,
    type,
    name,
  }
}
