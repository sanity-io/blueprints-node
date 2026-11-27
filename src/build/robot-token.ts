import {AbstractHandle} from './abstract-handle.js'

/**
 * A robot token in a {@link buildBlueprint} callback. See {@link defineRobotToken}.
 * @public
 * @beta
 * @category Builder
 */
export class RobotTokenHandle extends AbstractHandle {
  readonly kind = 'sanity.access.robot'

  /** A reference to the token, which is set during deployment */
  get token() {
    return this.reference('token')
  }
}
