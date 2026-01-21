import type {BlueprintResource} from '../index.js'

/**
 * A permission definition for a role.
 */
export interface RolePermission {
  /** Predefined permission name (e.g., 'sanity-all-documents') */
  name: string
  /** Permission action (e.g., 'read', 'mode') */
  action: string
  /** Additional parameters for the permission */
  params?: Record<string, unknown>
}

/**
 * Configuration for a custom role.
 */
export interface BlueprintRoleConfig extends Omit<BlueprintResource, 'type'> {
  title: string
  description?: string
  appliesToUsers: boolean
  appliesToRobots: boolean
  permissions: RolePermission[]
}

/**
 * A custom role resource
 */
export interface BlueprintRoleResource extends BlueprintRoleConfig, BlueprintResource {
  type: 'sanity.access.role'
}

/**
 * A custom role resource that is tied to a specific project
 */
export interface BlueprintProjectRoleResource extends BlueprintRoleResource {
  resourceType: 'project'
  resourceId: string
}
