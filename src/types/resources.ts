export type BlueprintResourceDeletionPolicy = 'allow' | 'retain' | 'replace' | 'protect'

export interface BlueprintResourceLifecycle {
  deletionPolicy?: BlueprintResourceDeletionPolicy
}

/**
 * The base type for all resources.
 */
export interface BlueprintResource {
  type: string
  name: string

  lifecycle?: BlueprintResourceLifecycle
}
