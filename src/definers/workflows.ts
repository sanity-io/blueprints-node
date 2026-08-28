import {defineWorkflows as defineWorkflowResource} from '@sanity/workflow-blueprint'
import type {BlueprintWorkflowDeployment, BlueprintWorkflowsOptions, BlueprintWorkflowsResource} from '../types/workflows.js'

/**
 * Defines an Editorial Workflows deployment as a Blueprint resource.
 *
 * @remarks
 * The implementation and validation live in `@sanity/workflow-blueprint`.
 * The Blueprints API must register that package's `workflowProvider` before
 * `blueprints deploy` can deploy this resource.
 *
 * A Blueprint module that contains several Editorial Workflows deployments
 * should require `SANITY_WORKFLOW_TAG` and pass only deployments with that tag
 * to this function. The tag selects the Workflows resources emitted by the
 * module; `--stack` independently selects the remote Blueprint Stack.
 *
 * @example
 * ```ts
 * defineWorkflows({
 *   name: 'production',
 *   expectedMinReaderModel: 4,
 *   tag: 'production',
 *   workflowResource: {type: 'dataset', id: 'projectId.dataset'},
 *   definitions: [{
 *     name: 'article-review',
 *     title: 'Article review',
 *     initialStage: 'draft',
 *     stages: [{name: 'draft'}],
 *   }],
 * })
 * ```
 *
 * @example Protected resource
 * ```ts
 * defineWorkflows({
 *   name: 'production',
 *   expectedMinReaderModel: 4,
 *   tag: 'production',
 *   workflowResource: {type: 'dataset', id: 'projectId.dataset'},
 *   definitions: [{
 *     name: 'article-review',
 *     title: 'Article review',
 *     initialStage: 'draft',
 *     stages: [{name: 'draft'}],
 *   }],
 * }, {
 *   name: 'editorial-workflows',
 *   lifecycle: {deletionPolicy: 'protect'},
 * })
 * ```
 * @param deployment The Editorial Workflows deployment
 * @param options The Blueprint resource options
 * @public
 * @beta Declaring Editorial Workflows resources is experimental. This feature is subject to breaking changes.
 * @category Definers
 * @expandType BlueprintWorkflowDeployment
 * @returns The Editorial Workflows resource
 */
export function defineWorkflows(deployment: BlueprintWorkflowDeployment, options?: BlueprintWorkflowsOptions): BlueprintWorkflowsResource {
  return defineWorkflowResource(deployment, options)
}
