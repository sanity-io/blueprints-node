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
 * The tag is persisted on definitions and instances and scopes Workflows engine
 * reads and operations within the target resource. It is not inferred from a
 * Blueprint Stack, which separately owns the complete emitted manifest.
 *
 * @example
 * ```ts
 * defineWorkflows({
 *   name: 'newsroom',
 *   expectedMinReaderModel: 4,
 *   tag: 'newsroom',
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
 *   name: 'newsroom',
 *   expectedMinReaderModel: 4,
 *   tag: 'newsroom',
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
