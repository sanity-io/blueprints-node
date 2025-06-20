export interface BlueprintResource {
  type: string
  name: string
}

export interface BlueprintFunctionResourceEvent {
  on: [BlueprintFunctionResourceEventName, ...BlueprintFunctionResourceEventName[]]
  filter?: string
  projection?: string
}

type BlueprintFunctionResourceEventName = 'publish'

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
