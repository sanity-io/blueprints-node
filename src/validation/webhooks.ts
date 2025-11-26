import type {BlueprintError} from '../index.js'

export function validateDocumentWebhook(parameters: unknown): BlueprintError[] {
  if (!parameters) return [{type: 'invalid_value', message: 'Webhook config must be provided'}]
  if (typeof parameters !== 'object') return [{type: 'invalid_type', message: 'Webhook config must be an object'}]

  const errors: BlueprintError[] = []

  if (!('name' in parameters)) {
    errors.push({type: 'missing_parameter', message: 'Webhook name is required'})
  } else if (typeof parameters.name !== 'string') {
    errors.push({type: 'invalid_type', message: 'Webhook name must be a string'})
  }

  if (!('type' in parameters)) {
    errors.push({type: 'missing_parameter', message: 'Webhook type is required'})
  } else if (parameters.type !== 'sanity.project.webhook') {
    errors.push({type: 'invalid_value', message: 'Webhook type must be `sanity.project.webhook`'})
  }

  if ('displayName' in parameters) {
    if (typeof parameters.displayName !== 'string') {
      errors.push({type: 'invalid_type', message: 'Display name must be a string'})
    } else if (parameters.displayName.length > 100) {
      errors.push({type: 'invalid_value', message: 'Display name must be 100 characters or less'})
    }
  }

  if (!('url' in parameters)) {
    errors.push({type: 'missing_parameter', message: 'Webhook URL is required'})
  } else if (typeof parameters.url !== 'string') {
    errors.push({type: 'invalid_type', message: 'Webhook URL must be a string'})
  } else {
    // Validate URL format
    try {
      new URL(parameters.url)
    } catch {
      errors.push({type: 'invalid_value', message: 'Webhook URL must be a valid URL'})
    }
  }

  if (!('on' in parameters) || !Array.isArray(parameters.on) || parameters.on.length === 0) {
    errors.push({type: 'invalid_value', message: 'At least one event type must be specified in the "on" field'})
  } else {
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
  }

  // Validate dataset pattern
  if (!('dataset' in parameters)) {
    errors.push({type: 'missing_parameter', message: 'Webhook dataset is required'})
  } else if (typeof parameters.dataset !== 'string' || !/^[a-z0-9-_]+$/.test(parameters.dataset)) {
    errors.push({type: 'invalid_format', message: 'Dataset must match pattern: ^[a-z0-9-_]+$'})
  }

  // Validate HTTP method
  if ('httpMethod' in parameters) {
    const validMethods = ['POST', 'PUT', 'PATCH', 'DELETE', 'GET']
    const message = `Invalid HTTP method: ${parameters.httpMethod}. Valid methods are: ${validMethods.join(', ')}`
    if (typeof parameters.httpMethod !== 'string') {
      errors.push({type: 'invalid_type', message})
    } else {
      if (!validMethods.includes(parameters.httpMethod)) {
        errors.push({
          type: 'invalid_value',
          message,
        })
      }
    }
  }

  // Validate status
  if ('status' in parameters) {
    const message = 'Status must be either "enabled" or "disabled"'
    if (typeof parameters.status !== 'string') {
      errors.push({type: 'invalid_type', message})
    } else if (!['enabled', 'disabled'].includes(parameters.status)) {
      errors.push({type: 'invalid_value', message})
    }
  }

  // Validate headers pattern
  if ('headers' in parameters) {
    if (typeof parameters.headers !== 'object' || !parameters.headers || Array.isArray(parameters.headers)) {
      errors.push({type: 'invalid_type', message: 'Webhook headers must be an object'})
    } else {
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
  }

  return errors
}
