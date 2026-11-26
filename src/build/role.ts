import {AbstractHandle} from './abstractHandle.js'

export class RoleHandle extends AbstractHandle {
  get name() {
    return this.reference('name')
  }
}
