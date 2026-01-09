import {
  type BlueprintDocumentFunctionResourceEvent,
  type BlueprintError,
  type BlueprintFunctionBaseResourceEvent,
  type BlueprintMediaLibraryFunctionResourceEvent,
  validateResource,
} from '../index.js'

type BaseFunctionEventKey = keyof BlueprintFunctionBaseResourceEvent
const BASE_EVENT_KEYS = new Set<BaseFunctionEventKey>(['on', 'filter', 'projection', 'includeDrafts'])
type DocumentFunctionEventKey = keyof BlueprintDocumentFunctionResourceEvent
const DOCUMENT_EVENT_KEYS = new Set<DocumentFunctionEventKey>(['includeAllVersions', 'resource', ...BASE_EVENT_KEYS.values()])
type MediaLibraryFunctionEventKey = keyof BlueprintMediaLibraryFunctionResourceEvent
const MEDIA_LIBRARY_EVENT_KEYS = new Set<MediaLibraryFunctionEventKey>(['resource', ...BASE_EVENT_KEYS.values()])

/**
 * Validates a document function resource configuration.
 * Checks that the function has a valid event configuration, correct type, and all required base properties.
 * @param functionResource The function resource to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateDocumentFunction(functionResource: unknown): BlueprintError[] {
  if (!functionResource) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionResource !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = validateFunction(functionResource)

  // event validation
  if ('event' in functionResource) {
    // `event` was specified, but event keys (aggregated in `maybeEvent`) were also specified at the top level. ambiguous and deprecated usage.
    const duplicateKeys = Array.from(DOCUMENT_EVENT_KEYS).filter((key) => key in functionResource)
    if (duplicateKeys.length > 0) {
      errors.push({
        type: 'invalid_property',
        message: `\`event\` properties should be specified under the \`event\` key - specifying them at the top level is deprecated. The following keys were specified at the top level: ${duplicateKeys.map((k) => `\`${k}\``).join(', ')}`,
      })
    } else {
      errors.push(...validateDocumentFunctionEvent(functionResource.event))
    }
  } else {
    errors.push(...validateDocumentFunctionEvent(functionResource))
  }

  if ('type' in functionResource && functionResource.type !== 'sanity.function.document') {
    errors.push({type: 'invalid_value', message: '`type` must be `sanity.function.document`'})
  }

  return errors
}

/**
 * Validates a media library asset function resource configuration.
 * Checks that the function has a valid event configuration with required resource, correct type, and all required base properties.
 * @param functionResource The function resource to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateMediaLibraryAssetFunction(functionResource: unknown): BlueprintError[] {
  if (!functionResource) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionResource !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = validateFunction(functionResource)

  if ('event' in functionResource) {
    errors.push(...validateMediaLibraryFunctionEvent(functionResource.event))
  } else {
    errors.push({type: 'missing_parameter', message: '`event` is required for a media library function'})
  }

  if ('type' in functionResource && functionResource.type !== 'sanity.function.media-library.asset') {
    errors.push({type: 'invalid_value', message: '`type` must be `sanity.function.media-library.asset`'})
  }

  return errors
}

/**
 * Validates base function resource properties.
 * Checks that required fields (name, type) are present and that optional fields have correct types.
 * @param functionResource The function resource to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateFunction(functionResource: unknown): BlueprintError[] {
  if (!functionResource) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionResource !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = validateResource(functionResource)

  if (!('name' in functionResource)) {
    errors.push({type: 'missing_parameter', message: '`name` is required'})
  } else if (typeof functionResource.name !== 'string') {
    errors.push({type: 'invalid_type', message: '`name` must be a string'})
  }

  if (!('type' in functionResource)) {
    errors.push({type: 'missing_parameter', message: '`type` is required'})
  } else if (typeof functionResource.type !== 'string') {
    errors.push({type: 'invalid_type', message: '`type` must be a string'})
  }

  // type validation
  if ('memory' in functionResource) {
    if (typeof functionResource.memory !== 'number' && typeof functionResource.memory !== 'undefined') {
      errors.push({type: 'invalid_type', message: '`memory` must be a number'})
    }
  }
  if ('timeout' in functionResource) {
    if (typeof functionResource.timeout !== 'number' && typeof functionResource.timeout !== 'undefined') {
      errors.push({type: 'invalid_type', message: '`timeout` must be a number'})
    }
  }

  if ('robotToken' in functionResource) {
    if (typeof functionResource.robotToken !== 'string' && typeof functionResource.robotToken !== 'undefined') {
      errors.push({type: 'invalid_type', message: '`robotToken` must be a string'})
    }
  }

  return errors
}

/**
 * Validates a document function event configuration.
 * Checks event trigger types, optional filter/projection, and optional dataset resource scoping.
 * @param event The event configuration to validate
 * @returns Array of validation errors, empty if valid
 */
function validateDocumentFunctionEvent(event: unknown): BlueprintError[] {
  if (!event) return [{type: 'invalid_value', message: 'Function event must be provided'}]
  if (typeof event !== 'object') return [{type: 'invalid_type', message: 'Function event must be an object'}]

  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => DOCUMENT_EVENT_KEYS.has(key as DocumentFunctionEventKey)),
  ) as Partial<BlueprintDocumentFunctionResourceEvent>
  const errors: BlueprintError[] = []

  const fullEvent = {
    on: cleanEvent.on || ['publish'],
    ...cleanEvent,
  }
  if (!Array.isArray(fullEvent.on)) errors.push({type: 'invalid_type', message: '`event.on` must be an array'})
  if (fullEvent.resource) {
    if (!fullEvent.resource.type || fullEvent.resource.type !== 'dataset')
      errors.push({type: 'invalid_value', message: '`event.resource.type` must be "dataset"'})
    if (!fullEvent.resource.id || fullEvent.resource.id.split('.').length !== 2)
      errors.push({type: 'invalid_format', message: '`event.resource.id` must be in the format <projectId>.<datasetName>'})
  }
  return errors
}

