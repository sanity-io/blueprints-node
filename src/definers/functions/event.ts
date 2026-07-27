import { type BlueprintEventFunctionConfig, type BlueprintEventFunctionResource, validateEventFunction } from '../../index.js'
import { runValidation } from '../../utils/validation.js'
import { defineFunction } from './index.js'

/**
 * Defines a function that provide event behaviour.
 *
 * @remarks
 * A barebones event function
 * ```ts
 * defineEventFunction({
 *   name: 'send-email',
 * })
 * ```
 * @public
 * @alpha Deploying Event Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Definers
 * @expandType BlueprintEventFunctionConfig
 * @param functionConfig The configuration for the event function
 * @returns The validated event function resource
 */
export function defineEventFunction(functionConfig: BlueprintEventFunctionConfig): BlueprintEventFunctionResource {
  const functionResource: BlueprintEventFunctionResource = {
    ...defineFunction(functionConfig, { skipValidation: true }),
    type: 'sanity.function.event',
  }

  runValidation(() => validateEventFunction(functionResource))

  return functionResource
}
