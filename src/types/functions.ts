import type {BlueprintResource} from '../index.js'

// --- Function Event Types ---

/**
 * Base event configuration shared by document and media library function types
 * @category Functions Types
 */
export interface BlueprintFunctionBaseResourceEvent {
  /**
   * Event types that trigger the function
   * @defaultValue ['publish']
   */
  on?: [BlueprintFunctionResourceEventName, ...BlueprintFunctionResourceEventName[]]
  /** GROQ filter expression to match specific documents (e.g., "_type == 'post'") */
  filter?: string
  /** GROQ projection to specify which fields to include (e.g., "{_id, title, slug}") */
  projection?: `{${string}}`
  /** Include draft documents in addition to published documents */
  includeDrafts?: boolean
}

/**
 * Event configuration for document functions
 * @category Functions Types
 */
export interface BlueprintDocumentFunctionResourceEvent extends BlueprintFunctionBaseResourceEvent {
  /** Include all versions of documents, not just the current version */
  includeAllVersions?: boolean
  /** Optional dataset resource scoping for the function */
  resource?: BlueprintFunctionResourceEventResourceDataset
}

/**
 * Event configuration for media library asset functions
 * @category Functions Types
 */
export interface BlueprintMediaLibraryFunctionResourceEvent extends BlueprintFunctionBaseResourceEvent {
  /** Media library resource scoping (required for media library functions) */
  resource: BlueprintFunctionResourceEventResourceMediaLibrary
}

/**
 * Union type of all function resource event configurations
 * @category Functions Types
 */
export type BlueprintFunctionResourceEvent = BlueprintDocumentFunctionResourceEvent | BlueprintMediaLibraryFunctionResourceEvent

/**
 * Explicit resource event for schedule functions to specific minutes, hours, days of month, months, and days of week
 * @example { minute: '0', hour: '9', dayOfMonth: '1', month: '1', dayOfWeek: '1' }
 * @category Functions Types
 */
export interface BlueprintScheduleFunctionExplicitResourceEvent {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

/**
 * Expression resource for schedule functions to specific expressions
 * @example { expression: '0 9 * * *' }
 * @category Functions Types
 */
export interface BlueprintScheduleFunctionExpressionResourceEvent {
  expression: string
}

/**
 * Union type of all schedule function resource event configurations
 * @category Functions Types
 */
export type BlueprintScheduleFunctionResourceEvent =
  | BlueprintScheduleFunctionExplicitResourceEvent
  | BlueprintScheduleFunctionExpressionResourceEvent

/**
 * Dataset resource for scoping document functions to specific datasets
 * @example { type: 'dataset', id: 'my-project.production' }
 * @category Functions Types
 */
export interface BlueprintFunctionResourceEventResourceDataset {
  type: 'dataset'
  /** A dataset ID in the format <projectId>.<datasetName>. <datasetName> can be `*` to signify "all datasets in project with ID <projectId>." */
  id: string
}

/**
 * Media library resource for scoping media library functions
 * @category Functions Types
 */
export interface BlueprintFunctionResourceEventResourceMediaLibrary {
  type: 'media-library'
  id: string
}

/**
 * Events that can trigger a function
 * @category Functions Types
 */
export type BlueprintFunctionResourceEventName = 'publish' | 'create' | 'delete' | 'update'

/**
 * Current support Function runtimes
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
export interface BlueprintBaseFunctionResource extends BlueprintResource {
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
   * The project ID of the project that contains your function.
   *
   * The `project` attribute must be defined if your blueprint is scoped to an organization. */
  project?: string

  /**
   * The runtime environment for the function (currently only Node.js is supported)
   * @defaultValue 'nodejs24.x'
   */
  runtime?: FunctionRuntimes
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
 * A function resource triggered by schedule events
 * @category Functions Types
 */
export interface BlueprintScheduleFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.cron'
  event: BlueprintScheduleFunctionResourceEvent
  timezone?: string
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
 * Configuration for defining a schedule function.
 * @public
 * @alpha Deploying Schedule Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Functions Types
 * @interface
 */
export type BlueprintScheduleFunctionConfig = Omit<BlueprintScheduleFunctionResource, 'type' | 'src'> & {
  /**
   * Path to the function source code
   * @defaultValue `functions/${name}`
   */
  src?: string
}
