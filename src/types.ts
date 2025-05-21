export interface BlueprintResource {
  type: string
  name: string
}

export interface BlueprintFunctionResource extends BlueprintResource {
  type: 'sanity.function.document'
  src: string
  event: {
    on: string[]
    filter?: string
    projection?: string
  }
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
  resources: BlueprintResource[]
  values?: Record<string, any>
  outputs?: BlueprintOutput[]
}
