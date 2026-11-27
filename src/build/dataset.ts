import {AbstractHandle} from './abstract-handle.js'

export class DatasetHandle extends AbstractHandle {
  readonly kind = 'sanity.project.dataset'

  get datasetName() {
    return this.reference('datasetName')
  }
}
