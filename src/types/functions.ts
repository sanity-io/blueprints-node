import type {BlueprintResource} from '../index.js'

// --- Function Event Types ---

/** Base event configuration shared by document and media library function types */
export interface BlueprintFunctionBaseResourceEvent {
  /** Event types that trigger the function. Defaults to ['publish'] */
  on?: [BlueprintFunctionResourceEventName, ...BlueprintFunctionResourceEventName[]]
  /** GROQ filter expression to match specific documents (e.g., "_type == 'post'") */
  filter?: string
  /** GROQ projection to specify which fields to include (e.g., "{_id, title, slug}") */
  projection?: `{${string}}`
  /** Include draft documents in addition to published documents */
  includeDrafts?: boolean
}
/** Event configuration for document functions */
export interface BlueprintDocumentFunctionResourceEvent extends BlueprintFunctionBaseResourceEvent {
  /** Include all versions of documents, not just the current version */
  includeAllVersions?: boolean
  /** Optional dataset resource scoping for the function */
  resource?: BlueprintFunctionResourceEventResourceDataset
}
/** Event configuration for media library asset functions */
export interface BlueprintMediaLibraryFunctionResourceEvent extends BlueprintFunctionBaseResourceEvent {
  /** Media library resource scoping (required for media library functions) */
  resource: BlueprintFunctionResourceEventResourceMediaLibrary
}
/** Union type of all function resource event configurations */
export type BlueprintFunctionResourceEvent = BlueprintDocumentFunctionResourceEvent | BlueprintMediaLibraryFunctionResourceEvent

/**
 * Dataset resource for scoping document functions to specific datasets
 * @example { type: 'dataset', id: 'my-project.production' }
 */
export interface BlueprintScheduleFunctionExplicitResourceEvent {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}
export interface BlueprintScheduleFunctionExpressionResourceEvent {
  expression: string
}
export type BlueprintScheduleFunctionResourceEvent =
  | BlueprintScheduleFunctionExplicitResourceEvent
  | BlueprintScheduleFunctionExpressionResourceEvent

interface BlueprintFunctionResourceEventResourceDataset {
  type: 'dataset'
  /** @description A dataset ID in the format <projectId>.<datasetName>. <datasetName> can be `*` to signify "all datasets in project with ID <projectId>." */
  id: string
}
/** Media library resource for scoping media library functions */
interface BlueprintFunctionResourceEventResourceMediaLibrary {
  type: 'media-library'
  id: string
}

/** Events that can trigger a function */
type BlueprintFunctionResourceEventName = 'publish' | 'create' | 'delete' | 'update'

// --- Main Function Types ---

/** Base function resource with common properties for all function types */
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
}
/** A function resource triggered by document events in Sanity datasets */
export interface BlueprintDocumentFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.document'
  /** Event configuration specifying when and how the function is triggered */
  event: BlueprintDocumentFunctionResourceEvent
}
/** A function resource triggered by media library asset events */
export interface BlueprintMediaLibraryAssetFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.media-library.asset'
  /** Event configuration specifying when and how the function is triggered */
  event: BlueprintMediaLibraryFunctionResourceEvent
}
export interface BlueprintScheduleFunctionResource extends BlueprintBaseFunctionResource {
  type: 'sanity.function.cron'
  event: BlueprintScheduleFunctionResourceEvent
  timezone?: string
}
