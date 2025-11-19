import type {BlueprintResource} from '../types'

/**
 * Represents a CORS Origin resource.
 */
export interface BlueprintCorsOriginResource extends BlueprintResource {
  type: 'sanity.project.cors'
  origin: string
  allowCredentials: boolean

  /** The `project` attribute must be defined if your blueprint is scoped to an organization. */
  project?: string
}

/** Configuration for a CORS Origin resource. */
export type BlueprintCorsOriginConfig = Omit<BlueprintCorsOriginResource, 'type' | 'allowCredentials'> & {
  allowCredentials?: boolean
}

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
