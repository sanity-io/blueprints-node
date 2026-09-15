import type {BlueprintError} from '../types/errors.js'
import {isReference} from '../utils/validation.js'
import {isContainedRelativePath} from './applications.js'
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

  if (!('root' in resource) || !resource.root) {
    errors.push({type: 'missing_parameter', message: `${label} root is required`})
  } else if (typeof resource.root !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} root must be a string`})
  } else if (!isReference(resource.root) && !isContainedRelativePath(resource.root)) {
    errors.push({type: 'invalid_value', message: `${label} root must be a relative path within the blueprint directory`})
  }

  return errors
}

/**
 * Validates a single Media Library field.
 * @param field The field
 * @param label The human-readable label used in error messages (e.g. `Media Library config field`)
 * @returns A list of validation errors
 */
function validateMediaLibraryField(field: unknown, label: string): BlueprintError[] {
  if (!field || typeof field !== 'object') return [{type: 'invalid_type', message: `${label} must be an object`}]

  const errors: BlueprintError[] = []

  if (!('name' in field) || !field.name) {
    errors.push({type: 'missing_parameter', message: `${label} name is required`})
  } else if (typeof field.name !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} name must be a string`})
  }

  if (!('title' in field) || !field.title) {
    errors.push({type: 'missing_parameter', message: `${label} title is required`})
  } else if (typeof field.title !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} title must be a string`})
  }

  if (!('src' in field) || !field.src) {
    errors.push({type: 'missing_parameter', message: `${label} src is required`})
  } else if (typeof field.src !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} src must be a string`})
  } else if (!isReference(field.src) && !isContainedRelativePath(field.src)) {
    errors.push({type: 'invalid_value', message: `${label} src must be a relative path within the config root`})
  }

  if ('public' in field && typeof field.public !== 'undefined' && typeof field.public !== 'boolean') {
    errors.push({type: 'invalid_type', message: `${label} public must be a boolean`})
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

  if (!resource || typeof resource !== 'object') return errors

  if ('appType' in resource && resource.appType !== 'media-library') {
    errors.push({type: 'invalid_value', message: 'Media Library config appType must be `media-library`'})
  }

  if (!('fields' in resource) || typeof resource.fields === 'undefined') {
    errors.push({type: 'missing_parameter', message: 'Media Library config fields is required'})
  } else if (!Array.isArray(resource.fields)) {
    errors.push({type: 'invalid_type', message: 'Media Library config fields must be an array'})
  } else if (resource.fields.length === 0) {
    errors.push({type: 'invalid_value', message: 'Media Library config must declare at least one field'})
  } else {
    for (const field of resource.fields) {
      errors.push(...validateMediaLibraryField(field, 'Media Library config field'))
    }

    const names = resource.fields
      .filter((field): field is {name: string} => Boolean(field) && typeof field === 'object' && typeof field.name === 'string')
      .map((field) => field.name)
    if (new Set(names).size !== names.length) {
      errors.push({type: 'invalid_value', message: 'Media Library config field names must be unique'})
    }
  }

  return errors
}
