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
export interface BlueprintWorkflowTarget {
  /** The kind of resource. */
  type: BlueprintWorkflowTargetType
  /**
   * The target-specific resource ID. Dataset IDs use `<projectId>.<dataset>`;
   * other target types use their platform resource ID.
   */
  id: string
}

/**
 * A logical resource handle used by an Editorial Workflows definition.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export interface BlueprintWorkflowResourceBinding {
  /** The logical handle referenced by workflow definitions. */
  name: string
  /** The physical resource bound to the handle. */
  resource: BlueprintWorkflowTarget
}

/**
 * The required identifying portion of an Editorial Workflows definition.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export interface BlueprintWorkflowDefinition {
  /** The deployment-unique definition name. */
  name: string
}

/**
 * An Editorial Workflows deployment carried by a Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintWorkflowDeployment {
  /** The deployment identity. */
  name: string
  /** The persisted-data reader floor acknowledged by this deployment. */
  expectedMinReaderModel: number
  /** The environment partition for workflow definitions and instances. */
  tag: string
  /** The resource that stores engine-owned workflow data. */
  workflowResource: BlueprintWorkflowTarget
  /** Logical resource handles available to the deployed definitions. */
  resourceAliases?: BlueprintWorkflowResourceBinding[]
  /** The workflow definitions deployed together. */
  definitions: BlueprintWorkflowDefinition[]
}

/**
 * The lifecycle policies supported by an Editorial Workflows Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintWorkflowsLifecycle extends BlueprintResourceLifecycle {
  deletionPolicy?: 'retain' | 'protect'
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
