import {AbstractHandle} from './abstractHandle.js'

export class DatasetHandle extends AbstractHandle {
  constructor(name: string) {
    super(name)
  }

  get datasetName() {
    return this.reference('datasetName')
  }
}
