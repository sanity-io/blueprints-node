import type {BlueprintError, BlueprintRoleConfig} from '../index.js'

/**
 * Validates a role.
 * @param parameters The configuration of the role
 * @returns The errors
 */
export function validateRole(parameters: BlueprintRoleConfig): BlueprintError[] {
  const errors: BlueprintError[] = []

  if (!parameters.name || parameters.name.trim() === '') {
    errors.push({type: 'missing_parameter', message: 'Role name is required'})
  }

  if (!parameters.title || parameters.title.trim() === '') {
    errors.push({type: 'missing_parameter', message: 'Role title is required'})
  } else if (parameters.title.length > 100) {
    errors.push({type: 'invalid_value', message: 'Role title must be 100 characters or less'})
  }

  if (!parameters.permissions || parameters.permissions.length < 1) {
    errors.push({type: 'invalid_value', message: 'Role must have at least one permission'})
  }

  return errors
}
