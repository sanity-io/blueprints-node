import type {BlueprintResource} from '../index.js'

/**
 * Represents a CORS Origin resource.
 */
export interface BlueprintCorsOriginResource extends BlueprintResource {
  type: 'sanity.project.cors'
  origin: string
  allowCredentials?: boolean

  /** The `project` attribute must be defined if your blueprint is scoped to an organization. */
  project?: string
}

/** Configuration for a CORS Origin resource. */
export type BlueprintCorsOriginConfig = Omit<BlueprintCorsOriginResource, 'type' | 'allowCredentials'> & {
  allowCredentials?: boolean
}
