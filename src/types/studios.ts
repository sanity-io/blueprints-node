import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * Represents a Studio resource.
 * @see https://www.sanity.io/docs/studio
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintStudioResource extends BlueprintResource<BlueprintProjectResourceLifecycle> {
  type: 'sanity.studio'

  /** The relative location of the studio source code. */
  src: string

  /**
   * Auto update settings for the studio.
   */
  autoUpdates: {
    /** Whether auto updates are enabled for the studio */
    enabled: boolean

    /** What "version"/"channel" to use for auto updates */
    version?: string // 'next', 'stable', 'latest' or a semantic version (e.g., "1.2.3", "2.0.0-beta.1")
  }

  /** The base path of the studio URL. Defaults to '/' */
  basePath?: string

  /** Whether or not to minify the source code. Defaults to true. */
  minify?: boolean

  /** Whether or not to configure the reactCompiler. Defaults to false. */
  reactCompiler?: boolean

  /** Whether or not to generate source maps. Defaults to false. */
  sourceMap?: boolean

  /**
   * The project ID of the project that contains your Studio.
   *
   * The `project` attribute must be defined if your blueprint is scoped to an organization.
   */
  project?: string
}

/**
 * Configuration for a Studio resource.
 * @see https://www.sanity.io/docs/studio
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export interface BlueprintStudioConfig extends Omit<BlueprintStudioResource, 'type'> {}
