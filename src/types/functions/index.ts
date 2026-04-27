import type {BlueprintResource} from '../../index.js'
import type {
  BlueprintDocumentFunctionResourceEvent,
  BlueprintMediaLibraryFunctionResourceEvent,
  BlueprintQueueFunctionConfigEvent,
  BlueprintQueueFunctionResourceEvent,
  BlueprintScheduledFunctionConfigEvent,
  BlueprintScheduledFunctionResourceEvent,
  BlueprintSyncTagInvalidateFunctionResourceEvent,
} from './event.js'
import type {IanaTimezone} from './timezone.js'

export * from './event.js'

/**
 * Supported Function runtimes
 * @category Functions Types
 */
export const VALID_RUNTIMES = ['node', 'nodejs22.x', 'nodejs24.x'] as const
/**
 * Supported function runtimes
 * @category Functions Types
 */
export type FunctionRuntimes = (typeof VALID_RUNTIMES)[number]

// --- Main Function Types ---

/**
 * Base function resource with common properties for all function types
 * @category Functions Types
 */
interface BlueprintCommonFunctionResource extends BlueprintResource {
  /** Human-readable display name for the function */
  displayName?: string
  /** Path to the function source code */
  src: string
  /** Execution timeout in seconds */
  timeout?: number
  /** Memory allocation in gigabytes */
  memory?: number
  /** Environment variables provided to the function */
  env?: Record<string, string>
  /** Token provided during function invocation */
  robotToken?: string

  /**
   * The runtime environment for the function (currently only Node.js is supported)
   * @defaultValue 'nodejs24.x'
   */
  runtime?: FunctionRuntimes
}

/**
 * Base function resource with common properties for all function types that can belong to projects.
 * @category Functions Types
 */
export interface BlueprintBaseFunctionResource extends BlueprintCommonFunctionResource {
  /**
   * The project ID of the project that contains your function.
   *
   * The `project` attribute must be defined if your blueprint is scoped to an organization. */
  project?: string
}

/**
 * A function resource triggered by document events in Sanity datasets
 * @category Functions Types
 */
export interface BlueprintDocumentFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.document'
  /** Event configuration specifying when and how the function is triggered */
  event: BlueprintDocumentFunctionResourceEvent
}

/**
 * A function resource triggered by media library asset events
 * @category Functions Types
 */
export interface BlueprintMediaLibraryAssetFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.media-library.asset'
  /** Event configuration specifying when and how the function is triggered */
  event: BlueprintMediaLibraryFunctionResourceEvent
}

/**
 * A function resource triggered by scheduled events
 * @category Functions Types
 */
export interface BlueprintScheduledFunctionResource extends BlueprintCommonFunctionResource {
  type: 'sanity.function.cron'
  event: BlueprintScheduledFunctionResourceEvent
  timezone?: IanaTimezone
}

/**
 * A function resource triggered by sync tag invalidate events
 * @category Functions Types
 */
export interface BlueprintSyncTagInvalidateFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.sync-tag-invalidate'
  event?: BlueprintSyncTagInvalidateFunctionResourceEvent
}

/**
 * A function resource triggered by sync tag invalidate events
 * @category Functions Types
 * @alpha
 * @hidden
 */
export interface BlueprintQueueFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.queue'
  event?: BlueprintQueueFunctionResourceEvent
}

// --- Function Config Types ---

/**
 * Configuration for defining a base function.
 * @internal
 * @category Functions Types
 * @interface
 */
export type BlueprintBaseFunctionConfig = Omit<BlueprintBaseFunctionResource, 'type' | 'src'> & {
  /**
   * Path to the function source code
   * @defaultValue `functions/${name}`
   */
  src?: string
}

/**
 * Configuration for defining a document function.
 * @public
 * @category Functions Types
 * @interface
 */
export type BlueprintDocumentFunctionConfig = Omit<BlueprintDocumentFunctionResource, 'type' | 'src' | 'event'> & {
  /**
   * Path to the function source code
   * @defaultValue `functions/${name}`
   */
  src?: string
  /**
   * Event configuration specifying when and how the function is triggered
   * @defaultValue `{on: ['publish']}`
   */
  event?: BlueprintDocumentFunctionResourceEvent
}

/**
 * Configuration for defining a media library asset function.
 * @public
 * @category Functions Types
 * @interface
 */
export type BlueprintMediaLibraryAssetFunctionConfig = Omit<BlueprintMediaLibraryAssetFunctionResource, 'type' | 'src'> & {
  /**
   * Path to the function source code
   * @defaultValue `functions/${name}`
   */
  src?: string
}

/**
 * Configuration for defining a scheduled function.
 * @public
 * @alpha Deploying Scheduled Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Functions Types
 * @interface
 */
export type BlueprintScheduledFunctionConfig = Omit<BlueprintScheduledFunctionResource, 'type' | 'src' | 'event'> & {
  /**
   * Path to the function source code
   * @defaultValue `functions/${name}`
   */
  src?: string
  /**
   * Event configuration specifying when the function is triggered
   */
  event: BlueprintScheduledFunctionConfigEvent
}

/**
 * Configuration for defining a sync tag invalidate function.
 * @public
 * @alpha Deploying Sync Tag Invalidate Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Functions Types
 * @interface
 */
export type BlueprintSyncTagInvalidateFunctionConfig = Omit<BlueprintSyncTagInvalidateFunctionResource, 'type' | 'src'> & {
  /**
   * Path to the function source code
   * @defaultValue `functions/${name}`
   */
  src?: string
}

/**
 * Configuration for defining a queue function.
 * @public
 * @alpha Deploying Queue Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Functions Types
 * @interface
 */
export type BlueprintQueueFunctionConfig = Omit<BlueprintQueueFunctionResource, 'type' | 'src' | 'event'> & {
  /**
   * Path to the function source code
   * @defaultValue `functions/${name}`
   */
  src?: string
  /**
   * Queue configuration. Pass `true` or omit to use defaults (concurrency: 1, fifo: true, dlq: true),
   * or pass an object to override specific settings.
   * @defaultValue true
   */
  queue?: BlueprintQueueFunctionConfigEvent
}
