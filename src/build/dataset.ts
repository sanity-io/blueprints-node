import {AbstractHandle} from './abstract-handle.js'

/**
 * A dataset in a {@link buildBlueprint} callback. See {@link defineDataset}.
 * @public
 * @beta
 * @category Builder
 */
export class DatasetHandle extends AbstractHandle {
  readonly kind = 'sanity.project.dataset'

  /** A reference to the dataset name, for options such as `dataset` in {@link defineDocumentWebhook} */
  get datasetName() {
    return this.reference('datasetName')
  }

  /** A reference to the qualified dataset resource ID, for options such as `event.resource.id` in {@link defineSyncTagInvalidateFunction} */
  get resourceId() {
    return this.reference('resourceId')
  }
}
