import {AbstractHandle} from './abstract-handle.js'

/**
 * A permission in a {@link buildBlueprint} callback. See {@link definePermission}.
 * @public
 * @beta
 * @category Builder
 */
export class PermissionHandle extends AbstractHandle {
  readonly kind = 'sanity.access.permission'

  /** A reference to the permission name, for the `permissions` of a role */
  get name() {
    return this.reference('name')
  }
}
