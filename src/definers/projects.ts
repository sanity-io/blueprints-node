import {
  type BlueprintCrossStackReferenceConfig,
  type BlueprintProjectAttachConfig,
  type BlueprintProjectConfig,
  type BlueprintProjectResource,
  type BlueprintResource,
  referenceResource,
  validateProject,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a project.
 *
 * ```ts
 * defineProject({
 *   name: 'my-project',
 *   displayName: 'My Project',
 * })
 * ```
 * @param parameters The project configuration
 * @public
 * @beta Deploying Projects via Blueprints is experimental. This feature is stabilizing but may still be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintProjectConfig
 * @returns The project resource
 * @hidden
 */
export function defineProject(parameters: BlueprintProjectConfig): BlueprintProjectResource {
  // default project name
  const displayName = parameters.displayName || parameters.name

  const projectResource: BlueprintProjectResource = {
    ...parameters,
    displayName,
    type: 'sanity.project',
  }

  runValidation(() => validateProject(projectResource))

  return projectResource
}

/**
 * Attaches an existing project to a Blueprint and retains it when the Stack is destroyed.
 *
 * @example
 * ```ts
 * attachProject({
 *   name: 'project',
 *   id: 'abc123',
 * })
 * ```
 * @param config The existing project identity
 * @public
 * @beta Attaching Projects via Blueprints is experimental. This feature is subject to breaking changes.
 * @category Definers
 * @expandType BlueprintProjectAttachConfig
 * @returns The attached project resource
 * @hidden
 */
export function attachProject(config: BlueprintProjectAttachConfig): BlueprintProjectResource {
  const projectResource: BlueprintProjectResource = {
    name: config.name,
    type: 'sanity.project',
    lifecycle: {
      deletionPolicy: 'retain',
      ownershipAction: {type: 'attach', id: config.id},
    },
  }

  runValidation(() => validateProject(projectResource))

  return projectResource
}

/**
 * Creates a reference to a project in another stack.
 *
 * ```ts
 * referenceProject({
 *   name: 'editorial-project',
 *   stack: 'editorial',
 * })
 * ```
 *
 * @param params The parameters for referencing the project
 * @public
 * @beta Referencing Projects via Blueprints is experimental. This feature is stabilizing but may still be subject to breaking changes.
 * @category Referencers
 * @returns The project reference
 * @hidden
 */
export function referenceProject({name, stack, localName}: BlueprintCrossStackReferenceConfig): BlueprintResource {
  return referenceResource({name, stack, localName, type: 'sanity.project'})
}
