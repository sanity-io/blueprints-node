import {AbstractHandle} from './abstract-handle.js'

export class PermissionHandle extends AbstractHandle {
  readonly kind = 'sanity.access.permission'

  get name() {
    return this.reference('name')
  }
}
