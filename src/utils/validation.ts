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

const REFERENCE_PREFIXES = ['$.resources.', '$.values.', '$.parameters.', '$.params.']

/**
 * Checks whether a value is a blueprint reference expression.
 *
 * Recognized prefixes: `$.resources.*`, `$.values.*`, `$.parameters.*`, `$.params.*`.
 * @param value The value to check
 * @returns `true` if the value matches a known reference prefix
 * @internal
 */
export function isReference(value: unknown): boolean {
  return typeof value === 'string' && REFERENCE_PREFIXES.some((prefix) => value.startsWith(prefix))
}
