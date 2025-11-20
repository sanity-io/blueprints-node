import type {BlueprintResource} from '../types'

export interface RolePermission {
  name: string // Required: predefined permission name (e.g., 'sanity-all-documents')
  action: string // Required: permission action (e.g., 'read', 'mode')
  params?: Record<string, unknown> // Optional: additional parameters for the permission
}

export interface BlueprintRoleConfig {
  name: string
  title: string
  description?: string
  appliesToUsers: boolean
  appliesToRobots: boolean
  permissions: RolePermission[]
}

export interface BlueprintRoleResource extends BlueprintRoleConfig, BlueprintResource {
  type: 'sanity.access.role'
}

export interface BlueprintProjectRoleResource extends BlueprintRoleResource {
  resourceType: 'project'
  resourceId: string
}

/**
 * Defines a role that is scoped to the same resource as the blueprint.
 * @param parameters The configuration of the role
 * @returns The role resource
 */
export function defineRole(parameters: BlueprintRoleConfig): BlueprintRoleResource {
  const errors: string[] = []

  if (!parameters.name || parameters.name.trim() === '') {
    errors.push('Role name is required')
  }

  if (!parameters.title || parameters.title.trim() === '') {
    errors.push('Role title is required')
  } else if (parameters.title.length > 100) {
    errors.push('Role title must be 100 characters or less')
  }

  if (!parameters.permissions || parameters.permissions.length < 1) {
    errors.push('Role must have at least one permission')
  }

  if (errors.length > 0) {
    const message = errors.join('\n')
    throw new Error(message)
  }

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
