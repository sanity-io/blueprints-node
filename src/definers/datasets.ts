import type {BlueprintResource} from '../types'

export type AclMode = 'public' | 'private' | 'custom'

/** Represents a Dataset resource. */
export interface BlueprintDatasetResource extends BlueprintResource {
  type: 'sanity.project.dataset'
  datasetName: string
  aclMode?: AclMode

  /** The `project` attribute must be defined if your blueprint is scoped to an organization. */
  project?: string
}

/** Configuration for a Dataset resource. */
export type BlueprintDatasetConfig = Omit<BlueprintDatasetResource, 'type' | 'datasetName'> & {
  /** The name of the dataset, defaults to the name of the resource. */
  datasetName?: string
}

export function defineDataset(parameters: BlueprintDatasetConfig): BlueprintDatasetResource {
  const errors: string[] = []

  // default dataset name
  const datasetName = parameters.datasetName || parameters.name

  // validate ACL mode if provided
  if (typeof parameters.aclMode !== 'undefined') {
    const aclMode: string = parameters.aclMode
    if (aclMode !== 'custom' && aclMode !== 'public' && aclMode !== 'private') {
      errors.push('aclMode must be one of `custom`, `public`, or `private`')
    }
  }

  // validate project if provided
  if (parameters.project) {
    if (typeof parameters.project !== 'string') {
      errors.push('project must be a string')
    }
  }

  if (errors.length > 0) {
    const message = errors.join('\n')
    throw new Error(message)
  }

  return {
    ...parameters,
    datasetName,
    type: 'sanity.project.dataset',
  }
}
