import {
  type BlueprintBaseFunctionResource,
  type BlueprintDocumentFunctionResource,
  type BlueprintDocumentFunctionResourceEvent,
  type BlueprintFunctionBaseResourceEvent,
  type BlueprintMediaLibraryAssetFunctionResource,
  type BlueprintMediaLibraryFunctionResourceEvent,
  type BlueprintScheduleFunctionExplicitResourceEvent,
  type BlueprintScheduleFunctionExpressionResourceEvent,
  type BlueprintScheduleFunctionResource,
  type BlueprintScheduleFunctionResourceEvent,
  validateDocumentFunction,
  validateFunction,
  validateMediaLibraryAssetFunction,
  validateScheduleFunction,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

type BaseFunctionEventKey = keyof BlueprintFunctionBaseResourceEvent
const BASE_EVENT_KEYS = new Set<BaseFunctionEventKey>(['on', 'filter', 'projection', 'includeDrafts'])
type DocumentFunctionEventKey = keyof BlueprintDocumentFunctionResourceEvent
const DOCUMENT_EVENT_KEYS = new Set<DocumentFunctionEventKey>(['includeAllVersions', 'resource', ...BASE_EVENT_KEYS.values()])
type MediaLibraryFunctionEventKey = keyof BlueprintMediaLibraryFunctionResourceEvent
const MEDIA_LIBRARY_EVENT_KEYS = new Set<MediaLibraryFunctionEventKey>(['resource', ...BASE_EVENT_KEYS.values()])
type ScheduleFunctionEventKey =
  | keyof BlueprintScheduleFunctionExplicitResourceEvent
  | keyof BlueprintScheduleFunctionExpressionResourceEvent
const SCHEDULE_EVENT_KEYS = new Set<ScheduleFunctionEventKey>(['minute', 'hour', 'dayOfWeek', 'month', 'dayOfMonth', 'expression'])

interface RequiredFunctionProperties {
  name: string
}

/**
 * Defines a function that is triggered by document events in Sanity datasets.
 * ```
 * defineDocumentFunction({
 *   name: 'my-document-function',
 *   src: 'functions/my-function',
 *   memory: 3,
 *   timeout: 300,
 *   event: {
 *     on: ['create', 'update'],
 *     filter: "_type == 'some-type'",
 *     projection: "{title, _id, _type}",
 *     includeDrafts: false,
 *   },
 *   env: {
 *     MY_ENV_VAR: 'custom-value',
 *   },
 * })
 * ```
 * @param functionConfig The configuration for the document function
 * @returns The validated document function resource
 */
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
  let {name, src, event, timeout, memory, env, type, robotToken, ...maybeEvent} = functionConfig
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
        robotToken,
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

/**
 * Defines a function that is triggered by media library events.
 * ```
 * defineMediaLibraryAssetFunction({
 *   name: 'my-media-library-function',
 *   src: 'functions/media-library-function',
 *   event: {
 *     on: ['create', 'update'],
 *     resource: {
 *       type: 'media-library',
 *       id: 'my-media-library-id',
 *     },
 *     filter: "type == 'my-type'",
 *     projection: "{_id}",
 *   },
 *   env: {
 *     MY_ENV_VAR: 'custom-value',
 *   },
 * })
 * ```
 * @param functionConfig The configuration for the media library asset function
 * @returns The validated media library asset function resource
 */
export function defineMediaLibraryAssetFunction(
  functionConfig: Partial<BlueprintMediaLibraryAssetFunctionResource> &
    RequiredFunctionProperties &
    Pick<BlueprintMediaLibraryAssetFunctionResource, 'event'> &
    Partial<BlueprintMediaLibraryFunctionResourceEvent>,
): BlueprintMediaLibraryAssetFunctionResource {
  let {name, src, event, timeout, memory, env, type, robotToken} = functionConfig
  if (!type) type = 'sanity.function.media-library.asset'

  const functionResource: BlueprintMediaLibraryAssetFunctionResource = {
    ...defineFunction(
      {
        name,
        src,
        timeout,
        memory,
        env,
        robotToken,
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

/**
 * Defines a function that is triggered on a schedule.
 * ```
 * defineScheduleFunction({
 *   name: 'my-schedule-function',
 *   src: 'functions/schedule-function',
 *   memory: 3,
 *   timeout: 300,
 *   event: {
 *     minute: "0",
 *     hour: "0",
 *     dayOfMonth: "*",
 *     month: "*",
 *     dayOfWeek: "*",
 *   },
 * })
 * ```
 * @beta
 * @param functionConfig The configuration for the document function
 * @returns The validated schedule function resource
 */
export function defineScheduleFunction(
  functionConfig: Partial<BlueprintScheduleFunctionResource> &
    RequiredFunctionProperties &
    Pick<BlueprintScheduleFunctionResource, 'event'> &
    Partial<BlueprintScheduleFunctionResourceEvent>,
): BlueprintScheduleFunctionResource {
  let {name, src, event, timeout, memory, env, type, timezone} = functionConfig
  if (!type) type = 'sanity.function.cron'

  const functionResource: BlueprintScheduleFunctionResource = {
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
    event: buildScheduleFunctionEvent(event),
  }
  if (timezone) {
    functionResource.timezone = timezone
  }

  runValidation(() => validateScheduleFunction(functionResource))

  return functionResource
}

/**
 * Defines a base function resource with common properties.
 * ```
 * defineFunction({
 *   name: 'my-function',
 *   src: 'functions/my-function',
 *   timeout: 300,
 *   memory: 1,
 *   env: {
 *     MY_ENV_VAR: 'my-custom-value'
 *   },
 * })
 * ```
 * @param functionConfig The configuration for the function
 * @param options Optional configuration including validation options
 * @returns The validated function resource
 */
export function defineFunction(
  functionConfig: Partial<BlueprintBaseFunctionResource> & RequiredFunctionProperties,
  options?: {skipValidation?: boolean},
): BlueprintBaseFunctionResource {
  let {name, src, timeout, memory, env, type, robotToken} = functionConfig

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
    robotToken,
  }

  if (options?.skipValidation !== true) runValidation(() => validateFunction(functionResource))

  return functionResource
}

/**
 * Builds a document function event configuration from partial event properties.
 * Filters out non-event properties and applies defaults.
 * @param event Partial document function event configuration
 * @returns Complete document function event configuration
 */
function buildDocumentFunctionEvent(event: Partial<BlueprintDocumentFunctionResourceEvent>): BlueprintDocumentFunctionResourceEvent {
  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => DOCUMENT_EVENT_KEYS.has(key as DocumentFunctionEventKey)),
  ) as Partial<BlueprintDocumentFunctionResourceEvent>

  return {
    on: cleanEvent.on || ['publish'],
    ...cleanEvent,
  }
}

/**
 * Builds a media library function event configuration.
 * Filters out non-event properties and applies defaults.
 * @param event Media library function event configuration
 * @returns Complete media library function event configuration
 */
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

function buildScheduleFunctionEvent(event: BlueprintScheduleFunctionResourceEvent): BlueprintScheduleFunctionResourceEvent {
  const cleanEvent = Object.fromEntries(
    Object.entries(event).filter(([key]) => SCHEDULE_EVENT_KEYS.has(key as ScheduleFunctionEventKey)),
  ) as BlueprintScheduleFunctionResourceEvent

  return cleanEvent
}
