import type {BlueprintResource} from '../index.js'

/**
 * Represents a singleton Media Library configuration resource.
 *
 * @remarks
 * The Media Library is a Sanity-owned singleton, so this resource carries no
 * application identity of its own — only the config `src`. The provider
 * resolves the organization's media library installation id at deploy time.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintMediaLibraryConfigResource extends BlueprintResource {
  type: 'sanity.installation.config'

  /** The target installation this config applies to. Set by the definer. */
  appType: 'media-library'

  /** The relative location of the media library config module. */
  src: string
}

/**
 * Configuration for a singleton Media Library configuration resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintMediaLibraryConfigConfig = Omit<BlueprintMediaLibraryConfigResource, 'type' | 'name' | 'appType'> & {
  /**
   * The name of the resource. Unique within the blueprint.
   *
   * Defaults to `media-library`.
   */
  name?: string
}
