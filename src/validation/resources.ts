import type {BlueprintError, BlueprintResource} from '../index.js'

export function validateResource(resourceConfig: Partial<BlueprintResource>): BlueprintError[] {
  const {name, type} = resourceConfig
  const errors: BlueprintError[] = []

  if (!name) errors.push({type: 'missing_parameter', message: '`name` is required'})
  if (!type) errors.push({type: 'missing_parameter', message: '`type` is required'})

  return errors
}
