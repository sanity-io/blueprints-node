import {type Blueprint, type BlueprintModule, type BlueprintsApiConfig, validateBlueprint} from '../index.js'
import {runValidation} from '../utils/validation.js'

/**
 * Define a Blueprint to manage Sanity resources
 * ```
 * defineBlueprint({
 *   resources: [
 *     // list of managed resources
 *   ]
 * })
 * ```
 * @param blueprintConfig The blueprint configuration
 * @returns A blueprint module
 */
export function defineBlueprint(blueprintConfig: Partial<Blueprint> & Partial<BlueprintsApiConfig>): BlueprintModule {
  const {organizationId, projectId, stackId, blueprintVersion, resources, values, outputs} = blueprintConfig

  runValidation(() => validateBlueprint(blueprintConfig))

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
