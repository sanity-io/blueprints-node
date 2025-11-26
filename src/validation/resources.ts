import type {BlueprintError, BlueprintResource} from '../index.js'
import {runValidation} from '../utils/validation.js'

export function validateResource(resourceConfig: unknown): BlueprintError[] {
  if (!resourceConfig) return [{type: 'invalid_value', message: 'Resource config must be provided'}]
  if (typeof resourceConfig !== 'object') return [{type: 'invalid_type', message: 'Resource config must be an object'}]

  const errors: BlueprintError[] = []

  if (!('name' in resourceConfig)) {
    errors.push({type: 'missing_parameter', message: '`name` is required'})
  } else if (typeof resourceConfig.name !== 'string') {
    errors.push({type: 'invalid_type', message: '`name` must be a string'})
  }

  if (!('type' in resourceConfig)) {
    errors.push({type: 'missing_parameter', message: '`type` is required'})
  } else if (typeof resourceConfig.type !== 'string') {
    errors.push({type: 'invalid_type', message: '`type` must be a string'})
  }

  return errors
}

export function assertResource(resource: unknown): asserts resource is BlueprintResource {
  runValidation(() => validateResource(resource))
}
