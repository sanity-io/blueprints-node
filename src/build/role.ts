import {AbstractHandle} from './abstract-handle.js'

export class RoleHandle extends AbstractHandle {
  get name() {
    return this.reference('name')
  }
}
