import {AbstractHandle} from './abstract-handle.js'

export class RobotTokenHandle extends AbstractHandle {
  get token() {
    return this.reference('token')
  }
}
