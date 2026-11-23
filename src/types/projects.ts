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

  /**
   * Path to the logo image, relative to the blueprint file. Uploaded on every deploy; omitting it removes the logo.
   * PNG, JPEG, BMP, GIF, TIFF, SVG, WebP, HEIF or AVIF, up to 5 MB.
   */
  logo?: string
}

/**
 * Configuration for a Sanity Project.
 * @see https://www.sanity.io/docs/http-reference/projects-api
 * @category Resource Types
 * @interface
 */
export type BlueprintProjectConfig = Omit<BlueprintProjectResource, 'type'>
