import {type BlueprintError, validateResource} from '../index.js'

const PERMISSION_TYPES = ['sanity.document.filter', 'sanity.document.filter.mode']
const PERMISSION_NAME = /^(?!res-)(?!sanity)[a-z0-9-_]+$/

/**
 * Validates that the given resource is a valid Permission.
 * @param resource The Permission resource
 * @category Validation
 * @returns A list of validation errors
 */
export function validatePermission(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Permission config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Permission config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource, {projectContained: true})

  if (!('name' in resource) || !resource.name) {
    errors.push({type: 'missing_parameter', message: 'Permission name is required'})
  } else if (typeof resource.name !== 'string') {
    errors.push({type: 'invalid_type', message: 'Permission name must be a string'})
  } else if (!PERMISSION_NAME.test(resource.name)) {
    errors.push({
      type: 'invalid_format',
      message:
        'Permission name must only contain lowercase letters, numbers, hyphens, and underscores, and must not start with "sanity" or "res-"',
    })
  }

  if (!('type' in resource)) {
    errors.push({type: 'missing_parameter', message: 'Permission type is required'})
  } else if (resource.type !== 'sanity.access.permission') {
    errors.push({type: 'invalid_value', message: 'Permission type must be `sanity.access.permission`'})
  }

  if ('title' in resource && resource.title !== undefined) {
    if (typeof resource.title !== 'string') {
      errors.push({type: 'invalid_type', message: 'Permission title must be a string'})
    } else if (resource.title.length === 0) {
      errors.push({type: 'invalid_value', message: 'Permission title must not be empty'})
    }
  }

  if ('description' in resource && resource.description !== undefined && typeof resource.description !== 'string') {
    errors.push({type: 'invalid_type', message: 'Permission description must be a string'})
  }

  if (!('permissionType' in resource) || !resource.permissionType) {
    errors.push({type: 'missing_parameter', message: 'Permission permissionType is required'})
  } else if (typeof resource.permissionType !== 'string' || !PERMISSION_TYPES.includes(resource.permissionType)) {
    errors.push({type: 'invalid_value', message: `Permission permissionType must be one of ${PERMISSION_TYPES.join(', ')}`})
  }

  if (!('config' in resource) || !resource.config) {
    errors.push({type: 'missing_parameter', message: 'Permission `config` is required'})
  } else if (typeof resource.config !== 'object') {
    errors.push({type: 'invalid_type', message: 'Permission `config` must be an object'})
  } else if (!('filter' in resource.config) || !resource.config.filter) {
    errors.push({type: 'missing_parameter', message: 'Permission filter is required'})
  } else if (typeof resource.config.filter !== 'string') {
    errors.push({type: 'invalid_type', message: 'Permission filter must be a string'})
  }

  if ('project' in resource && resource.project !== undefined) {
    if (typeof resource.project !== 'string') {
      errors.push({type: 'invalid_type', message: 'Permission project must be a string'})
    } else if (resource.project.length === 0) {
      errors.push({type: 'invalid_value', message: 'Permission project must not be empty'})
    }
  }

  return errors
}
