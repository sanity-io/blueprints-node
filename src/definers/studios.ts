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
    title: config.name,
    autoUpdates: {
      enabled: config.autoUpdates?.enabled ?? true,
      version: config.autoUpdates?.version,
    },
    ...config,
    type: 'sanity.studio',
  }

  runValidation(() => validateStudio(studioResource))

  return studioResource
}
