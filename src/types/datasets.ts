import type {BlueprintResource} from '../index.js'

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
