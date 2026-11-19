import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * A permission definition for a role.
 * @category Resource Types
 * @expand
 */
export interface RolePermission {
  /** Predefined permission name (e.g., 'sanity-all-documents'), or a reference to a permission in the blueprint (e.g., '$.resources.articles-only') */
  name: string
  /** Permission action (e.g., 'read', 'mode') */
  action: string
  /** Additional parameters for the permission */
  params?: Record<string, unknown>
}

/**
 * Configuration for a custom role.
 * @category Resource Types
 */
export interface BlueprintRoleConfig extends Omit<BlueprintResource<BlueprintProjectResourceLifecycle>, 'type'> {
  title: string
  description?: string
  appliesToUsers: boolean
  appliesToRobots: boolean
  permissions: RolePermission[]
}

/**
 * A custom role resource
 * @category Resource Types
 */
export interface BlueprintRoleResource extends BlueprintRoleConfig, BlueprintResource<BlueprintProjectResourceLifecycle> {
  type: 'sanity.access.role'
}

/**
 * A custom role resource that is tied to a specific project
 * @category Resource Types
 */
export interface BlueprintProjectRoleResource extends BlueprintRoleResource {
  resourceType: 'project'
  resourceId: string
}
