/**
 * Define deployment behaviour once the policy has been deployed. The following behaviours are allowed:
 *
 *  - **retain** If a stack is destroyed, the resource is detached from the stack and will not be destroyed. If the resource is removed from the blueprint, deployment will fail.
 *  - **replace** if a stack is deployed, the resource will be destroyed and created instead of performing an update. If the resource is removed from the blueprint, it will be destroyed. If the stack is destroyed, the resource will be destroyed.
 *  - **allow** if a stack is destroyed, the resource will be destroyed along with it. If the resource is removed it will be destroyed
 *  - **protect** if a stack is deployed the resource will not be updated. If the resource is removed from the blueprint or the stack is destroyed, deployment will fail.
 */
export type BlueprintResourceDeletionPolicy = 'allow' | 'retain' | 'replace' | 'protect'

/**
 * An ownership action that will cause the references resource to be attached to the current stack.
 */
export type BlueprintOwnershipAttachAction = {
  type: 'attach'
  /** The identifier of the resource to be attached to the current stack */
  id: string
}
/**
 * A union of all possible ownership actions.
 */
export type BlueprintOwnershipAction = BlueprintOwnershipAttachAction

/**
 * Defines the lifcycle policy for this resource.
 */
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
