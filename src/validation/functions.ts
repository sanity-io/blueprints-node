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

export function validateDocumentFunction(functionConfig: unknown): BlueprintError[] {
  if (!functionConfig) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionConfig !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = []

  // event validation
  if ('event' in functionConfig) {
    // `event` was specified, but event keys (aggregated in `maybeEvent`) were also specified at the top level. ambiguous and deprecated usage.
    const duplicateKeys = Array.from(DOCUMENT_EVENT_KEYS).filter((key) => key in functionConfig)
    if (duplicateKeys.length > 0) {
      errors.push({
        type: 'invalid_property',
        message: `\`event\` properties should be specified under the \`event\` key - specifying them at the top level is deprecated. The following keys were specified at the top level: ${duplicateKeys.map((k) => `\`${k}\``).join(', ')}`,
      })
    } else {
      errors.push(...validateDocumentFunctionEvent(functionConfig.event))
    }
  } else {
    errors.push(...validateDocumentFunctionEvent(functionConfig))
  }

  errors.push(...validateFunction(functionConfig))

  return errors
}

export function validateMediaLibraryAssetFunction(functionConfig: unknown): BlueprintError[] {
  if (!functionConfig) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionConfig !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = []

  if ('event' in functionConfig) {
    errors.push(...validateMediaLibraryFunctionEvent(functionConfig.event))
  } else {
    errors.push({type: 'missing_parameter', message: '`event` is required for a media library function'})
  }

  errors.push(...validateFunction(functionConfig))

  return errors
}

export function validateFunction(functionConfig: unknown): BlueprintError[] {
  if (!functionConfig) return [{type: 'invalid_value', message: 'Function config must be provided'}]
  if (typeof functionConfig !== 'object') return [{type: 'invalid_type', message: 'Function config must be an object'}]

  const errors: BlueprintError[] = []

  if (!('name' in functionConfig)) {
    errors.push({type: 'missing_parameter', message: '`name` is required'})
  } else if (typeof functionConfig.name !== 'string') {
    errors.push({type: 'invalid_type', message: '`name` must be a string'})
  }

  // type validation
  if ('memory' in functionConfig && typeof functionConfig.memory !== 'number')
    errors.push({type: 'invalid_type', message: '`memory` must be a number'})
  if ('timeout' in functionConfig && typeof functionConfig.timeout !== 'number')
    errors.push({type: 'invalid_type', message: '`timeout` must be a number'})

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
