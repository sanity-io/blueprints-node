import type {BlueprintResource} from '../types.js'

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

export function defineBlueprint(blueprintConfig: Partial<Blueprint> & Partial<BlueprintsApiConfig>): BlueprintModule {
  const {organizationId, projectId, stackId, blueprintVersion, resources, values, outputs} = blueprintConfig

  if (resources && !Array.isArray(resources)) throw new Error('`resources` must be an array')

  function blueprint(): Blueprint {
    return {
      $schema: 'https://schemas.sanity.io/blueprints/v2024-10-01/blueprint.schema.json',
      blueprintVersion: blueprintVersion ?? '2024-10-01',
      resources,
      values,
      outputs,
    }
  }

  blueprint.organizationId = organizationId
  blueprint.projectId = projectId
  blueprint.stackId = stackId

  return blueprint
}
