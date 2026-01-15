import type {BlueprintResource} from '../index.js'

export type AclMode = 'public' | 'private' | 'custom'

/**
 * Represents a Dataset resource.
 * @see https://www.sanity.io/docs/content-lake/datasets
 */
export interface BlueprintDatasetResource extends BlueprintResource {
  type: 'sanity.project.dataset'
  /** The name of the dataset. Must be unique within a project. */
  datasetName: string
  /** The ACL mode to set for the new dataset. Defaults to public. */
  aclMode?: AclMode

  /**
   * The project ID of the project that contains your Dataset.
   *
   * The `project` attribute must be defined if your blueprint is scoped to an organization.
   */
  project?: string
}

/**
 * Configuration for a Dataset resource.
 * @see https://www.sanity.io/docs/content-lake/datasets
 */
export type BlueprintDatasetConfig = Omit<BlueprintDatasetResource, 'type' | 'datasetName'> & {
  /** The name of the dataset. Must be unique within a project. Defaults to the name of the resource. */
  datasetName?: string
}
