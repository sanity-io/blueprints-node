import type {DefineWorkflowsOptions, defineWorkflows, WorkflowsResource, WorkflowsResourceLifecycle} from '@sanity/workflow-blueprint'

/**
 * An Editorial Workflows deployment accepted by {@link defineWorkflows}.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintWorkflowDeployment = Parameters<typeof defineWorkflows>[0]

/**
 * A physical resource used by Editorial Workflows.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export type BlueprintWorkflowTarget = BlueprintWorkflowDeployment['workflowResource']

/**
 * A resource target type supported by Editorial Workflows.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintWorkflowTargetType = BlueprintWorkflowTarget['type']

/**
 * A logical resource handle used by an Editorial Workflows definition.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export type BlueprintWorkflowResourceBinding = NonNullable<BlueprintWorkflowDeployment['resourceAliases']>[number]

/**
 * An authored Editorial Workflows definition.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 */
export type BlueprintWorkflowDefinition = BlueprintWorkflowDeployment['definitions'][number]

/**
 * The lifecycle policies supported by an Editorial Workflows Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintWorkflowsLifecycle = WorkflowsResourceLifecycle

/**
 * Options for an Editorial Workflows Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintWorkflowsOptions = DefineWorkflowsOptions

/**
 * An Editorial Workflows deployment declared as a Blueprint resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 */
export type BlueprintWorkflowsResource = WorkflowsResource
