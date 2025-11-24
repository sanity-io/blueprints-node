import {validateCorsOrigin, type BlueprintCorsOriginConfig, type BlueprintCorsOriginResource} from '../index.js'
import {runValidation} from '../utils/validation.js'

export function defineCorsOrigin(parameters: BlueprintCorsOriginConfig): BlueprintCorsOriginResource {
  runValidation(() => validateCorsOrigin(parameters))

  return {
    ...parameters,
    allowCredentials: parameters.allowCredentials || false,
    type: 'sanity.project.cors',
  }
}
