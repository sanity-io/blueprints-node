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
 * A Blueprint module that contains several Editorial Workflows tags can define
 * its own input convention and pass only the selected deployments to this
 * function. Blueprints does not interpret the tag or infer it from `--stack`:
 * the tag selects a Workflows runtime partition, while the Stack owns the
 * complete desired resource set emitted by the module.
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
