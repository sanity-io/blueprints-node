import type {WorkflowDeploymentInput, WorkflowResource} from '@sanity/workflow-engine'
import type {BlueprintResource, BlueprintResourceLifecycle} from '../index.js'

/**
 * Resource target types supported by Editorial Workflows.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export const WORKFLOW_TARGET_TYPES = ['dataset', 'canvas', 'media-library', 'dashboard'] as const

/**
 * A resource target type supported by Editorial Workflows.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintWorkflowTargetType = (typeof WORKFLOW_TARGET_TYPES)[number]

/**
 * A physical resource used by Editorial Workflows.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export type BlueprintWorkflowTarget = WorkflowResource

/**
 * A logical resource handle used by an Editorial Workflows definition.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export type BlueprintWorkflowResourceBinding = NonNullable<WorkflowDeploymentInput['resourceAliases']>[number]

/**
 * An authored Editorial Workflows definition.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export type BlueprintWorkflowDefinition = WorkflowDeploymentInput['definitions'][number]

/**
 * An Editorial Workflows deployment carried by a Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintWorkflowDeployment = WorkflowDeploymentInput

/**
 * The lifecycle policies supported by an Editorial Workflows Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintWorkflowsLifecycle extends Omit<BlueprintResourceLifecycle, 'deletionPolicy' | 'ownershipAction'> {
  /**
   * The deletion policy for the Blueprint resource.
   * @defaultValue `'retain'`
   */
  deletionPolicy?: 'retain' | 'protect'
  /** Ownership actions are unavailable until the resource provider defines stable attach, detach, and reference semantics. */
  ownershipAction?: never
}

/**
 * Options for an Editorial Workflows Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintWorkflowsOptions {
  /**
   * The Blueprint resource name.
   * @defaultValue `editorial-workflows-<deployment name>`
   */
  name?: string
  /**
   * The Blueprint lifecycle policy.
   * @defaultValue `{deletionPolicy: 'retain'}`
   */
  lifecycle?: BlueprintWorkflowsLifecycle
}

/**
 * An Editorial Workflows deployment declared as a Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintWorkflowsResource<Deployment extends BlueprintWorkflowDeployment = BlueprintWorkflowDeployment>
  extends BlueprintResource<BlueprintWorkflowsLifecycle> {
  type: 'sanity.workflow'
  deployment: Deployment
}
