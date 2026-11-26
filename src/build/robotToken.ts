import {AbstractHandle} from './abstractHandle.js'

export class RobotTokenHandle extends AbstractHandle {
  get token() {
    return this.reference('token')
  }
}
