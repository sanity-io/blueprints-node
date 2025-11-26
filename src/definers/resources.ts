import {type BlueprintResource, assertResource} from '../index.js'

export function defineResource(resourceConfig: Partial<BlueprintResource>): BlueprintResource {
  const resource = {
    ...resourceConfig,
  }

  assertResource(resource)

  return resource
}