/**
 * Validates a media library function event configuration.
 * Checks event trigger types and ensures required media library resource is present.
 * @param event The event configuration to validate
 * @returns Array of validation errors, empty if valid
 */
function validateMediaLibraryFunctionEvent(event: unknown): BlueprintError[] {
  if (!event) return [{type: 'invalid_value', message: 'Function event must be provided'}]
  if (typeof event !== 'object') return [{type: 'invalid_type', message: 'Function event must be an object'}]

  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => MEDIA_LIBRARY_EVENT_KEYS.has(key as MediaLibraryFunctionEventKey)),
  ) as BlueprintMediaLibraryFunctionResourceEvent
  const errors: BlueprintError[] = []

  const fullEvent = {
    on: cleanEvent.on || ['publish'],
    ...cleanEvent,
  }
  if (!Array.isArray(fullEvent.on)) errors.push({type: 'invalid_type', message: '`event.on` must be an array'})
  if (fullEvent.resource) {
    if (!fullEvent.resource.type || fullEvent.resource.type !== 'media-library')
      errors.push({type: 'invalid_value', message: '`event.resource.type` must be "media-library"'})
  } else {
    errors.push({type: 'missing_parameter', message: '`resource` is required for a media library function'})
  }
  return errors
}

export function validateScheduleFunction(functionResource: unknown): BlueprintError[] {
  if (!functionResource) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionResource !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = []

  if ('event' in functionResource) {
    errors.push(...validateScheduleFunctionEvent(functionResource.event))
  } else {
    errors.push({type: 'missing_parameter', message: '`event` is required for a schedule function'})
  }

  if ('type' in functionResource && functionResource.type !== 'sanity.function.cron') {
    errors.push({type: 'invalid_value', message: '`type` must be `sanity.function.cron`'})
  }

  if ('timezone' in functionResource) {
    errors.push(...validateScheduleFunctionTimezone(functionResource.timezone))
  }

  errors.push(...validateFunction(functionResource))

  return errors
}

function validateScheduleFunctionEvent(event: unknown): BlueprintError[] {
  if (!event) return [{type: 'invalid_value', message: 'Function event must be provided'}]
  if (typeof event !== 'object') return [{type: 'invalid_type', message: 'Function event must be an object'}]

  const errors: BlueprintError[] = []

  const hasExpression = 'expression' in event
  const hasExplicitFields = 'minute' in event || 'hour' in event || 'dayOfMonth' in event || 'month' in event || 'dayOfWeek' in event

  if (hasExpression && hasExplicitFields) {
    errors.push({
      type: 'invalid_property',
      message: 'Cannot specify both `expression` and explicit cron fields (`minute`, `hour`, `dayOfMonth`, `month`, `dayOfWeek`)',
    })
  } else if (!hasExpression && !hasExplicitFields) {
    errors.push({
      type: 'missing_parameter',
      message: 'Either `expression` or explicit cron fields (`minute`, `hour`, `dayOfMonth`, `month`, `dayOfWeek`) must be provided',
    })
  } else if (hasExplicitFields) {
    if (!('minute' in event)) {
      errors.push({
        type: 'missing_parameter',
        message: '`minute` must be provided',
      })
    } else if (typeof event.minute !== 'string') {
      errors.push({type: 'invalid_type', message: '`minute` must be a string'})
    }
    if (!('hour' in event)) {
      errors.push({
        type: 'missing_parameter',
        message: '`hour` must be provided',
      })
    } else if (typeof event.hour !== 'string') {
      errors.push({type: 'invalid_type', message: '`hour` must be a string'})
    }
    if (!('dayOfWeek' in event)) {
      errors.push({
        type: 'missing_parameter',
        message: '`dayOfWeek` must be provided',
      })
    } else if (typeof event.dayOfWeek !== 'string') {
      errors.push({type: 'invalid_type', message: '`dayOfWeek` must be a string'})
    }
    if (!('month' in event)) {
      errors.push({
        type: 'missing_parameter',
        message: '`month` must be provided',
      })
    } else if (typeof event.month !== 'string') {
      errors.push({type: 'invalid_type', message: '`month` must be a string'})
    }
    if (!('dayOfMonth' in event)) {
      errors.push({
        type: 'missing_parameter',
        message: '`dayOfMonth` must be provided',
      })
    } else if (typeof event.dayOfMonth !== 'string') {
      errors.push({type: 'invalid_type', message: '`dayOfMonth` must be a string'})
    }
  }

  return errors
}

function validateScheduleFunctionTimezone(timezone: unknown): BlueprintError[] {
  if (typeof timezone !== 'string') return [{type: 'invalid_type', message: 'Function timezone must be a string'}]

  const errors: BlueprintError[] = []

  try {
    Intl.DateTimeFormat(undefined, {timeZone: timezone})
  } catch {
    errors.push({
      type: 'invalid_value',
      message: '`timezone` must be a valid IANA timezone',
    })
  }

  return errors
}
