import {
  type BlueprintCrossStackReferenceConfig,
  type BlueprintDatasetConfig,
  type BlueprintDatasetResource,
  type BlueprintResource,
  referenceResource,
  validateDataset,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a Dataset to be managed in a Blueprint.
 *
 * @example
 * ```ts
 * defineDataset({
 *   name: 'staging-dataset',
 *   datasetName: 'staging',
 * })
 * ```
 *
 * @example All options
 * ```ts
 * defineDataset({
 *   name: 'staging',
 *   datasetName: 'staging-v2',
 *   visibility: 'private',
 *   project: 'my-project-id',
 *   lifecycle: {deletionPolicy: 'protect'},
 * })
 * ```
 * @param parameters The dataset configuration
 * @public
 * @category Definers
 * @expandType BlueprintDatasetConfig
 * @returns The dataset resource
 */
export function defineDataset(parameters: BlueprintDatasetConfig): BlueprintDatasetResource {
  // default dataset name and acl mode
  const datasetName = parameters.datasetName || parameters.name
  const aclMode = parameters.aclMode || parameters.visibility || 'public'

  const datasetResource: BlueprintDatasetResource = {
    ...parameters,
    datasetName,
    aclMode,
    type: 'sanity.project.dataset',
  }

  runValidation(() => validateDataset(datasetResource))

  return datasetResource
}

/**
 * Creates a reference to a dataset in another stack.
 *
 * @example
 * ```ts
 * referenceDataset({
 *   name: 'prod-dataset',
 *   stack: 'editorial',
 * })
 * ```
 *
 * @param params The parameters for referencing the dataset
 * @public
 * @category Referencers
 * @returns The datset reference
 */
export function referenceDataset({name, stack, localName}: BlueprintCrossStackReferenceConfig): BlueprintResource {
  return referenceResource({name, stack, localName, type: 'sanity.project.dataset'})
}
