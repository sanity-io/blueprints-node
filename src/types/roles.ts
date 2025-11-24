import type {BlueprintResource} from '../index.js'

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
