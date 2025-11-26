import type {
  BlueprintDocumentFunctionResourceEvent,
  BlueprintError,
  BlueprintFunctionBaseResourceEvent,
  BlueprintMediaLibraryFunctionResourceEvent,
} from '../index.js'

type BaseFunctionEventKey = keyof BlueprintFunctionBaseResourceEvent
const BASE_EVENT_KEYS = new Set<BaseFunctionEventKey>(['on', 'filter', 'projection', 'includeDrafts'])
type DocumentFunctionEventKey = keyof BlueprintDocumentFunctionResourceEvent
const DOCUMENT_EVENT_KEYS = new Set<DocumentFunctionEventKey>(['includeAllVersions', 'resource', ...BASE_EVENT_KEYS.values()])
type MediaLibraryFunctionEventKey = keyof BlueprintMediaLibraryFunctionResourceEvent
const MEDIA_LIBRARY_EVENT_KEYS = new Set<MediaLibraryFunctionEventKey>(['resource', ...BASE_EVENT_KEYS.values()])

export function validateDocumentFunction(functionResource: unknown): BlueprintError[] {
  if (!functionResource) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionResource !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = []

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

  errors.push(...validateFunction(functionResource))

  return errors
}

export function validateMediaLibraryAssetFunction(functionResource: unknown): BlueprintError[] {
  if (!functionResource) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionResource !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = []

  if ('event' in functionResource) {
    errors.push(...validateMediaLibraryFunctionEvent(functionResource.event))
  } else {
    errors.push({type: 'missing_parameter', message: '`event` is required for a media library function'})
  }

  if ('type' in functionResource && functionResource.type !== 'sanity.function.media-library.asset') {
    errors.push({type: 'invalid_value', message: '`type` must be `sanity.function.media-library.asset`'})
  }

  errors.push(...validateFunction(functionResource))

  return errors
}

export function validateFunction(functionResource: unknown): BlueprintError[] {
  if (!functionResource) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionResource !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = []

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

  return errors
}

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
