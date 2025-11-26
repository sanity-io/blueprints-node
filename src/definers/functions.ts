import {
  type BlueprintBaseFunctionResource,
  type BlueprintDocumentFunctionResource,
  type BlueprintDocumentFunctionResourceEvent,
  type BlueprintFunctionBaseResourceEvent,
  type BlueprintMediaLibraryAssetFunctionResource,
  type BlueprintMediaLibraryFunctionResourceEvent,
  validateDocumentFunction,
  validateFunction,
  validateMediaLibraryAssetFunction,
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
  let {name, src, event, timeout, memory, env, type, ...maybeEvent} = functionConfig
  if (!type) type = 'sanity.function.document'

  // event validation and normalization
  if (event) {
    // `event` was specified, but event keys (aggregated in `maybeEvent`) were also specified at the top level. ambiguous and deprecated usage.
    const duplicateKeys = Array.from(DOCUMENT_EVENT_KEYS).filter((key) => key in maybeEvent)
    if (duplicateKeys.length > 0) {
      throw new Error(
        `\`event\` properties should be specified under the \`event\` key - specifying them at the top level is deprecated. The following keys were specified at the top level: ${duplicateKeys.map((k) => `\`${k}\``).join(', ')}`,
      )
    }

    event = buildDocumentFunctionEvent(event)
  } else {
    event = buildDocumentFunctionEvent(maybeEvent)
    // deprecated usage of putting event properties at the top level, warn about this.
    console.warn(
      '⚠️ Deprecated usage of `defineDocumentFunction`: prefer to put `event` properties under the `event` key rather than at the top level.',
    )
  }

  const functionResource: BlueprintDocumentFunctionResource = {
    ...defineFunction(
      {
        name,
        src,
        timeout,
        memory,
        env,
      },
      {
        skipValidation: true, // already done below
      },
    ),
    type,
    event,
  }

  runValidation(() => validateDocumentFunction(functionResource))

  return functionResource
}

export function defineMediaLibraryAssetFunction(
  functionConfig: Partial<BlueprintMediaLibraryAssetFunctionResource> &
    RequiredFunctionProperties &
    Pick<BlueprintMediaLibraryAssetFunctionResource, 'event'> &
    Partial<BlueprintMediaLibraryFunctionResourceEvent>,
): BlueprintMediaLibraryAssetFunctionResource {
  let {name, src, event, timeout, memory, env, type} = functionConfig
  if (!type) type = 'sanity.function.media-library.asset'

  const functionResource: BlueprintMediaLibraryAssetFunctionResource = {
    ...defineFunction(
      {
        name,
        src,
        timeout,
        memory,
        env,
      },
      {
        skipValidation: true, // already done below
      },
    ),
    type,
    event: buildMediaLibraryFunctionEvent(event),
  }

  runValidation(() => validateMediaLibraryAssetFunction(functionResource))

  return functionResource
}

export function defineFunction(
  functionConfig: Partial<BlueprintBaseFunctionResource> & RequiredFunctionProperties,
  options?: {skipValidation?: boolean},
): BlueprintBaseFunctionResource {
  let {name, src, timeout, memory, env, type} = functionConfig

  // defaults
  if (!src) src = `functions/${name}`
  if (!type) type = 'sanity.function.document'

  const functionResource: BlueprintBaseFunctionResource = {
    type,
    name,
    src,
    timeout,
    memory,
    env,
  }

  if (options?.skipValidation !== true) runValidation(() => validateFunction(functionResource))

  return functionResource
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
