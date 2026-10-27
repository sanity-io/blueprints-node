import {type BlueprintDurableConfig, type BlueprintDurableFunctionResource, validateDurableFunction} from '../../index.js'
import {parseDuration} from '../../utils/parse-duration.js'
import {runValidation} from '../../utils/validation.js'
import {defineFunction} from './index.js'

/**
 * Defines a durable function resource.
 *
 * @remarks
 *
 * ```ts
 * defineDurableFunction({
 *   name: 'daily-cleanup',
 *   event: {type: 'document', on: ['create'], filter: "_type == 'post'"},
 * })
 * ```
 *
 * @param functionConfig The configuration for the function
 * @category Definers
 * @beta Deploying Durable Functions via Blueprints is experimental.
 * @public
 * @expandType BlueprintDurableConfig
 * @returns The validated durable function resource
 */
export function defineDurableFunction(functionConfig: BlueprintDurableConfig): BlueprintDurableFunctionResource {
  const {name, event, src, durableTimeout} = functionConfig
  const functionResource: BlueprintDurableFunctionResource = {
    ...defineFunction({...functionConfig, src: src ?? `functions/${name}`}, {skipValidation: true}),
    type: 'sanity.function.durable',
    ...(event !== undefined && {event}),
    ...(durableTimeout !== undefined && {durableTimeout: parseDuration(durableTimeout, 's')}),
    // TODO: eventually support queue fields once backend supports it
    // ...(concurrency !== undefined && {concurrency}),
    // ...(debounce !== undefined && {debounce: createDebounceObject(debounce)}),
  }

  runValidation(() => validateDurableFunction(functionResource))
  return functionResource
}
