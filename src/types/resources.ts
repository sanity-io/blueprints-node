/**
 * Define deployment behaviour once the policy has been deployed. The following behaviours are allowed:
 *
 *  - **retain** If a stack is destroyed, the resource is detached from the stack and will not be destroyed. If the resource is removed from the blueprint, deployment will fail.
 *  - **replace** if a stack is deployed, the resource will be destroyed and created instead of performing an update. If the resource is removed from the blueprint, it will be destroyed. If the stack is destroyed, the resource will be destroyed.
 *  - **allow** if a stack is destroyed, the resource will be destroyed along with it. If the resource is removed it will be destroyed
 *  - **protect** if a stack is deployed the resource will not be updated. If the resource is removed from the blueprint or the stack is destroyed, deployment will fail.
 * @category Blueprint Internals
 */
export type BlueprintResourceDeletionPolicy = 'allow' | 'retain' | 'replace' | 'protect'

/**
 * An ownership action that will cause the referenced resource to be attached to the current stack.
 * @category Blueprint Internals
 */
export interface BlueprintOwnershipAttachAction {
  type: 'attach'
  /** The identifier of the resource to be attached to the current stack */
  id: string
}
/**
 * An ownership action that will cause the referenced resource to be detached from the current stack.
 * @category Blueprint Internals
 */
export interface BlueprintOwnershipDetachAction {
  type: 'detach'
}
/**
 * A union of all possible ownership actions.
 * @category Blueprint Internals
 * @expand
 */
export type BlueprintOwnershipAction = BlueprintOwnershipAttachAction | BlueprintOwnershipDetachAction

/**
 * An ownership action that will cause the referenced project-contained resource to be attached to the current stack.
 * @category Blueprint Internals
 */
export interface BlueprintProjectOwnershipAttachAction extends BlueprintOwnershipAttachAction {
  /** The identifier of the project for resources contained in a project */
  projectId: string
}
/**
 * A union of all possible ownership actions for resources belonging to projects.
 * @category Blueprint Internals
 * @expand
 */
export type BlueprintProjectOwnershipAction = BlueprintProjectOwnershipAttachAction | BlueprintOwnershipDetachAction

/**
 * Defines the lifcycle policy for this resource.
 * @category Blueprint Internals
 */
export interface BlueprintResourceLifecycle {
  deletionPolicy?: BlueprintResourceDeletionPolicy

  ownershipAction?: BlueprintOwnershipAction

  /**
   * Declares a dependency on another resource in the blueprint.
   * The referenced resource will be deployed before this one.
   *
   * The value must be a resource reference starting with `$.resources.` followed by the name of
   * the resource this resource depends on.
   *
   * @example
   * ```ts
   * lifecycle: {
   *   dependsOn: '$.resources.my-dataset',
   * }
   * ```
   */
  dependsOn?: string
}

/**
 * Defines the lifcycle policy for this resource.
 * @category Blueprint Internals
 * @experimental
 */
export interface BlueprintProjectResourceLifecycle extends BlueprintResourceLifecycle {
  ownershipAction?: BlueprintProjectOwnershipAction
}

/**
 * The base type for all resources.
 * @category Blueprint Internals
 */
export interface BlueprintResource<Lifecycle extends BlueprintResourceLifecycle = BlueprintResourceLifecycle> {
  /** The type of the resource. e.g. 'sanity.project.webhook' */
  type: string
  /** The name of the resource. Unique within the blueprint. e.g. 'sync-webhook' */
  name: string
  /**
   * Defines the lifcycle policy for this resource.
   * @experimental
   * @hidden
   */
  lifecycle?: Lifecycle
}
