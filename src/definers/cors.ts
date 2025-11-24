import type {BlueprintCorsOriginConfig, BlueprintCorsOriginResource} from '../index.js'

export function defineCorsOrigin(parameters: BlueprintCorsOriginConfig): BlueprintCorsOriginResource {
  const errors: string[] = []

  if (!parameters.name || parameters.name.trim() === '') {
    errors.push('CORS Origin name is required')
  }

  if (!parameters.origin || parameters.origin.trim() === '') {
    errors.push('CORS Origin URL is required')
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
