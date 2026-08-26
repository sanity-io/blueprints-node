import {
  type BlueprintWorkflowDeployment,
  type BlueprintWorkflowsOptions,
  type BlueprintWorkflowsResource,
  validateWorkflows,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines an Editorial Workflows deployment as a Blueprint resource.
 *
 * @remarks
 * **Not deployable yet:** `@sanity/blueprints` includes the matching provider, but the Blueprints API must register it before `blueprints deploy`
 * can deploy this resource. Until that server rollout is complete, deploy definitions with the workflow CLI (`sanity-workflows deploy`).
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
export function defineWorkflows<Deployment extends BlueprintWorkflowDeployment>(
  deployment: Deployment,
  options?: BlueprintWorkflowsOptions,
): BlueprintWorkflowsResource<Deployment> {
  const resource: BlueprintWorkflowsResource<Deployment> = {
    name: options?.name ?? `editorial-workflows-${deployment.name}`,
    type: 'sanity.workflow',
    lifecycle: {
      ...options?.lifecycle,
      deletionPolicy: options?.lifecycle?.deletionPolicy ?? 'retain',
    },
    deployment,
  }

  runValidation(() => validateWorkflows(resource))

  return resource
}
