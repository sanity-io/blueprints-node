import type {WorkspaceSchemaInput} from '@sanity/cli-build/_internal/manifest'
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

/**
 * The set of valid application visibilities.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export const APPLICATION_VISIBILITIES = ['default', 'unlisted', 'disabled'] as const

/**
 * The visibility of the studio in the dashboard.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export type ApplicationVisibility = (typeof APPLICATION_VISIBILITIES)[number]

/**
 * A workspace definition extracted from a studio's configuration during the build.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export type StudioWorkspace = {
  projectId: string
  dataset: string
  schemaDescriptorId: string
  name: string
  title: string | undefined
  subtitle: string | undefined
  basePath: string | undefined
  icon: string | undefined
}

/**
 * Represents a Studio resource.
 * @see https://www.sanity.io/docs/studio
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintStudioResource extends BlueprintResource<BlueprintProjectResourceLifecycle> {
  type: 'sanity.studio'

  /** The relative location of the studio directory. */
  root: string

  /**
   * The project ID of the project that contains your Studio.
   *
   * The `project` attribute must be defined if your blueprint is scoped to an organization.
   */
  project?: string

  /** The slug to be used in the studio hostname. Must match `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`. */
  slug: string

  /** Title for the studio. */
  title: string

  /** Icon for the studio in the browser. */
  icon?: string

  /** Dashboard visibility */
  visibility?: ApplicationVisibility

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
   * Custom Vite configuration for the Studio so it can be changed and extended.
   * Install vite to dev dependencies to get detailed type information.
   */
  vite?: UserViteConfig

  /** Schema inputs extracted from the studio's schema definition. */
  schemaInputs?: WorkspaceSchemaInput[]

  /** Workspaces extracted from the studio's configuration. */
  workspaces?: StudioWorkspace[]

  /** Module federation manifest */
  mfManifest?: Record<string, unknown>
}

/**
 * Configuration for a Studio resource.
 * @see https://www.sanity.io/docs/studio
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export interface BlueprintStudioConfig extends Omit<BlueprintStudioResource, 'type' | 'slug' | 'title' | 'autoUpdates'> {
  /**
   * The slug to be used in the studio hostname. Must match `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`.
   *
   * Defaults to the name of the resource.
   * Set `slug` explicitly if the resource name is not a valid hostname.
   */
  slug?: string

  /** Title for the studio. Defaults to the name of the resource. */
  title?: string

  /**
   * Auto update settings for the studio. Defaults to `{enabled: true}`.
   */
  autoUpdates?: {
    /** Whether auto updates are enabled for the studio. Defaults to true. */
    enabled?: boolean

    /** What "version"/"channel" to use for auto updates */
    version?: string // 'next', 'stable', 'latest' or a semantic version (e.g., "1.2.3", "2.0.0-beta.1")
  }
}
