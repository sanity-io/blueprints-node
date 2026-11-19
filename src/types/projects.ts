import type {BlueprintResource, BlueprintResourceLifecycle} from './resources.js'

/**
 * Reporesents a Sanity Project.
 * @see https://www.sanity.io/docs/http-reference/projects-api
 * @category Resource Types
 */
export interface BlueprintProjectResource extends BlueprintResource<BlueprintResourceLifecycle> {
  type: 'sanity.project'

  /** The name of the project, defaults to the resource name if not provided */
  displayName?: string
}

/**
 * Configuration for a Sanity Project.
 * @see https://www.sanity.io/docs/http-reference/projects-api
 * @category Resource Types
 * @interface
 */
export type BlueprintProjectConfig = Omit<BlueprintProjectResource, 'type'>
