import {parseWorkflowResource} from '@sanity/workflow-blueprint'
import {errorMessage} from '@sanity/workflow-engine'
import type {BlueprintError} from '../types/errors.js'

/**
 * Validates an Editorial Workflows Blueprint resource using the canonical
 * Workflows parser.
 * @param resource The Editorial Workflows resource
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateWorkflows(resource: unknown): BlueprintError[] {
  try {
    parseWorkflowResource(resource)
    return []
  } catch (error) {
    return [
      {
        type: 'invalid_value',
        message: errorMessage(error),
      },
    ]
  }
}
