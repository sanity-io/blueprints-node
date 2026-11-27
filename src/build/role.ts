import {AbstractHandle} from './abstract-handle.js'

export class RoleHandle extends AbstractHandle {
  readonly kind = 'sanity.access.role'

  get name() {
    return this.reference('name')
  }
}
