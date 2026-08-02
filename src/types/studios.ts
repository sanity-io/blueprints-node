import type {ConfigEnv, InlineConfig} from 'vite'
import type {BlueprintProjectResourceLifecycle, BlueprintResource} from '../index.js'

/**
 * Custom Vite configuration for the Studio so it can be changed and extended.
 * This type matches the type in @sanity/cli-core and must continue to remain compatible.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export type UserViteConfig = ((config: InlineConfig, env: ConfigEnv) => InlineConfig | Promise<InlineConfig>) | InlineConfig

/** Controls how a Studio appears in the Sanity dashboard. */
export type StudioApplicationVisibility = 'default' | 'unlisted' | 'disabled'

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

  /** Hosted Studio slug. Defaults to the resource name when using {@link defineStudio}. */
  slug: string

  /** Human-readable Studio title. */
  title: string

  /** Optional Studio icon. */
  icon?: string

  /** Dashboard visibility. */
  visibility?: StudioApplicationVisibility

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

  /** Custom Vite configuration for the Studio so it can be changed and extended. */
  vite?: UserViteConfig

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
export type BlueprintStudioConfig = Omit<BlueprintStudioResource, 'type' | 'slug' | 'autoUpdates'> & {
  /**
   * Hosted Studio slug.
   * @defaultValue The `name` of the resource
   */
  slug?: string

  /**
   * Auto update settings for the Studio.
   * @defaultValue `{enabled: true}`
   */
  autoUpdates?: BlueprintStudioResource['autoUpdates']
}
