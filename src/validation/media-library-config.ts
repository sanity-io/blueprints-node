import type {BlueprintError} from '../types/errors.js'
import {validateResource} from './resources.js'

/**
 * Validates that the given resource is a valid Media Library configuration.
 * @param resource The Media Library configuration resource
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateMediaLibraryConfig(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Media Library config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Media Library config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource)

  if ('type' in resource && resource.type !== 'sanity.installation.config') {
    errors.push({type: 'invalid_value', message: 'Media Library config type must be `sanity.installation.config`'})
  }

  if ('appType' in resource && resource.appType !== 'media-library') {
    errors.push({type: 'invalid_value', message: 'Media Library config appType must be `media-library`'})
  }

  if (!('src' in resource) || !resource.src) {
    errors.push({type: 'missing_parameter', message: 'Media Library config src is required'})
  } else if (typeof resource.src !== 'string') {
    errors.push({type: 'invalid_type', message: 'Media Library config src must be a string'})
  }

  return errors
}
