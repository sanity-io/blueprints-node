import type {BlueprintDatasetConfig, BlueprintError} from '../index.js'

export function validateDataset(parameters: BlueprintDatasetConfig): BlueprintError[] {
  const errors: BlueprintError[] = []

  // validate ACL mode if provided
  if (typeof parameters.aclMode !== 'undefined') {
    const aclMode: string = parameters.aclMode
    if (aclMode !== 'custom' && aclMode !== 'public' && aclMode !== 'private') {
      errors.push({type: 'invalid_value', message: 'aclMode must be one of `custom`, `public`, or `private`'})
    }
  }

  // validate project if provided
  if (parameters.project) {
    if (typeof parameters.project !== 'string') {
      errors.push({type: 'invalid_type', message: 'project must be a string'})
    }
  }

  return errors
}
