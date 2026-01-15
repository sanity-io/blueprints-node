import {type BlueprintCorsOriginConfig, type BlueprintCorsOriginResource, validateCorsOrigin} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a CORS Origin to be managed in a Blueprint.
 * ```
 * defineCorsOrigin({
 *   origin: 'https://mydomain.com',
 *   allowCredentials: true
 * })
 * ```
 * @param parameters The CORS Origin configuration
 */
export function defineCorsOrigin(parameters: BlueprintCorsOriginConfig): BlueprintCorsOriginResource {
  const corsResource: BlueprintCorsOriginResource = {
    ...parameters,
    allowCredentials: parameters.allowCredentials || false,
    type: 'sanity.project.cors',
  }

  runValidation(() => validateCorsOrigin(corsResource))

  return corsResource
}
