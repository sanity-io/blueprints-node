import {type BlueprintProjectConfig, type BlueprintProjectResource, validateProject} from '../index.js'
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
 * @returns The robot token resource
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
