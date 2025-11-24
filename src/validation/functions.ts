import type {
  BlueprintBaseFunctionResource,
  BlueprintDocumentFunctionResource,
  BlueprintDocumentFunctionResourceEvent,
  BlueprintFunctionBaseResourceEvent,
  BlueprintMediaLibraryAssetFunctionResource,
  BlueprintMediaLibraryFunctionResourceEvent,
  BlueprintError,
} from '../index.js'

type BaseFunctionEventKey = keyof BlueprintFunctionBaseResourceEvent
const BASE_EVENT_KEYS = new Set<BaseFunctionEventKey>(['on', 'filter', 'projection', 'includeDrafts'])
type DocumentFunctionEventKey = keyof BlueprintDocumentFunctionResourceEvent
const DOCUMENT_EVENT_KEYS = new Set<DocumentFunctionEventKey>(['includeAllVersions', 'resource', ...BASE_EVENT_KEYS.values()])
type MediaLibraryFunctionEventKey = keyof BlueprintMediaLibraryFunctionResourceEvent
const MEDIA_LIBRARY_EVENT_KEYS = new Set<MediaLibraryFunctionEventKey>(['resource', ...BASE_EVENT_KEYS.values()])

interface RequiredFunctionProperties {
  name: string
}

export function validateDocumentFunction(
  functionConfig: Partial<BlueprintDocumentFunctionResource> & RequiredFunctionProperties,
): BlueprintError[]

/** @deprecated Define event properties under the 'event' key instead of specifying them at the top level */
export function validateDocumentFunction(
  functionConfig: Partial<BlueprintDocumentFunctionResource> & RequiredFunctionProperties & Partial<BlueprintDocumentFunctionResourceEvent>,
): BlueprintError[]

export function validateDocumentFunction(
  functionConfig: Partial<BlueprintDocumentFunctionResource> & RequiredFunctionProperties & Partial<BlueprintDocumentFunctionResourceEvent>,
): BlueprintError[] {
  const {name, src, event, timeout, memory, env, type, ...maybeEvent} = functionConfig
  const errors: BlueprintError[] = []

  // event validation
  if (event) {
    // `event` was specified, but event keys (aggregated in `maybeEvent`) were also specified at the top level. ambiguous and deprecated usage.
    const duplicateKeys = Object.keys(maybeEvent).filter((k) => DOCUMENT_EVENT_KEYS.has(k as DocumentFunctionEventKey))
    if (duplicateKeys.length > 0) {
      errors.push({
        type: 'invalid_property',
        message: `\`event\` properties should be specified under the \`event\` key - specifying them at the top level is deprecated. The following keys were specified at the top level: ${duplicateKeys.map((k) => `\`${k}\``).join(', ')}`,
      })
    } else {
      errors.push(...validateDocumentFunctionEvent(event))
    }
  } else {
    errors.push(...validateDocumentFunctionEvent(maybeEvent))
  }

  errors.push(...validateFunction(functionConfig))

  return errors
}

export function validateMediaLibraryAssetFunction(
  functionConfig: Partial<BlueprintMediaLibraryAssetFunctionResource> &
    RequiredFunctionProperties &
    Pick<BlueprintMediaLibraryAssetFunctionResource, 'event'> &
    Partial<BlueprintMediaLibraryFunctionResourceEvent>,
): BlueprintError[] {
  const {event} = functionConfig
  const errors: BlueprintError[] = []

  if (event) {
    errors.push(...validateMediaLibraryFunctionEvent(event))
  } else {
    errors.push({type: 'missing_parameter', message: '`event` is required for a media library function'})
  }

  errors.push(...validateFunction(functionConfig))

  return errors
}

export function validateFunction(functionConfig: Partial<BlueprintBaseFunctionResource> & RequiredFunctionProperties): BlueprintError[] {
  const {name, timeout, memory} = functionConfig
  const errors: BlueprintError[] = []

  if (!name) errors.push({type: 'missing_parameter', message: '`name` is required'})

  // type validation
  if (memory && typeof memory !== 'number') errors.push({type: 'invalid_type', message: '`memory` must be a number'})
  if (timeout && typeof timeout !== 'number') errors.push({type: 'invalid_type', message: '`timeout` must be a number'})

  return errors
}

function validateDocumentFunctionEvent(event: Partial<BlueprintDocumentFunctionResourceEvent>): BlueprintError[] {
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

function validateMediaLibraryFunctionEvent(event: BlueprintMediaLibraryFunctionResourceEvent): BlueprintError[] {
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
