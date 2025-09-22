export interface BlueprintResource {
  type: string
  name: string
}

export interface BlueprintFunctionResourceEvent {
  on?: [BlueprintFunctionResourceEventName, ...BlueprintFunctionResourceEventName[]]
  filter?: string
  includeDrafts?: boolean
  includeAllVersions?: boolean
  projection?: string
  /** @description The resource event source for function triggers. Only datasets are supported... for now. */
  resource?: BlueprintFunctionResourceEventResource
}

export type BlueprintFunctionResourceEventResource = BlueprintFunctionResourceEventResourceDataset
export interface BlueprintFunctionResourceEventResourceDataset {
  type: 'dataset'
  /** @description A dataset ID in the format <projectId>.<datasetName>. <datasetName> can be `*` to signify "all datasets in project with ID <projectId>." */
  id: string
}

type BlueprintFunctionResourceEventName = 'publish' | 'create' | 'delete' | 'update'

export interface BlueprintFunctionResource extends BlueprintResource {
  type: 'sanity.function.document'
  src: string
  event: BlueprintFunctionResourceEvent
  timeout?: number
  memory?: number
  env?: Record<string, string>
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
