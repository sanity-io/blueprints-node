import type {BlueprintResource, BlueprintResourceLifecycle} from '../index.js'

/**
 * A Sanity resource that stores Editorial Workflows definitions and instances.
 *
 * For `dataset` targets the `id` is `<projectId>.<dataset>`. For the other target types the `id` is the resource ID.
 * @alpha This feature is subject to breaking changes.
 * @hidden
 * @category Resource Types
 * @expand
 */
export interface BlueprintWorkflowTarget {
  /** The kind of Sanity resource */
  type: 'dataset' | 'canvas' | 'media-library' | 'dashboard'
  /** The resource identifier. `<projectId>.<dataset>` for datasets. */
  id: string
}

/**
 * A named handle that binds an `@<name>:` reference in a workflow definition to a Sanity resource.
 * @alpha This feature is subject to breaking changes.
 * @hidden
 * @category Resource Types
 * @expand
 */
export interface BlueprintWorkflowResourceAlias {
  /** The handle name used in definitions. Lowercase letters, digits, and dashes. */
  name: string
  /** The resource the handle points to */
  resource: BlueprintWorkflowTarget
}

/**
 * An authored Editorial Workflows definition.
 *
 * Blueprints only inspects `name`. The Workflows engine validates the full definition when the resource is deployed.
 * Author definitions with `defineWorkflow` from `@sanity/workflow-engine/define` and pass them through unchanged.
 * @alpha This feature is subject to breaking changes.
 * @hidden
 * @category Resource Types
 * @expand
 */
export interface BlueprintWorkflowDefinition {
  /** The definition name. Unique within the deployment. */
  name: string
}

/**
 * An Editorial Workflows deployment: a set of definitions deployed into one `(workflowResource, tag)` partition.
 *
 * This is the same shape as one entry of `deployments` in a `sanity.workflow.ts` config, so one object can be
 * deployed with the Workflows CLI or declared in a Blueprint.
 * @see https://www.sanity.io/docs/editorial-workflows
 * @alpha This feature is subject to breaking changes.
 * @hidden
 * @category Resource Types
 */
export interface BlueprintWorkflowDeployment {
  /** The deployment name. Lowercase letters, digits, and dashes. */
  name: string
  /**
   * The runtime partition within the target resource. Lowercase letters, digits, and dashes.
   *
   * The tag is persisted on every deployed definition and instance and scopes engine reads. It is not a Blueprint
   * Stack alias.
   */
  tag: string
  /**
   * The highest Workflows reader model verified across every runtime sharing the target resource.
   *
   * The engine checks this value against the floor the definitions require. It is an operator assertion and is
   * not derived from the definitions.
   */
  expectedMinReaderModel: number
  /** The Sanity resource that stores the definitions */
  workflowResource: BlueprintWorkflowTarget
  /** Bindings for `@<name>:` references used by the definitions */
  resourceAliases?: BlueprintWorkflowResourceAlias[]
  /** The workflow definitions to deploy. At least one. */
  definitions: BlueprintWorkflowDefinition[]
}

/**
 * Blueprint resource options for an Editorial Workflows deployment.
 * @alpha This feature is subject to breaking changes.
 * @hidden
 * @category Resource Types
 */
export interface BlueprintWorkflowsOptions {
  /**
   * The Blueprint resource name. Unique within the blueprint.
   * @defaultValue `workflows-<deployment name>`
   */
  name?: string
  /**
   * The lifecycle policy.
   *
   * Editorial Workflows definitions are retain-only through Blueprints: `deletionPolicy` may be `retain` or `protect`.
   */
  lifecycle?: BlueprintResourceLifecycle
}

/**
 * Represents an Editorial Workflows deployment resource.
 * @see https://www.sanity.io/docs/editorial-workflows
 * @alpha This feature is subject to breaking changes.
 * @hidden
 * @category Resource Types
 */
export interface BlueprintWorkflowsResource<Deployment extends BlueprintWorkflowDeployment = BlueprintWorkflowDeployment>
  extends BlueprintResource {
  type: 'sanity.workflow'
  /** The deployment to provision */
  deployment: Deployment
}
