import {validateStudio} from '../index.js'
import type {BlueprintStudioConfig, BlueprintStudioResource} from '../types/studios'
import {runValidation} from '../utils/validation'

/**
 * Defines a studio.
 *
 * ```ts
 * defineStudio({
 *   name: 'my-studio',
 *   src: 'studios/my-studio',
 *   autoUpdates: {
 *     enabled: true
 *   }
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
    type: 'sanity.studio',
  }

  runValidation(() => validateStudio(studioResource))

  return studioResource
}
