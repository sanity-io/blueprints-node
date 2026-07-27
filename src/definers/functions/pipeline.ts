import {type BlueprintPipelineConfig, type BlueprintPipelineResource, validatePipelineFunction} from '../../index.js'
import {runValidation} from '../../utils/validation.js'
import {defineFunction} from './index.js'

/**
 * Defines a pipeline function resource.
 *
 * @remarks
 *
 * ```ts
 * definePipeline({
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
 * @alpha Deploying Pipeline Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @public
 * @hidden
 * @expandType BlueprintPipelineConfig
 * @returns The validated pipeline function resource
 */
export function definePipeline(functionConfig: BlueprintPipelineConfig): BlueprintPipelineResource {
  const {name, event, concurrency, debounce, debounceKey, src} = functionConfig
  const functionResource: BlueprintPipelineResource = {
    ...defineFunction({...functionConfig, src: src ?? `functions/${name}`}, {skipValidation: true}),
    type: 'sanity.function.pipeline',
    ...(event !== undefined && {event}),
    ...(concurrency !== undefined && {concurrency}),
    ...(debounce !== undefined && {debounce}),
    ...(debounceKey !== undefined && {debounceKey}),
  }

  runValidation(() => validatePipelineFunction(functionResource))
  return functionResource
}
