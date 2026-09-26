import {
  type BlueprintWorkflowDeployment,
  type BlueprintWorkflowsOptions,
  type BlueprintWorkflowsResource,
  validateWorkflows,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines an Editorial Workflows deployment to be managed in a Blueprint.
 *
 * @remarks
 * The deployment is the same object a `sanity.workflow.ts` config lists under `deployments`, so one object can be
 * deployed with the Workflows CLI or declared in a Blueprint. Blueprints checks the deployment's shape here; the
 * Workflows engine validates the definitions themselves when the resource is deployed.
 *
 * Deployed definitions are immutable and retain-only. A changed definition deploys as a new version, an unchanged
 * one is a no-op, and removing a definition or destroying the stack leaves deployed definitions in place.
 *
 * @example
 * ```ts
 * defineWorkflows({
 *   name: 'production',
 *   tag: 'production',
 *   expectedMinReaderModel: 4,
 *   workflowResource: {type: 'dataset', id: 'abc123.production'},
 *   definitions: [articleReview],
 * })
 * ```
 *
 * @example Custom resource name and protected lifecycle
 * ```ts
 * defineWorkflows(productionWorkflows, {
 *   name: 'editorial-workflows',
 *   lifecycle: {deletionPolicy: 'protect'},
 * })
 * ```
 *
 * @example Target a dataset defined in the same blueprint
 * ```ts
 * defineDataset({name: 'content'})
 *
 * defineWorkflows({
 *   name: 'production',
 *   tag: 'production',
 *   expectedMinReaderModel: 4,
 *   // the dataset resource resolves `resourceId` to `<projectId>.<dataset>` at deploy time
 *   workflowResource: {type: 'dataset', id: '$.resources.content.resourceId'},
 *   definitions: [articleReview],
 * })
 * ```
 * @param deployment The Editorial Workflows deployment
 * @param options The Blueprint resource options
 * @public
 * @alpha Deploying Editorial Workflows via Blueprints is experimental. This feature is subject to breaking changes.
 * @hidden
 * @category Definers
 * @expandType BlueprintWorkflowDeployment
 * @returns The Editorial Workflows resource
 */
export function defineWorkflows<Deployment extends BlueprintWorkflowDeployment>(
  deployment: Deployment,
  options?: BlueprintWorkflowsOptions,
): BlueprintWorkflowsResource<Deployment> {
  const workflowsResource: BlueprintWorkflowsResource<Deployment> = {
    name: options?.name ?? `workflows-${deployment.name}`,
    type: 'sanity.workflow',
    ...(options?.lifecycle && {lifecycle: options.lifecycle}),
    deployment,
  }

  runValidation(() => validateWorkflows(workflowsResource))

  return workflowsResource
}
