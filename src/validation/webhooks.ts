import type {BlueprintDocumentWebhookConfig, BlueprintError} from '../index.js'

export function validateDocumentWebhook(parameters: BlueprintDocumentWebhookConfig): BlueprintError[] {
  const errors: BlueprintError[] = []

  if (!parameters.name || parameters.name.trim() === '') {
    errors.push({type: 'missing_parameter', message: 'Webhook name is required'})
  }

  if (parameters.displayName) {
    if (parameters.displayName.length > 100) {
      errors.push({type: 'invalid_value', message: 'Display name must be 100 characters or less'})
    }
  } else {
    parameters.displayName = parameters.name?.substring(0, 100)
  }

  if (!parameters.url || parameters.url.trim() === '') {
    errors.push({type: 'missing_parameter', message: 'Webhook URL is required'})
  }

  // Validate URL format
  try {
    new URL(parameters.url)
  } catch {
    errors.push({type: 'invalid_value', message: 'Webhook URL must be a valid URL'})
  }

  if (!parameters.on || parameters.on.length === 0) {
    errors.push({type: 'invalid_value', message: 'At least one event type must be specified in the "on" field'})
  }

  // Validate event types
  const validEvents = ['create', 'update', 'delete']
  if (parameters.on) {
    const invalidEvents = parameters.on.filter((event: string) => !validEvents.includes(event))
    if (invalidEvents.length > 0) {
      errors.push({
        type: 'invalid_value',
        message: `Invalid event types: ${invalidEvents.join(', ')}. Valid events are: ${validEvents.join(', ')}`,
      })
    }
  }

  // Validate dataset pattern
  if (!parameters.dataset || !/^[a-z0-9-_]+$/.test(parameters.dataset)) {
    errors.push({type: 'invalid_format', message: 'Dataset must match pattern: ^[a-z0-9-_]+$'})
  }

  // Validate HTTP method
  if (parameters.httpMethod) {
    const validMethods = ['POST', 'PUT', 'PATCH', 'DELETE', 'GET']
    if (!validMethods.includes(parameters.httpMethod)) {
      errors.push({
        type: 'invalid_value',
        message: `Invalid HTTP method: ${parameters.httpMethod}. Valid methods are: ${validMethods.join(', ')}`,
      })
    }
  }

  // Validate status
  if (parameters.status && !['enabled', 'disabled'].includes(parameters.status)) {
    errors.push({type: 'invalid_value', message: 'Status must be either "enabled" or "disabled"'})
  }

  // Validate headers pattern
  if (parameters.headers) {
    const headerNamePattern = /^[a-zA-Z][a-zA-Z0-9-_]*$/
    for (const [key, value] of Object.entries(parameters.headers)) {
      if (!headerNamePattern.test(key)) {
        errors.push({type: 'invalid_format', message: `Header key "${key}" must match pattern: ${headerNamePattern.source}`})
      }
      if (typeof value !== 'string') {
        errors.push({type: 'invalid_type', message: `Header value for "${key}" must be a string`})
      }
    }
  }

  return errors
}
