import type {BlueprintResource} from '../index.js'

/**
 * Fields shared by every singleton installation config resource.
 *
 * @remarks
 * The backend selects a provider from the resource `type`
 * (`sanity.installation.config`), so every installation config shares that one
 * type and is discriminated by `appType`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintInstallationConfigResourceBase extends BlueprintResource {
  type: 'sanity.installation.config'

  /** The installation this config targets. Discriminates the config shape. */
  appType: string

  /**
   * The config build directory, relative to the blueprint file. Contains the
   * config's `package.json`; every field `src` is resolved relative to it.
   */
  root: string
}

/**
 * One custom field a Media Library configuration exposes.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintMediaLibraryField {
  /** Unique within the Media Library config. */
  name: string

  /** Human-readable title for the field. */
  title: string

  /** The location of the field source code, relative to `root`. */
  src: string

  /** Readable outside the owning organization. */
  public?: boolean
}

/**
 * Represents a singleton Media Library configuration resource.
 *
 * @remarks
 * The Media Library is a Sanity-owned singleton, so this resource carries no
 * application identity of its own — it only names the target `appType`, the
 * config `root`, and its `fields`. The provider resolves the organization's
 * media library installation id at deploy time.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintMediaLibraryConfigResource extends BlueprintInstallationConfigResourceBase {
  /** The target installation this config applies to. Set by the definer. */
  appType: 'media-library'

  /** The custom fields the Media Library config exposes. */
  fields: BlueprintMediaLibraryField[]

  /** The local version of `sanity` at deployment. Populated during deployment. */
  version?: string
}

/**
 * A union of every singleton installation config resource, discriminated by `appType`.
 *
 * @remarks
 * Media Library is the only member today; additional installation configs are
 * added to this union.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export type BlueprintInstallationConfigResource = BlueprintMediaLibraryConfigResource

/**
 * Configuration for a singleton Media Library configuration resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintMediaLibraryConfigConfig = Omit<BlueprintMediaLibraryConfigResource, 'type' | 'appType'>
