import {type BlueprintMediaLibraryConfigConfig, type BlueprintMediaLibraryConfigResource, validateMediaLibraryConfig} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a singleton Media Library configuration.
 *
 * @remarks
 * The Media Library is a Sanity-owned singleton, so this resource carries no
 * application identity of its own — only the config `src`. The `name` defaults
 * to `media-library`, and the provider resolves the organization's media
 * library installation id at deploy time.
 *
 * ```ts
 * defineMediaLibraryConfig({
 *   src: './media-library.config.ts',
 * })
 * ```
 * @param config The Media Library configuration
 * @public
 * @beta Configuring the Media Library via Blueprints is experimental. This may be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintMediaLibraryConfigConfig
 * @returns The Media Library configuration resource
 * @hidden
 */
export function defineMediaLibraryConfig(config: BlueprintMediaLibraryConfigConfig): BlueprintMediaLibraryConfigResource {
  const {name, ...rest} = config

  // ponytail: media-library is the only singleton config today. Extract a
  // generic defineInstallationConfig when a second installation type appears.
  const resource: BlueprintMediaLibraryConfigResource = {
    ...rest,
    type: 'sanity.installation.config',
    appType: 'media-library',
    name: name ?? 'media-library',
  }

  runValidation(() => validateMediaLibraryConfig(resource))

  return resource
}
