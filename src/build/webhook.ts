import {AbstractHandle} from './abstract-handle.js'

export class DocumentWebhookHandle extends AbstractHandle {
  readonly kind = 'sanity.project.webhook'
}
