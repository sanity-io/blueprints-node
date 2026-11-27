import {AbstractHandle} from './abstract-handle.js'

/**
 * A Media Library configuration in a {@link buildBlueprint} callback. See {@link defineMediaLibraryConfig}.
 * @public
 * @beta
 * @category Builder
 */
export class MediaLibraryConfigHandle extends AbstractHandle {
  readonly kind = 'sanity.installation.config'
}
