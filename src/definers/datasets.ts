import {type BlueprintDatasetAttachConfig, type BlueprintDatasetConfig, type BlueprintDatasetResource, validateDataset} from '../index.js'
import {runValidation} from '../utils/validation.js'

/*
 * FUTURE example (move below @example when ready)
 * @example All options
 * ```ts
 * defineDataset({
 *   name: 'staging',
 *   datasetName: 'staging-v2',
 *   aclMode: 'private',
 *   project: 'my-project-id',
 *   lifecycle: {deletionPolicy: 'protect'},
 * })
 * ```
 */
/**
 * Defines a Dataset to be managed in a Blueprint.
 *
 * ```ts
 * defineDataset({
 *   name: 'staging-dataset',
 *   datasetName: 'staging',
 * })
 * ```
 * @param parameters The dataset configuration
 * @public
 * @alpha Deploying Datasets via Blueprints is experimental. This feature is subject to breaking changes.
 * @hidden
 * @category Definers
 * @expandType BlueprintDatasetConfig
 * @returns The dataset resource
 */
export function defineDataset(parameters: BlueprintDatasetConfig): BlueprintDatasetResource {
  // default dataset name
  const datasetName = parameters.datasetName || parameters.name

  const datasetResource: BlueprintDatasetResource = {
    ...parameters,
    datasetName,
    type: 'sanity.project.dataset',
  }

  runValidation(() => validateDataset(datasetResource))

  return datasetResource
}

/**
 * Attaches an existing Dataset to a Blueprint and retains it when the Stack is destroyed.
 *
 * @example
 * ```ts
 * attachDataset({
 *   name: 'production',
 *   project: '$.resources.project.id',
 * })
 * ```
 * @param config The existing Dataset identity
 * @public
 * @alpha Attaching Datasets via Blueprints is experimental. This feature is subject to breaking changes.
 * @hidden
 * @category Definers
 * @expandType BlueprintDatasetAttachConfig
 * @returns The attached Dataset resource
 */
export function attachDataset(config: BlueprintDatasetAttachConfig): BlueprintDatasetResource {
  const datasetName = config.id ?? config.name
  const datasetResource: BlueprintDatasetResource = {
    name: config.name,
    type: 'sanity.project.dataset',
    datasetName,
    project: config.project,
    lifecycle: {
      deletionPolicy: 'retain',
      ownershipAction: {
        type: 'attach',
        id: datasetName,
        projectId: config.project,
      },
    },
  }

  runValidation(() => validateDataset(datasetResource))

  return datasetResource
}
