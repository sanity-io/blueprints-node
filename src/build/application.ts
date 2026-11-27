import {AbstractHandle} from './abstract-handle.js'

/**
 * An application in a {@link buildBlueprint} callback. See {@link defineApplication}.
 * @public
 * @beta
 * @category Builder
 */
export class ApplicationHandle extends AbstractHandle {
  readonly kind = 'sanity.application'
}
