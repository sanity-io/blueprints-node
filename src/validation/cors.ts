import {type BlueprintError, validateResource} from '../index.js'

/**
 * Validates that the given resource is a valid CORS origin.
 * @param resource The CORS origin resource
 * @returns A list of validation errors
 */
export function validateCorsOrigin(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'CORS Origin config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'CORS Origin config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource, {projectContained: true})

  if (!('name' in resource) || !resource.name) {
    errors.push({type: 'missing_parameter', message: 'CORS Origin name is required'})
  } else if (typeof resource.name !== 'string') {
    errors.push({type: 'invalid_type', message: 'CORS Origin name must be a string'})
  }

  if (!('type' in resource)) {
    errors.push({type: 'missing_parameter', message: 'CORS Origin type is required'})
  } else if (resource.type !== 'sanity.project.cors') {
    errors.push({type: 'invalid_value', message: 'CORS Origin type must be `sanity.project.cors`'})
  }

  if (!('origin' in resource) || !resource.origin) {
    errors.push({type: 'missing_parameter', message: 'CORS Origin URL is required'})
  } else if (typeof resource.origin !== 'string') {
    errors.push({type: 'invalid_type', message: 'CORS Origin URL must be a string'})
  }

  if ('project' in resource) {
    if (typeof resource.project !== 'string') {
      errors.push({type: 'invalid_type', message: 'CORS Origin project must be a string'})
    }
  }

  return errors
}
