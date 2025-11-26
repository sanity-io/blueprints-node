import {type BlueprintDocumentWebhookConfig, type BlueprintDocumentWebhookResource, validateDocumentWebhook} from '../index.js'
import {runValidation} from '../utils/validation.js'

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
