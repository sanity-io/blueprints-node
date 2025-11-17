/**
 * The base type for all resources.
 */
export interface BlueprintResource {
  type: string
  name: string
}

/**
 * Represents a CORS Origin resource.
 */
export interface BlueprintCorsOriginResource extends BlueprintResource {
  type: 'sanity.project.cors'
  origin: string
  allowCredentials: boolean

  /** The `project` attribute must be defined if your blueprint is scoped to an organization. */
  project?: string
}

/** Configuration for a CORS Origin resource. */
export type BlueprintCorsOriginConfig = Omit<BlueprintCorsOriginResource, 'type' | 'allowCredentials'> & {
  allowCredentials?: boolean
}

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

export type WebhookTrigger = 'create' | 'update' | 'delete'
export interface BlueprintDocumentWebhookResource extends BlueprintResource {
  type: 'sanity.project.webhook'
  project?: string
  displayName?: string
  description?: string | null
  url: string
  on: WebhookTrigger[]
  filter?: string
  projection?: string
  status?: 'enabled' | 'disabled'
  httpMethod?: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'GET'
  headers?: Record<string, string>
  includeDrafts?: boolean
  includeAllVersions?: boolean
  secret?: string
  dataset?: string
  apiVersion?: string
}
export type BlueprintDocumentWebhookConfig = Omit<BlueprintDocumentWebhookResource, 'type'>

export type AclMode = 'public' | 'private' | 'custom'

/** Represents a Dataset resource. */
export interface BlueprintDatasetResource extends BlueprintResource {
  type: 'sanity.project.dataset'
  datasetName: string
  aclMode?: AclMode

  /** The `project` attribute must be defined if your blueprint is scoped to an organization. */
  project?: string
}

/** Configuration for a Dataset resource. */
export type BlueprintDatasetConfig = Omit<BlueprintDatasetResource, 'type' | 'datasetName'> & {
  /** The name of the dataset, defaults to the name of the resource. */
  datasetName?: string
}

export interface BlueprintOutput {
  name: string
  value: string
}

export interface Blueprint {
  $schema: string
  blueprintVersion: string
  resources?: BlueprintResource[]
  values?: Record<string, unknown>
  outputs?: BlueprintOutput[]
}

export interface BlueprintsApiConfig {
  organizationId: string
  projectId: string
  stackId: string
}

export type BlueprintModule = ((args?: unknown) => Blueprint) & {
  organizationId?: string
  projectId?: string
  stackId?: string
}
