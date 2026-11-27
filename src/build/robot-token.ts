import {AbstractHandle} from './abstract-handle.js'

export class RobotTokenHandle extends AbstractHandle {
  readonly kind = 'sanity.access.robot'

  get token() {
    return this.reference('token')
  }
}
