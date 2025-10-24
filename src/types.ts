export interface BlueprintResource {
  type: string
  name: string
}

export interface BlueprintFunctionBaseResourceEvent {
  on?: [BlueprintFunctionResourceEventName, ...BlueprintFunctionResourceEventName[]]
  filter?: string
  projection?: string
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
