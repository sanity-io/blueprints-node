import type {BlueprintError} from '../index.js'

/**
 * Validates a role.
 * @param parameters The configuration of the role
 * @returns The errors
 */
export function validateRole(parameters: unknown): BlueprintError[] {
  if (!parameters) return [{type: 'invalid_value', message: 'Role config must be provided'}]
  if (typeof parameters !== 'object') return [{type: 'invalid_type', message: 'Role config must be an object'}]

  const errors: BlueprintError[] = []

  if (!('name' in parameters)) {
    errors.push({type: 'missing_parameter', message: 'Role name is required'})
  } else if (typeof parameters.name !== 'string') {
    errors.push({type: 'invalid_type', message: 'Role name must be a string'})
  }

  if (!('type' in parameters)) {
    errors.push({type: 'missing_parameter', message: 'Role type is required'})
  } else if (parameters.type !== 'sanity.access.role') {
    errors.push({type: 'invalid_value', message: 'Role type must be `sanity.access.role`'})
  }

  if (!('title' in parameters)) {
    errors.push({type: 'missing_parameter', message: 'Role title is required'})
  } else if (typeof parameters.title !== 'string') {
    errors.push({type: 'invalid_type', message: 'Role title must be a string'})
  } else if (parameters.title.length > 100) {
    errors.push({type: 'invalid_value', message: 'Role title must be 100 characters or less'})
  }

  if (!('permissions' in parameters) || !Array.isArray(parameters.permissions) || parameters.permissions.length < 1) {
    errors.push({type: 'invalid_value', message: 'Role must have at least one permission'})
  }

  return errors
}

export function validateProjectRole(parameters: unknown): BlueprintError[] {
  const errors = validateRole(parameters)

  // only do validation if parameters is provided, otherwise just return the errors
  if (parameters && typeof parameters === 'object') {
    if (!('resourceType' in parameters)) {
      errors.push({type: 'missing_parameter', message: 'Role resource type must be `project`'})
    } else if (parameters.resourceType !== 'project') {
      errors.push({type: 'invalid_value', message: 'Role resource type must be `project`'})
    }

    if (!('resourceId' in parameters)) {
      errors.push({type: 'missing_parameter', message: 'Role resource ID is required'})
    } else if (typeof parameters.resourceId !== 'string') {
      errors.push({type: 'invalid_type', message: 'Role resource ID must be a string'})
    }
  }

  return errors
}
