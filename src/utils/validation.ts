import type {BlueprintError} from '../types/errors'

export function runValidation(validator: () => BlueprintError[]) {
  const errors = validator()
  if (errors.length > 0) {
    const message = errors.map((err) => err.message).join('\n')
    throw new Error(message)
  }
}
