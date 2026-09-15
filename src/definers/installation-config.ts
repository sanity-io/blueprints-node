import {type BlueprintMediaLibraryConfigConfig, type BlueprintMediaLibraryConfigResource, validateMediaLibraryConfig} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a singleton Media Library configuration.
 *
 * @remarks
 * The Media Library is a Sanity-owned singleton, so this resource carries no
 * application identity of its own — only the config `root` and its `fields`.
 * The provider resolves the organization's media library installation id at
 * deploy time.
 *
 * ```ts
 * defineMediaLibraryConfig({
 *   name: 'media-library',
 *   root: './media-library',
 *   fields: [{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'}],
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
  const resource = {
    ...config,
    type: 'sanity.installation.config',
    appType: 'media-library',
  } satisfies BlueprintMediaLibraryConfigResource

  runValidation(() => validateMediaLibraryConfig(resource))

  return resource
}
