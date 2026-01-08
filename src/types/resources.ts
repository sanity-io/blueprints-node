export type BlueprintResourceDeletionPolicy = 'allow' | 'retain' | 'replace' | 'protect'

export type BlueprintOwnershipAttachAction = {
  type: 'attach'
  id: string
}
export type BlueprintOwnershipAction = BlueprintOwnershipAttachAction

export interface BlueprintResourceLifecycle {
  deletionPolicy?: BlueprintResourceDeletionPolicy

  ownershipAction?: BlueprintOwnershipAction
}

/**
 * The base type for all resources.
 */
export interface BlueprintResource {
  type: string
  name: string

  lifecycle?: BlueprintResourceLifecycle
}
