import {AbstractHandle} from './abstract-handle.js'

/**
 * A CORS origin in a {@link buildBlueprint} callback. See {@link defineCorsOrigin}.
 * @public
 * @beta
 * @category Builder
 */
export class CorsOriginHandle extends AbstractHandle {
  readonly kind = 'sanity.project.cors'
}
