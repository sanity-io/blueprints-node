import {AbstractHandle} from './abstract-handle.js'

/**
 * A Studio in a {@link buildBlueprint} callback. See {@link defineStudio}.
 * @public
 * @beta
 * @category Builder
 */
export class StudioHandle extends AbstractHandle {
  readonly kind = 'sanity.studio'
}
