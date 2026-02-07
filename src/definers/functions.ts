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
import {parseScheduleExpression} from '../utils/schedule-parser.js'
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

/** @internal */
export interface RequiredFunctionProperties {
  name: string
}

/*
 * FUTURE example (move below @example when ready)
 * @example With robot token reference
 * ```ts
 * defineRole({
 *   name: 'fn-role',
 *   title: 'Function Role',
 *   appliesToRobots: true,
 *   permissions: [{name: 'sanity-project-dataset', action: 'read'}],
 * })
 *
 * defineRobotToken({
 *   name: 'fn-robot',
 *   memberships: [{
 *     roleNames: ['$.resources.fn-role'],
 *   }],
 * })
 *
 * defineDocumentFunction({
 *   name: 'sync-to-external',
 *   src: 'functions/sync',
 *   memory: 3,
 *   timeout: 300,
 *   robotToken: '$.resources.fn-robot',
 *   event: {
 *     on: ['create', 'update'],
 *     filter: "_type == 'product'",
 *     projection: "{_id, title, slug}",
 *     includeDrafts: false,
 *   },
 *   env: {
 *     EXTERNAL_API_URL: 'https://api.example.com',
 *     SUPER_SECRET: process.env.SUPER_SECRET,
 *   },
 * })
 * ```
 */
/**
 * Defines a function that is triggered by document events in Sanity datasets.
 *
 * @example
 * ```ts
 * defineDocumentFunction({
 *   name: 'my-document-function',
 *   event: {
 *     on: ['create', 'update'],
 *     filter: "_type == 'post'",
 *     projection: "{_id, title, slug}",
 *   },
 * })
 * ```
 * @param functionConfig The configuration for the document function
 * @public
 * @category Definers
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
  let {name, src, event, timeout, memory, env, type, robotToken, project, runtime, ...maybeEvent} = functionConfig
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
        project,
        runtime,
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

/*
 * FUTURE example (move below @example when ready)
 * @example With robot token reference
 * ```ts
 * defineRobotToken({
 *   name: 'media-robot',
 *   memberships: [{
 *     resourceType: 'project',
 *     resourceId: projectId,
 *     roleNames: ['editor'],
 *   }],
 * })
 *
 * defineMediaLibraryAssetFunction({
 *   name: 'process-uploads',
 *   src: 'functions/process-uploads-v2',
 *   robotToken: '$.resources.media-robot',
 *   event: {
 *     on: ['create', 'update'],
 *     resource: {
 *       type: 'media-library',
 *       id: 'my-media-library-id',
 *     },
 *     filter: "type == 'image'",
 *     projection: "{_id}",
 *   },
 *   env: {
 *     CDN_BUCKET: 'my-cdn-bucket',
 *   },
 * })
 * ```
 */
/**
 * Defines a function that is triggered by media library events.
 *
 * @example
 * ```ts
 * defineMediaLibraryAssetFunction({
 *   name: 'my-media-library-function',
 *   event: {
 *     on: ['create'],
 *     resource: {
 *       type: 'media-library',
 *       id: 'my-media-library-id',
 *     },
 *   },
 * })
 * ```
 * @param functionConfig The configuration for the media library asset function
 * @public
 * @category Definers
 * @returns The validated media library asset function resource
 */
export function defineMediaLibraryAssetFunction(
  functionConfig: Partial<BlueprintMediaLibraryAssetFunctionResource> &
    RequiredFunctionProperties &
    Pick<BlueprintMediaLibraryAssetFunctionResource, 'event'> &
    Partial<BlueprintMediaLibraryFunctionResourceEvent>,
): BlueprintMediaLibraryAssetFunctionResource {
  let {name, src, event, timeout, memory, env, type, robotToken, project, runtime} = functionConfig
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
        project,
        runtime,
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
 * Supports cron expressions or natural language schedules.
 *
 * @remarks
 * Using explicit cron fields:
 * ```ts
 * defineScheduleFunction({
 *   name: 'my-schedule-function',
 *   event: {minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '*'},
 * })
 * ```
 *
 * The `event.expression` field accepts standard cron expressions or natural language:
 * `'every 15 minutes'`, `'weekdays at 8am'`, `'fridays in the evening'`,
 * `'mon, wed, fri at 9am'`, `'first of the month at noon'`
 *
 * @example
 * ```ts
 * defineScheduleFunction({
 *   name: 'daily-cleanup',
 *   event: {expression: 'every day at 9am'},
 * })
 * ```
 * @public
 * @alpha Deploying Schedule Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Definers
 * @param functionConfig The configuration for the schedule function
 * @returns The validated schedule function resource
 */
export function defineScheduleFunction(
  functionConfig: Partial<BlueprintScheduleFunctionResource> &
    RequiredFunctionProperties &
    Pick<BlueprintScheduleFunctionResource, 'event'> &
    Partial<BlueprintScheduleFunctionResourceEvent>,
): BlueprintScheduleFunctionResource {
  let {name, src, event, timeout, memory, env, type, timezone, runtime} = functionConfig
  if (!type) type = 'sanity.function.cron'

  const functionResource: BlueprintScheduleFunctionResource = {
    ...defineFunction(
      {
        name,
        src,
        timeout,
        memory,
        env,
        runtime,
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

  // Parse expression after validation (validation ensures it's valid)
  if ('expression' in functionResource.event && functionResource.event.expression) {
    functionResource.event.expression = parseScheduleExpression(functionResource.event.expression)
  }

  return functionResource
}

/**
 * Defines a base function resource with common properties.
 *
 * @param functionConfig The configuration for the function
 * @param options Optional configuration including validation options
 * @category Definers
 * @internal
 * @returns The validated function resource
 */
export function defineFunction(
  functionConfig: Partial<BlueprintBaseFunctionResource> & RequiredFunctionProperties,
  options?: {skipValidation?: boolean},
): BlueprintBaseFunctionResource {
  let {name, src, timeout, memory, env, type, robotToken, project, runtime} = functionConfig

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
    project,
    runtime,
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

/**
 * Builds a schedule function event configuration.
 * Filters out non-event properties. Does not parse expressions.
 * @param event Schedule function event configuration
 * @returns Cleaned schedule function event configuration
 */
function buildScheduleFunctionEvent(event: BlueprintScheduleFunctionResourceEvent): BlueprintScheduleFunctionResourceEvent {
  return Object.fromEntries(
    Object.entries(event).filter(([key]) => SCHEDULE_EVENT_KEYS.has(key as ScheduleFunctionEventKey)),
  ) as BlueprintScheduleFunctionResourceEvent
}
