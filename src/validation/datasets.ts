import type {BlueprintError} from '../index.js'

export function validateDataset(parameters: unknown): BlueprintError[] {
  if (!parameters) return [{type: 'invalid_value', message: 'Dataset config must be provided'}]
  if (typeof parameters !== 'object') return [{type: 'invalid_type', message: 'Dataset config must be an object'}]

  const errors: BlueprintError[] = []

  // validate ACL mode if provided
  if ('aclMode' in parameters) {
    if (typeof parameters.aclMode !== 'string') {
      errors.push({type: 'invalid_type', message: 'Dataset aclMode must be one of `custom`, `public`, or `private`'})
    } else {
      const aclMode: string = parameters.aclMode
      if (aclMode !== 'custom' && aclMode !== 'public' && aclMode !== 'private') {
        errors.push({type: 'invalid_value', message: 'Dataset aclMode must be one of `custom`, `public`, or `private`'})
      }
    }
  }

  // validate project if provided
  if ('project' in parameters) {
    if (typeof parameters.project !== 'string') {
      errors.push({type: 'invalid_type', message: 'Dataset project must be a string'})
    }
  }

  return errors
}
