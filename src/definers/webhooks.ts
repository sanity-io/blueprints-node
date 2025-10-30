import type {BlueprintDocumentWebhookConfig, BlueprintDocumentWebhookResource} from '../types'

export function defineDocumentWebhook(parameters: BlueprintDocumentWebhookConfig): BlueprintDocumentWebhookResource {
  const errors: string[] = []

  if (!parameters.name || parameters.name.trim() === '') {
    errors.push('Webhook name is required')
  }

  if (parameters.displayName) {
    if (parameters.displayName.length > 100) {
      errors.push('Display name must be 100 characters or less')
    }
  } else {
    parameters.displayName = parameters.name?.substring(0, 100)
  }

  if (!parameters.url || parameters.url.trim() === '') {
    errors.push('Webhook URL is required')
  }

  // Validate URL format
  try {
    new URL(parameters.url)
  } catch {
    errors.push('Webhook URL must be a valid URL')
  }

  if (!parameters.on || parameters.on.length === 0) {
    errors.push('At least one event type must be specified in the "on" field')
  }

  // Validate event types
  const validEvents = ['create', 'update', 'delete']
  if (parameters.on) {
    const invalidEvents = parameters.on.filter((event: string) => !validEvents.includes(event))
    if (invalidEvents.length > 0) {
      errors.push(`Invalid event types: ${invalidEvents.join(', ')}. Valid events are: ${validEvents.join(', ')}`)
    }
  }

  // Validate dataset pattern
  if (!parameters.dataset || !/^[a-z0-9-_]+$/.test(parameters.dataset)) {
    errors.push('Dataset must match pattern: ^[a-z0-9-_]+$')
  }

  // Validate HTTP method
  if (parameters.httpMethod) {
    const validMethods = ['POST', 'PUT', 'PATCH', 'DELETE', 'GET']
    if (!validMethods.includes(parameters.httpMethod)) {
      errors.push(`Invalid HTTP method: ${parameters.httpMethod}. Valid methods are: ${validMethods.join(', ')}`)
    }
  }

  // Validate status
  if (parameters.status && !['enabled', 'disabled'].includes(parameters.status)) {
    errors.push('Status must be either "enabled" or "disabled"')
  }

  // Validate headers pattern
  if (parameters.headers) {
    const headerNamePattern = /^[a-zA-Z][a-zA-Z0-9-_]*$/
    for (const [key, value] of Object.entries(parameters.headers)) {
      if (!headerNamePattern.test(key)) {
        errors.push(`Header key "${key}" must match pattern: ${headerNamePattern.source}`)
      }
      if (typeof value !== 'string') {
        errors.push(`Header value for "${key}" must be a string`)
      }
    }
  }

  if (errors.length > 0) {
    const message = errors.join('\n')
    throw new Error(message)
  }

  return {
    ...parameters,
    type: 'sanity.project.webhook',
  }
}
