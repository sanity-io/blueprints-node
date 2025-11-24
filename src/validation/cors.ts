import type {BlueprintCorsOriginConfig, BlueprintError} from '../index.js'

export function validateCorsOrigin(parameters: BlueprintCorsOriginConfig): BlueprintError[] {
  const errors: BlueprintError[] = []

  if (!parameters.name || parameters.name.trim() === '') {
    errors.push({type: 'missing_parameter', message: 'CORS Origin name is required'})
  }

  if (!parameters.origin || parameters.origin.trim() === '') {
    errors.push({type: 'missing_parameter', message: 'CORS Origin URL is required'})
  }

  return errors
}
