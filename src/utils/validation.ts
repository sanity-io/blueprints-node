import type {BlueprintError} from '../types/errors'

/**
 * Executes the given validator function and throws a formatted error if any are returned.
 * @param validator A function that returns a list of validation errors.
 * @internal
 */
export function runValidation(validator: () => BlueprintError[]) {
  const errors = validator()
  if (errors.length > 0) {
    const message = errors.map((err) => err.message).join('\n')
    throw new Error(message)
  }
}

/**
 * Checks whether a value is a blueprint reference expression (`$.resources.*` or `$.values.*`).
 *
 * @param value The value to check
 * @returns `true` if the value is a resource or values reference
 * @internal
 */
export function isReference(value: unknown): boolean {
  return typeof value === 'string' && (value.startsWith('$.resources.') || value.startsWith('$.values.'))
}
