import type {BlueprintResource, BlueprintResourceLifecycle} from '../index.js'

/**
 * A resource that can store Editorial Workflows data.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export interface BlueprintWorkflowTarget {
  type: 'dataset' | 'canvas' | 'media-library' | 'dashboard'
  id: string
}

/**
 * A logical resource handle used by an Editorial Workflows definition.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export interface BlueprintWorkflowResourceBinding {
  name: string
  resource: BlueprintWorkflowTarget
}

/**
 * The portion of an Editorial Workflows definition used by Blueprints validation.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export interface BlueprintWorkflowDefinition {
  name: string
}

/**
 * An Editorial Workflows deployment carried by a Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintWorkflowDeployment {
  name: string
  expectedMinReaderModel: number
  tag: string
  workflowResource: BlueprintWorkflowTarget
  resourceAliases?: BlueprintWorkflowResourceBinding[]
  definitions: BlueprintWorkflowDefinition[]
}

/**
 * Options for an Editorial Workflows Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 */
export interface DefineWorkflowsOptions {
  /**
   * The Blueprint resource name.
   * @defaultValue `editorial-workflows-<deployment name>`
   */
  name?: string
  /**
   * The Blueprint lifecycle policy.
   * @defaultValue `{deletionPolicy: 'retain'}`
   */
  lifecycle?: BlueprintResourceLifecycle
}

/**
 * An Editorial Workflows deployment declared as a Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export interface BlueprintWorkflowsResource<Deployment extends BlueprintWorkflowDeployment = BlueprintWorkflowDeployment>
  extends BlueprintResource {
  type: 'sanity.workflow'
  deployment: Deployment
}
