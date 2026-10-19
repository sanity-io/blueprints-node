import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * The type of a custom permission.
 *
 *  - **sanity.document.filter** A role grants document actions, such as `read` and `update`, on the documents that match the filter.
 *  - **sanity.document.filter.mode** A role grants the `mode` action, with a `mode` param such as `read` or `publish`, on the documents that match the filter.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintPermissionType = 'sanity.document.filter' | 'sanity.document.filter.mode'

/**
 * A custom permission resource that roles can grant.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintPermissionResource extends BlueprintResource<BlueprintProjectResourceLifecycle> {
  type: 'sanity.access.permission'
  /**
   * The name of the permission.
   *
   * Lowercase letters, numbers, hyphens, and underscores only. Must not start with `sanity` or `res-`.
   */
  name: string
  /** A human-readable title. Defaults to `name`. */
  title?: string
  /** A description of the permission. Defaults to an empty string. */
  description?: string
  /**
   * The type of the permission. It cannot change after the permission is created.
   *
   * Manage creates content resources as `sanity.document.filter.mode`, and lists only custom permissions of that type.
   */
  permissionType: BlueprintPermissionType
  /** The configuration of the permission. */
  config: {
    /** A GROQ filter that selects the documents that the permission applies to, e.g. `_type == "article"`. */
    filter: string
  }
  /**
   * The project ID of the project that contains the permission.
   *
   * The `project` attribute must be defined if your blueprint is scoped to an organization and the stack has no default project.
   */
  project?: string
}

/**
 * Configuration for a custom permission resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export type BlueprintPermissionConfig = Omit<BlueprintPermissionResource, 'type'>

/**
 * Configuration for a content resource: a custom permission of type `sanity.document.filter.mode`, as the Manage UI makes it.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintContentResourceConfig extends Omit<BlueprintPermissionConfig, 'permissionType' | 'config'> {
  /** The document types that the content resource applies to. Omit to apply to documents of any type. */
  documentTypes?: string[]
  /** A GROQ filter that selects documents, e.g. `branch == "london"`. It is joined to `documentTypes` with `&&`. */
  filter?: string
}

/**
 * The access level that a role grants on a content resource.
 *
 *  - **read** "Read" in the Manage UI
 *  - **create** "Update and create" in the Manage UI
 *  - **publish** "Publish" in the Manage UI
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintContentResourceMode = 'read' | 'create' | 'publish'
