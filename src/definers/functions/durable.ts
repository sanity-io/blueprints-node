import {type BlueprintDurableConfig, type BlueprintDurableFunctionResource, validateDurableFunction} from '../../index.js'
import {createDebounceObject} from '../../utils/debounce.js'
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
 *   concurrency: 5,
 *   debounce: 10,
 *   debounceKey: 'document._id',
 * })
 * ```
 *
 *
 * @param functionConfig The configuration for the function
 * @category Definers
 * @alpha Deploying Durable Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @public
 * @hidden
 * @expandType BlueprintDurableConfig
 * @returns The validated durable function resource
 */
export function defineDurableFunction(functionConfig: BlueprintDurableConfig): BlueprintDurableFunctionResource {
  const {name, event, concurrency, debounce, src, durableTimeout} = functionConfig
  const functionResource: BlueprintDurableFunctionResource = {
    ...defineFunction({...functionConfig, src: src ?? `functions/${name}`}, {skipValidation: true}),
    type: 'sanity.function.durable',
    ...(event !== undefined && {event}),
    ...(durableTimeout !== undefined && {durableTimeout: parseDuration(durableTimeout, 's')}),
    ...(concurrency !== undefined && {concurrency}),
    ...(debounce !== undefined && {debounce: createDebounceObject(debounce)}),
  }

  runValidation(() => validateDurableFunction(functionResource))
  return functionResource
}
