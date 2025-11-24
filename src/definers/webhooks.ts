import {validateDocumentWebhook, type BlueprintDocumentWebhookConfig, type BlueprintDocumentWebhookResource} from '../index.js'
import {runValidation} from '../utils/validation.js'

export function defineDocumentWebhook(parameters: BlueprintDocumentWebhookConfig): BlueprintDocumentWebhookResource {
  runValidation(() => validateDocumentWebhook(parameters))

  return {
    ...parameters,
    type: 'sanity.project.webhook',
  }
}
