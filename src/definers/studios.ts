import {validateStudio} from '../index.js'
import type {BlueprintStudioConfig, BlueprintStudioResource} from '../types/studios.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a studio.
 *
 * ```ts
 * defineStudio({
 *   name: 'my-studio',
 *   src: 'studios/my-studio',
 *   title: 'My Studio',
 * })
 * ```
 * @param parameters The studio configuration
 * @public
 * @beta Deploying Studios via Blueprints is experimental. This may be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintStudioConfig
 * @returns The studio resource
 * @hidden
 */
export function defineStudio(config: BlueprintStudioConfig): BlueprintStudioResource {
  const studioResource: BlueprintStudioResource = {
    ...config,
    slug: config.slug || config.name,
    autoUpdates: config.autoUpdates ?? {enabled: true},
    type: 'sanity.studio',
  }

  runValidation(() => validateStudio(studioResource))

  return studioResource
}
