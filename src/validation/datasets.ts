import {type BlueprintError, validateResource} from '../index.js'

/**
 * Validates that the given resource is a valid Dataset.
 * @param resource The Dataset resource
 * @returns A list of validation errors
 */
export function validateDataset(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Dataset config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Dataset config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource, {projectContained: true})

  if (!('name' in resource) || !resource.name) {
    errors.push({type: 'missing_parameter', message: 'Dataset name is required'})
  } else if (typeof resource.name !== 'string') {
    errors.push({type: 'invalid_type', message: 'Dataset name must be a string'})
  }

  if (!('type' in resource)) {
    errors.push({type: 'missing_parameter', message: 'Dataset type is required'})
  } else if (resource.type !== 'sanity.project.dataset') {
    errors.push({type: 'invalid_value', message: 'Dataset type must be `sanity.project.dataset`'})
  }

  // validate ACL mode if provided
  if ('aclMode' in resource) {
    if (typeof resource.aclMode !== 'string') {
      errors.push({type: 'invalid_type', message: 'Dataset aclMode must be one of `custom`, `public`, or `private`'})
    } else {
      const aclMode: string = resource.aclMode
      if (aclMode !== 'custom' && aclMode !== 'public' && aclMode !== 'private') {
        errors.push({type: 'invalid_value', message: 'Dataset aclMode must be one of `custom`, `public`, or `private`'})
      }
    }
  }

  // validate project if provided
  if ('project' in resource) {
    if (typeof resource.project !== 'string') {
      errors.push({type: 'invalid_type', message: 'Dataset project must be a string'})
    }
  }

  return errors
}
