export interface LifeCycle {
  deletionPolicy: 'allow' | 'retain' | 'protect' | 'replace'
}

/**
 * The base type for all resources.
 */
export interface BlueprintResource {
  type: string
  name: string

  lifecycle?: LifeCycle
}
