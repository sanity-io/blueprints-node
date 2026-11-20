import {
  type BlueprintCrossStackReferenceConfig,
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
 * @example
 * ```ts
 * defineProject({
 *   name: 'my-project',
 *   displayName: 'My Project',
 * })
 * ```
 * @param parameters The project configuration
 * @public
 * @category Definers
 * @expandType BlueprintProjectConfig
 * @returns The project resource
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
 * Creates a reference to a project in another stack.
 *
 * @example
 * ```ts
 * referenceProject({
 *   name: 'editorial-project',
 *   stack: 'editorial',
 * })
 * ```
 *
 * @param params The parameters for referencing the project
 * @public
 * @category Referencers
 * @returns The project reference
 */
export function referenceProject({name, stack, localName}: BlueprintCrossStackReferenceConfig): BlueprintResource {
  return referenceResource({name, stack, localName, type: 'sanity.project'})
}
