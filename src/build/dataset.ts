import {AbstractHandle} from './abstract-handle.js'

export class DatasetHandle extends AbstractHandle {
  constructor(name: string) {
    super(name)
  }

  get datasetName() {
    return this.reference('datasetName')
  }
}
