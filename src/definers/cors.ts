import type {BlueprintCorsOriginConfig, BlueprintCorsOriginResource} from '../types'

export function defineCorsOrigin(parameters: BlueprintCorsOriginConfig): BlueprintCorsOriginResource {
  const errors: string[] = []

  if (!parameters.name || parameters.name.trim() === '') {
    errors.push('CORS Origin name is required')
  }

  if (!parameters.origin || parameters.origin.trim() === '') {
    errors.push('CORS Origin URL is required')
  }

  // Validate URL format
  try {
    new URL(parameters.origin)
  } catch {
    errors.push('CORS Origin URL must be a valid URL')
  }

  if (errors.length > 0) {
    const message = errors.join('\n')
    throw new Error(message)
  }

  return {
    ...parameters,
    allowCredentials: parameters.allowCredentials || false,
    type: 'sanity.project.cors',
  }
}
