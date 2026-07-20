import type {BlueprintError} from '../types/errors.js'
import {validateResource} from './resources.js'

/**
 * Validates that the given resource is a valid Studio.
 * @param resource The Studio resource
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateStudio(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Studio config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Studio config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource, {projectContained: true})

  if ('type' in resource && resource.type !== 'sanity.studio') {
    errors.push({type: 'invalid_value', message: 'Studio type must be `sanity.studio`'})
  }

  if (!('src' in resource) || !resource.src) {
    errors.push({type: 'missing_parameter', message: 'Studio src is required'})
  } else if (typeof resource.src !== 'string') {
    errors.push({type: 'invalid_type', message: 'Studio src must be a string'})
  }

  if (!('autoUpdates' in resource) || !resource.autoUpdates) {
    errors.push({type: 'missing_parameter', message: 'Studio autoUpdates is required'})
  } else if (typeof resource.autoUpdates !== 'object') {
    errors.push({type: 'invalid_type', message: 'Studio autoUpdates must be an object'})
  } else {
    if (!('enabled' in resource.autoUpdates)) {
      errors.push({type: 'missing_parameter', message: 'Studio autoUpdates.enabled is required'})
    } else if (typeof resource.autoUpdates.enabled !== 'boolean') {
      errors.push({type: 'invalid_type', message: 'Studio autoUpdates.enabled must be a boolean'})
    }

    if ('version' in resource.autoUpdates) {
      if (typeof resource.autoUpdates.version !== 'string') {
        errors.push({type: 'invalid_type', message: 'Studio autoUpdates.version must be a string'})
      }
    }
  }

  if ('basePath' in resource) {
    if (typeof resource.basePath !== 'string') {
      errors.push({type: 'invalid_type', message: 'Studio basePath must be a string'})
    }
  }

  if ('minify' in resource) {
    if (typeof resource.minify !== 'boolean') {
      errors.push({type: 'invalid_type', message: 'Studio minify must be a boolean'})
    }
  }

  if ('reactCompiler' in resource) {
    if (typeof resource.reactCompiler !== 'boolean') {
      errors.push({type: 'invalid_type', message: 'Studio reactCompiler must be a boolean'})
    }
  }

  if ('sourceMap' in resource) {
    if (typeof resource.sourceMap !== 'boolean') {
      errors.push({type: 'invalid_type', message: 'Studio sourceMap must be a boolean'})
    }
  }

  if ('project' in resource) {
    if (typeof resource.project !== 'string') {
      errors.push({type: 'invalid_type', message: 'Studio project must be a string'})
    }
  }

  return errors
}
