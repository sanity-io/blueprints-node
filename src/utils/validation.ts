import type {BlueprintError} from '../types/errors'

/**
 * Executes the given validator function and throws a formatted error if any are returned.
 * @param validator A function that returns a list of validation errors.
 */
export function runValidation(validator: () => BlueprintError[]) {
  const errors = validator()
  if (errors.length > 0) {
    const message = errors.map((err) => err.message).join('\n')
    throw new Error(message)
  }
}
