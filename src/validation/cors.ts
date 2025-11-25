import type {BlueprintError} from '../index.js'

export function validateCorsOrigin(parameters: unknown): BlueprintError[] {
  if (!parameters) return [{type: 'invalid_value', message: 'CORS Origin config must be provided'}]
  if (typeof parameters !== 'object') return [{type: 'invalid_type', message: 'CORS Origin config must be an object'}]

  const errors: BlueprintError[] = []

  if (!('name' in parameters) || !parameters.name) {
    errors.push({type: 'missing_parameter', message: 'CORS Origin name is required'})
  } else if (typeof parameters.name !== 'string') {
    errors.push({type: 'invalid_type', message: 'CORS Origin name must be a string'})
  }

  if (!('origin' in parameters) || !parameters.origin) {
    errors.push({type: 'missing_parameter', message: 'CORS Origin URL is required'})
  } else if (typeof parameters.origin !== 'string') {
    errors.push({type: 'invalid_type', message: 'CORS Origin URL must be a string'})
  }

  return errors
}
