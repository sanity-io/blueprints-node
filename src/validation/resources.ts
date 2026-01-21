import type {BlueprintError, BlueprintResource} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Validates that the given resource is a valid resource.
 * @param resource The resource
 * @param options Validation options
 * @returns A list of validation errors
 */
export function validateResource(resourceConfig: unknown, options?: {projectContained?: boolean}): BlueprintError[] {
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

  if ('lifecycle' in resourceConfig) {
    if (typeof resourceConfig.lifecycle !== 'object' || resourceConfig.lifecycle === null) {
      errors.push({type: 'invalid_type', message: '`lifecycle` must be an object'})
    } else {
      if ('deletionPolicy' in resourceConfig.lifecycle) {
        if (typeof resourceConfig.lifecycle.deletionPolicy !== 'string') {
          errors.push({type: 'invalid_type', message: '`deletionPolicy` must be a string'})
        } else if (!['allow', 'retain', 'replace', 'protect'].includes(resourceConfig.lifecycle.deletionPolicy)) {
          errors.push({type: 'invalid_value', message: '`deletionPolicy` must be one of allow, retain, replace, protect'})
        }
      }

      if ('ownershipAction' in resourceConfig.lifecycle) {
        const ownershipAction = resourceConfig.lifecycle.ownershipAction
        if (typeof ownershipAction !== 'object' || ownershipAction === null) {
          errors.push({type: 'invalid_type', message: '`ownershipAction` must be an object'})
        } else if (!('type' in ownershipAction)) {
          errors.push({type: 'missing_parameter', message: '`ownershipAction.type` is required'})
        } else if (typeof ownershipAction.type !== 'string') {
          errors.push({type: 'invalid_type', message: '`ownershipAction.type` must be a string'})
        } else if (!['attach'].includes(ownershipAction.type)) {
          errors.push({type: 'invalid_value', message: '`ownershipAction.type` must be attach'})
        } else {
          if (ownershipAction.type === 'attach') {
            if (!('id' in ownershipAction)) {
              errors.push({type: 'missing_parameter', message: '`ownershipAction.id` is required for attach'})
            } else if (typeof ownershipAction.id !== 'string') {
              errors.push({type: 'invalid_type', message: '`ownershipAction.id` must be a string'})
            }

            if (options?.projectContained) {
              if (!('projectId' in ownershipAction)) {
                errors.push({type: 'missing_parameter', message: '`ownershipAction.projectId` is required for attach'})
              } else if (typeof ownershipAction.projectId !== 'string') {
                errors.push({type: 'invalid_type', message: '`ownershipAction.projectId` must be a string'})
              }
            }
          }
        }
      }
    }
  }

  return errors
}

export function assertResource(resource: unknown): asserts resource is BlueprintResource {
  runValidation(() => validateResource(resource))
}
