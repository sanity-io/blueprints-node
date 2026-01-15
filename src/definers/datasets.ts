import {type BlueprintDatasetConfig, type BlueprintDatasetResource, validateDataset} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a Dataset to be managed in a Blueprint.
 * ```
 * defineDataset({
 *   name: 'production'
 * })
 * ```
 * @param parameters The dataset configuration
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
