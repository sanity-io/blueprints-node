import {validateDataset, type BlueprintDatasetConfig, type BlueprintDatasetResource} from '../index.js'
import {runValidation} from '../utils/validation.js'

export function defineDataset(parameters: BlueprintDatasetConfig): BlueprintDatasetResource {
  // default dataset name
  const datasetName = parameters.datasetName || parameters.name

  runValidation(() => validateDataset(parameters))

  return {
    ...parameters,
    datasetName,
    type: 'sanity.project.dataset',
  }
}
