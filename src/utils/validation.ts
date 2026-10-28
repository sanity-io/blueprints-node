import type {BlueprintError} from '../types/errors.js'

const collectedErrors: BlueprintError[] = []

/**
 * Executes the given validator function and throws a formatted error if any are returned and throwError is enabled.
 * Otherwise collects errors for use later during blueprint validation.
 * @param validator A function that returns a list of validation errors.
 * @internal
 */
export function runValidation(validator: () => BlueprintError[], options?: {throwError?: boolean}) {
  const errors = validator()
  if (options?.throwError && errors.length > 0) {
    const message = errors.map((err) => err.message).join('\n')
    throw new Error(message)
  }
  collectedErrors.push(...errors)
}

/**
 * Gets the current set of errors that were returned during validation when resource definers were invoked.
 * @returns The errors collected during the validation of resources
 * @internal
 */
export function getCollectedErrors(): BlueprintError[] {
  return collectedErrors
}

/**
 * Resets the list of collected errors back to an empty list.
 * @internal
 */
export function resetCollectedErrors() {
  collectedErrors.splice(0, collectedErrors.length)
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

/**
 * Validates a string field on an object, optionally requiring it to be present and non-empty.
 * @param obj The object containing the field
 * @param field The field name
 * @param label The label used as the prefix of error messages
 * @param options Whether the field is required
 * @returns A list of validation errors
 * @internal
 */
export function validateStringField(obj: object, field: string, label: string, options: {required: boolean}): BlueprintError[] {
  const value: unknown = Reflect.get(obj, field)

  if (typeof value === 'undefined' || (options.required && !value)) {
    return options.required ? [{type: 'missing_parameter', message: `${label}.${field} is required`}] : []
  }
  if (typeof value !== 'string') {
    return [{type: 'invalid_type', message: `${label}.${field} must be a string`}]
  }
  return []
}
