import {
  type BlueprintWorkflowDeployment,
  type BlueprintWorkflowsResource,
  type DefineWorkflowsOptions,
  validateWorkflows,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines an Editorial Workflows deployment as a Blueprint resource.
 *
 * @example
 * ```ts
 * defineWorkflows({
 *   name: 'production',
 *   expectedMinReaderModel: 4,
 *   tag: 'production',
 *   workflowResource: {type: 'dataset', id: 'projectId.dataset'},
 *   definitions: [{name: 'article-review'}],
 * })
 * ```
 *
 * @example Protected resource
 * ```ts
 * defineWorkflows(deployment, {
 *   name: 'editorial-workflows',
 *   lifecycle: {deletionPolicy: 'protect'},
 * })
 * ```
 * @param deployment The Editorial Workflows deployment
 * @param options The Blueprint resource options
 * @public
 * @beta Deploying Editorial Workflows via Blueprints is experimental. This feature is subject to breaking changes.
 * @category Definers
 * @expandType BlueprintWorkflowDeployment
 * @returns The Editorial Workflows resource
 */
export function defineWorkflows<Deployment extends BlueprintWorkflowDeployment>(
  deployment: Deployment,
  options?: DefineWorkflowsOptions,
): BlueprintWorkflowsResource<Deployment> {
  const workflowResource: BlueprintWorkflowsResource<Deployment> = {
    name: options?.name ?? `editorial-workflows-${deployment.name}`,
    type: 'sanity.workflow',
    lifecycle: options?.lifecycle ?? {deletionPolicy: 'retain'},
    deployment,
  }

  runValidation(() => validateWorkflows(workflowResource), {throwError: true})

  return workflowResource
}
