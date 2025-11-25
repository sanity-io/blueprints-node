import {type BlueprintProjectRoleResource, type BlueprintRoleConfig, type BlueprintRoleResource, validateRole} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a role that is scoped to the same resource as the blueprint.
 * @param parameters The configuration of the role
 * @returns The role resource
 */
export function defineRole(parameters: BlueprintRoleConfig): BlueprintRoleResource {
  runValidation(() => validateRole(parameters))

  return {
    name: parameters.name,
    type: 'sanity.access.role',
    title: parameters.title,
    description: parameters.description,
    appliesToUsers: parameters.appliesToUsers,
    appliesToRobots: parameters.appliesToRobots,
    permissions: parameters.permissions,
  }
}

/**
 * Defines a role that is scoped to the specified project.
 * @param projectId The ID of the project to which the role will be scoped
 * @param parameters The configuration of the role
 * @returns The role resource
 */
export function defineProjectRole(projectId: string, parameters: BlueprintRoleConfig): BlueprintProjectRoleResource {
  const roleResource = defineRole(parameters)

  return {
    ...roleResource,
    resourceType: 'project',
    resourceId: projectId,
  }
}
