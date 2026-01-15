import {type BlueprintDocumentWebhookConfig, type BlueprintDocumentWebhookResource, validateDocumentWebhook} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Defines a webhook that is called when document changes occur.
 * ```
 * defineDocumentWebhook({
 *   name: 'my-webhook',
 *   on: ['create'],
 *   url: 'https://example.com/webhook',
 *   projection: '{_id}',
 *   dataset: 'staging'
 * })
 * ```
 * @param parameters The webhook configuration
 */
export function defineDocumentWebhook(parameters: BlueprintDocumentWebhookConfig): BlueprintDocumentWebhookResource {
  // default the display name
  if (!parameters.displayName) {
    parameters.displayName = parameters.name.substring(0, 100)
  }

  const webhookResource: BlueprintDocumentWebhookResource = {
    ...parameters,
    type: 'sanity.project.webhook',
  }

  runValidation(() => validateDocumentWebhook(webhookResource))

  return webhookResource
}
