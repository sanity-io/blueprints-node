import {
  type BlueprintProjectRoleResource,
  type BlueprintRoleConfig,
  type BlueprintRoleResource,
  validateProjectRole,
  validateRole,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a role that is scoped to the same resource as the blueprint.
 * @param parameters The configuration of the role
 * @returns The role resource
 */
export function defineRole(parameters: BlueprintRoleConfig, options?: {skipValidation?: boolean}): BlueprintRoleResource {
  const roleResource: BlueprintRoleResource = {
    name: parameters.name,
    type: 'sanity.access.role',
    title: parameters.title,
    description: parameters.description,
    appliesToUsers: parameters.appliesToUsers,
    appliesToRobots: parameters.appliesToRobots,
    permissions: parameters.permissions,
  }

  if (options?.skipValidation !== true) runValidation(() => validateRole(roleResource))

  return roleResource
}

/**
 * Defines a role that is scoped to the specified project.
 * @param projectId The ID of the project to which the role will be scoped
 * @param parameters The configuration of the role
 * @returns The role resource
 */
export function defineProjectRole(projectId: string, parameters: BlueprintRoleConfig): BlueprintProjectRoleResource {
  const roleResource = defineRole(parameters, {skipValidation: true})

  const projectRoleResource: BlueprintProjectRoleResource = {
    ...roleResource,
    resourceType: 'project',
    resourceId: projectId,
  }

  runValidation(() => validateProjectRole(projectRoleResource))

  return projectRoleResource
}
