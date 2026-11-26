import {AbstractHandle} from './abstract-handle.js'

export class PermissionHandle extends AbstractHandle {
  get name() {
    return this.reference('name')
  }
}
