import {assertResource, type BlueprintResource} from '../index.js'

/**
 * Defines a generic resource to be managed in Blueprints.
 * This is useful if the resource type does not yet have a `define*` function.
 * @param resourceConfig The resource configuration
 */
export function defineResource(resourceConfig: Partial<BlueprintResource>): BlueprintResource {
  const resource = {
    ...resourceConfig,
  }

  assertResource(resource)

  return resource
}
