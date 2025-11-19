import type {BlueprintResource} from '../types'

export interface BlueprintFunctionBaseResourceEvent {
  on?: [BlueprintFunctionResourceEventName, ...BlueprintFunctionResourceEventName[]]
  filter?: string
  projection?: `{${string}}`
}
export interface BlueprintDocumentFunctionResourceEvent extends BlueprintFunctionBaseResourceEvent {
  includeDrafts?: boolean
  includeAllVersions?: boolean
  resource?: BlueprintFunctionResourceEventResourceDataset
}
export interface BlueprintMediaLibraryFunctionResourceEvent extends BlueprintFunctionBaseResourceEvent {
  resource: BlueprintFunctionResourceEventResourceMediaLibrary
}
export type BlueprintFunctionResourceEvent = BlueprintDocumentFunctionResourceEvent | BlueprintMediaLibraryFunctionResourceEvent

interface BlueprintFunctionResourceEventResourceDataset {
  type: 'dataset'
  /** @description A dataset ID in the format <projectId>.<datasetName>. <datasetName> can be `*` to signify "all datasets in project with ID <projectId>." */
  id: string
}
interface BlueprintFunctionResourceEventResourceMediaLibrary {
  type: 'media-library'
  id: string
}

type BlueprintFunctionResourceEventName = 'publish' | 'create' | 'delete' | 'update'

export interface BlueprintBaseFunctionResource extends BlueprintResource {
  src: string
  timeout?: number
  memory?: number
  env?: Record<string, string>
}
export interface BlueprintDocumentFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.document'
  event: BlueprintDocumentFunctionResourceEvent
}
export interface BlueprintMediaLibraryAssetFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.media-library.asset'
  event: BlueprintMediaLibraryFunctionResourceEvent
}

type BaseFunctionEventKey = keyof BlueprintFunctionBaseResourceEvent
const BASE_EVENT_KEYS = new Set<BaseFunctionEventKey>(['on', 'filter', 'projection'])
type DocumentFunctionEventKey = keyof BlueprintDocumentFunctionResourceEvent
const DOCUMENT_EVENT_KEYS = new Set<DocumentFunctionEventKey>([
  'includeDrafts',
  'includeAllVersions',
  'resource',
  ...BASE_EVENT_KEYS.values(),
])
type MediaLibraryFunctionEventKey = keyof BlueprintMediaLibraryFunctionResourceEvent
const MEDIA_LIBRARY_EVENT_KEYS = new Set<MediaLibraryFunctionEventKey>(['resource', ...BASE_EVENT_KEYS.values()])

export function defineDocumentFunction(functionConfig: Partial<BlueprintDocumentFunctionResource>): BlueprintDocumentFunctionResource

/** @deprecated Define event properties under the 'event' key instead of specifying them at the top level */
export function defineDocumentFunction(
  functionConfig: Partial<BlueprintDocumentFunctionResource> & Partial<BlueprintDocumentFunctionResourceEvent>,
): BlueprintDocumentFunctionResource

export function defineDocumentFunction(
  functionConfig: Partial<BlueprintDocumentFunctionResource> & Partial<BlueprintDocumentFunctionResourceEvent>,
): BlueprintDocumentFunctionResource {
  let {name, src, event, timeout, memory, env, type, ...maybeEvent} = functionConfig
  if (!type) type = 'sanity.function.document'

  // event validation
  if (event) {
    // `event` was specified, but event keys (aggregated in `maybeEvent`) were also specified at the top level. ambiguous and deprecated usage.
    const duplicateKeys = Object.keys(maybeEvent).filter((k) => DOCUMENT_EVENT_KEYS.has(k as DocumentFunctionEventKey))
    if (duplicateKeys.length > 0) {
      throw new Error(
        `\`event\` properties should be specified under the \`event\` key - specifying them at the top level is deprecated. The following keys were specified at the top level: ${duplicateKeys.map((k) => `\`${k}\``).join(', ')}`,
      )
    }
    event = validateDocumentFunctionEvent(event)
  } else {
    event = validateDocumentFunctionEvent(maybeEvent)
    // deprecated usage of putting event properties at the top level, warn about this.
    console.warn(
      '⚠️ Deprecated usage of `defineDocumentFunction`: prefer to put `event` properties under the `event` key rather than at the top level.',
    )
  }

  return {
    ...defineFunction({
      name,
      src,
      timeout,
      memory,
      env,
    }),
    type,
    event,
  }
}

export function defineMediaLibraryAssetFunction(
  functionConfig: Partial<BlueprintMediaLibraryAssetFunctionResource> &
    Pick<BlueprintMediaLibraryAssetFunctionResource, 'event'> &
    Partial<BlueprintMediaLibraryFunctionResourceEvent>,
): BlueprintMediaLibraryAssetFunctionResource {
  let {name, src, event, timeout, memory, env, type} = functionConfig
  if (!type) type = 'sanity.function.media-library.asset'

  return {
    ...defineFunction({
      name,
      src,
      timeout,
      memory,
      env,
    }),
    type,
    event: validateMediaLibraryFunctionEvent(event),
  }
}
export function defineFunction(functionConfig: Partial<BlueprintBaseFunctionResource>): BlueprintBaseFunctionResource {
  let {name, src, timeout, memory, env, type} = functionConfig

  if (!name) throw new Error('`name` is required')

  // defaults
  if (!src) src = `functions/${name}`
  if (!type) type = 'sanity.function.document'

  // type validation
  if (memory && typeof memory !== 'number') throw new Error('`memory` must be a number')
  if (timeout && typeof timeout !== 'number') throw new Error('`timeout` must be a number')

  return {
    type,
    name,
    src,
    timeout,
    memory,
    env,
  }
}

function validateDocumentFunctionEvent(event: Partial<BlueprintDocumentFunctionResourceEvent>): BlueprintDocumentFunctionResourceEvent {
  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => DOCUMENT_EVENT_KEYS.has(key as DocumentFunctionEventKey)),
  ) as Partial<BlueprintDocumentFunctionResourceEvent>

  const fullEvent = {
    on: cleanEvent.on || ['publish'],
    ...cleanEvent,
  }
  if (!Array.isArray(fullEvent.on)) throw new Error('`event.on` must be an array')
  if (fullEvent.resource) {
    if (!fullEvent.resource.type || fullEvent.resource.type !== 'dataset') throw new Error('`event.resource.type` must be "dataset"')
    if (!fullEvent.resource.id || fullEvent.resource.id.split('.').length !== 2)
      throw new Error('`event.resource.id` must be in the format <projectId>.<datasetName>')
  }
  return fullEvent
}

function validateMediaLibraryFunctionEvent(event: BlueprintMediaLibraryFunctionResourceEvent): BlueprintMediaLibraryFunctionResourceEvent {
  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => MEDIA_LIBRARY_EVENT_KEYS.has(key as MediaLibraryFunctionEventKey)),
  ) as BlueprintMediaLibraryFunctionResourceEvent

  const fullEvent = {
    on: cleanEvent.on || ['publish'],
    ...cleanEvent,
  }
  if (!Array.isArray(fullEvent.on)) throw new Error('`event.on` must be an array')
  return fullEvent
}
