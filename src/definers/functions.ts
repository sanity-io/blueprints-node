import {
  validateDocumentFunction,
  validateFunction,
  validateMediaLibraryAssetFunction,
  type BlueprintBaseFunctionResource,
  type BlueprintDocumentFunctionResource,
  type BlueprintDocumentFunctionResourceEvent,
  type BlueprintFunctionBaseResourceEvent,
  type BlueprintMediaLibraryAssetFunctionResource,
  type BlueprintMediaLibraryFunctionResourceEvent,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

type BaseFunctionEventKey = keyof BlueprintFunctionBaseResourceEvent
const BASE_EVENT_KEYS = new Set<BaseFunctionEventKey>(['on', 'filter', 'projection', 'includeDrafts'])
type DocumentFunctionEventKey = keyof BlueprintDocumentFunctionResourceEvent
const DOCUMENT_EVENT_KEYS = new Set<DocumentFunctionEventKey>(['includeAllVersions', 'resource', ...BASE_EVENT_KEYS.values()])
type MediaLibraryFunctionEventKey = keyof BlueprintMediaLibraryFunctionResourceEvent
const MEDIA_LIBRARY_EVENT_KEYS = new Set<MediaLibraryFunctionEventKey>(['resource', ...BASE_EVENT_KEYS.values()])

interface RequiredFunctionProperties {
  name: string
}

export function defineDocumentFunction(
  functionConfig: Partial<BlueprintDocumentFunctionResource> & RequiredFunctionProperties,
): BlueprintDocumentFunctionResource

/** @deprecated Define event properties under the 'event' key instead of specifying them at the top level */
export function defineDocumentFunction(
  functionConfig: Partial<BlueprintDocumentFunctionResource> & RequiredFunctionProperties & Partial<BlueprintDocumentFunctionResourceEvent>,
): BlueprintDocumentFunctionResource

export function defineDocumentFunction(
  functionConfig: Partial<BlueprintDocumentFunctionResource> & RequiredFunctionProperties & Partial<BlueprintDocumentFunctionResourceEvent>,
): BlueprintDocumentFunctionResource {
  runValidation(() => validateDocumentFunction(functionConfig))

  let {name, src, event, timeout, memory, env, type, ...maybeEvent} = functionConfig
  if (!type) type = 'sanity.function.document'

  // event validation
  if (event) {
    event = buildDocumentFunctionEvent(event)
  } else {
    event = buildDocumentFunctionEvent(maybeEvent)
    // deprecated usage of putting event properties at the top level, warn about this.
    console.warn(
      '⚠️ Deprecated usage of `defineDocumentFunction`: prefer to put `event` properties under the `event` key rather than at the top level.',
    )
  }

  return {
    ...defineFunction(
      {
        name,
        src,
        timeout,
        memory,
        env,
      },
      {
        skipValidation: true, // already done above
      },
    ),
    type,
    event,
  }
}

export function defineMediaLibraryAssetFunction(
  functionConfig: Partial<BlueprintMediaLibraryAssetFunctionResource> &
    RequiredFunctionProperties &
    Pick<BlueprintMediaLibraryAssetFunctionResource, 'event'> &
    Partial<BlueprintMediaLibraryFunctionResourceEvent>,
): BlueprintMediaLibraryAssetFunctionResource {
  runValidation(() => validateMediaLibraryAssetFunction(functionConfig))

  let {name, src, event, timeout, memory, env, type} = functionConfig
  if (!type) type = 'sanity.function.media-library.asset'

  return {
    ...defineFunction(
      {
        name,
        src,
        timeout,
        memory,
        env,
      },
      {
        skipValidation: true, // already done above
      },
    ),
    type,
    event: buildMediaLibraryFunctionEvent(event),
  }
}
export function defineFunction(
  functionConfig: Partial<BlueprintBaseFunctionResource> & RequiredFunctionProperties,
  options?: {skipValidation?: boolean},
): BlueprintBaseFunctionResource {
  let {name, src, timeout, memory, env, type} = functionConfig

  if (options?.skipValidation !== true) runValidation(() => validateFunction(functionConfig))

  // defaults
  if (!src) src = `functions/${name}`
  if (!type) type = 'sanity.function.document'

  return {
    type,
    name,
    src,
    timeout,
    memory,
    env,
  }
}

function buildDocumentFunctionEvent(event: Partial<BlueprintDocumentFunctionResourceEvent>): BlueprintDocumentFunctionResourceEvent {
  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => DOCUMENT_EVENT_KEYS.has(key as DocumentFunctionEventKey)),
  ) as Partial<BlueprintDocumentFunctionResourceEvent>

  return {
    on: cleanEvent.on || ['publish'],
    ...cleanEvent,
  }
}

function buildMediaLibraryFunctionEvent(event: BlueprintMediaLibraryFunctionResourceEvent): BlueprintMediaLibraryFunctionResourceEvent {
  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => MEDIA_LIBRARY_EVENT_KEYS.has(key as MediaLibraryFunctionEventKey)),
  ) as BlueprintMediaLibraryFunctionResourceEvent

  const fullEvent = {
    on: cleanEvent.on || ['publish'],
    ...cleanEvent,
  }
  return fullEvent
}
