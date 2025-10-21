import type {BlueprintResource} from '../types.js'

export function defineResource(resourceConfig: Partial<BlueprintResource>): BlueprintResource {
  const {name, type} = resourceConfig
  if (!name) throw new Error('`name` is required')
  if (!type) throw new Error('`type` is required')

  return {
    ...resourceConfig,
    type,
    name,
  }
}
