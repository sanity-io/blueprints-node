import type {BlueprintResource} from '../index.js'

// --- Function Event Types ---

export interface BlueprintFunctionBaseResourceEvent {
  on?: [BlueprintFunctionResourceEventName, ...BlueprintFunctionResourceEventName[]]
  filter?: string
  projection?: `{${string}}`
  includeDrafts?: boolean
}
export interface BlueprintDocumentFunctionResourceEvent extends BlueprintFunctionBaseResourceEvent {
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

// --- Main Function Types ---

export interface BlueprintBaseFunctionResource extends BlueprintResource {
  displayName?: string
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
