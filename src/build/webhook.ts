import {AbstractHandle} from './abstract-handle.js'

/**
 * A document webhook in a {@link buildBlueprint} callback. See {@link defineDocumentWebhook}.
 * @public
 * @beta
 * @category Builder
 */
export class DocumentWebhookHandle extends AbstractHandle {
  readonly kind = 'sanity.project.webhook'
}
