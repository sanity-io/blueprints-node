import type {BlueprintError} from '../types/errors.js'
import {validateResource} from './resources.js'

/**
 * Validates the fields shared by every singleton installation config resource.
 * @param resource The installation config resource
 * @param label The human-readable label used in error messages (e.g. `Media Library config`)
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateInstallationConfig(resource: unknown, label = 'Installation config'): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: `${label} must be provided`}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: `${label} must be an object`}]

  const errors: BlueprintError[] = validateResource(resource)

  if ('type' in resource && resource.type !== 'sanity.installation.config') {
    errors.push({type: 'invalid_value', message: `${label} type must be \`sanity.installation.config\``})
  }

  if (!('appType' in resource) || !resource.appType) {
    errors.push({type: 'missing_parameter', message: `${label} appType is required`})
  } else if (typeof resource.appType !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} appType must be a string`})
  }

  if (!('src' in resource) || !resource.src) {
    errors.push({type: 'missing_parameter', message: `${label} src is required`})
  } else if (typeof resource.src !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} src must be a string`})
  }

  return errors
}

/**
 * Validates that the given resource is a valid Media Library configuration.
 * @param resource The Media Library configuration resource
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateMediaLibraryConfig(resource: unknown): BlueprintError[] {
  const errors: BlueprintError[] = validateInstallationConfig(resource, 'Media Library config')

  if (resource && typeof resource === 'object' && 'appType' in resource && resource.appType !== 'media-library') {
    errors.push({type: 'invalid_value', message: 'Media Library config appType must be `media-library`'})
  }

  return errors
}
