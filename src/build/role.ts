import {AbstractHandle} from './abstract-handle.js'

/**
 * A role in a {@link buildBlueprint} callback. See {@link defineRole}.
 * @public
 * @beta
 * @category Builder
 */
export class RoleHandle extends AbstractHandle {
  readonly kind = 'sanity.access.role'

  /** A reference to the role name, for the `roleNames` of a robot token membership */
  get name() {
    return this.reference('name')
  }
}
