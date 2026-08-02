import type {BlueprintResource, BlueprintResourceLifecycle} from './resources'

/**
 * Reporesents a Sanity Project.
 * @see https://www.sanity.io/docs/http-reference/projects-api
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintProjectResource extends BlueprintResource<BlueprintResourceLifecycle> {
  type: 'sanity.project'

  /** The name of the project, defaults to the resource name if not provided */
  displayName?: string
}

/**
 * Configuration for a Sanity Project.
 * @see https://www.sanity.io/docs/http-reference/projects-api
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintProjectConfig = Omit<BlueprintProjectResource, 'type'>

/**
 * Configuration for attaching an existing Sanity Project.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export interface BlueprintProjectAttachConfig {
  /** The resource name used within the Blueprint. */
  name: string
  /** The ID of the existing project. */
  id: string
}
