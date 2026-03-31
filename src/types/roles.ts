import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * A permission definition for a role.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
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
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export type BlueprintRoleConfig = Omit<BlueprintResource<BlueprintProjectResourceLifecycle>, 'type'> &
  (
    | {
        /**
         * A descriptive title for the role
         * @defaultValue The `name` of the resource
         * @hidden
         */
        title: string
      }
    | {
        /**
         * A descriptive title for the role
         * @defaultValue The `name` of the resource
         */
        displayName: string
      }
  ) & {
    description?: string
    appliesToUsers: boolean
    appliesToRobots: boolean
    permissions: RolePermission[]
  }

type RoleDisplay = {
  /**
   * A descriptive title for the role
   * @defaultValue The `name` of the resource
   * @hidden
   */
  title?: string
  /**
   * A descriptive title for the role
   * @defaultValue The `name` of the resource
   */
  displayName?: string
}

/**
 * A custom role resource
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export type BlueprintRoleResource = Omit<BlueprintRoleConfig, 'title' | 'displayName'> &
  RoleDisplay &
  BlueprintResource<BlueprintProjectResourceLifecycle> & {
    type: 'sanity.access.role'
  }

/**
 * A custom role resource that is tied to a specific project
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export type BlueprintProjectRoleResource = BlueprintRoleResource & {
  resourceType: 'project'
  resourceId: string
}
