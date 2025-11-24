import type {BlueprintResource} from '../index.js'

export interface BlueprintsApiConfig {
  organizationId: string
  projectId: string
  stackId: string
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

export type BlueprintModule = ((args?: unknown) => Blueprint) & {
  organizationId?: string
  projectId?: string
  stackId?: string
}
