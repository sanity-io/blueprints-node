import {type BlueprintQueueFunctionConfig, type BlueprintQueueFunctionResource, validateQueueFunction} from '../../index.js'
import {createDebounceObject} from '../../utils/debounce.js'
import {createThrottleObject} from '../../utils/throttle.js'
import {runValidation} from '../../utils/validation.js'
import {defineFunction} from './index.js'
/**
 * Defines a function that provide queueing behaviour.
 *
 * @remarks
 * Using the reasonable defaults of concurrency: 1 and fifo: true.
 * Without `maxAttempts`, a failing message is redelivered until the queue's retention period expires.
 * ```ts
 * defineQueueFunction({
 *   name: 'send-email',
 * })
 * ```
 *
 * Specifying a concurrency of 5, and giving up on a message after 3 attempts
 * ```ts
 * defineQueueFunction({
 *   name: 'bustin-caches',
 *   concurrency: 5,
 *   fifo: true,
 *   maxAttempts: 3,
 * })
 * ```
 *
 * Starting at most 100 messages per minute, paced per tenant, with bursts of up to 10
 * ```ts
 * defineQueueFunction({
 *   name: 'call-rate-limited-api',
 *   throttle: {limit: 100, period: '1 minute', burst: 10, key: 'event.data.tenantId'},
 * })
 * ```
 * @public
 * @alpha Deploying Queue Functions via Blueprints is experimental. This feature is not available publicly yet.
 * @hidden
 * @category Definers
 * @expandType BlueprintQueueFunctionConfig
 * @param functionConfig The configuration for the queue function
 * @returns The validated queue function resource
 */
export function defineQueueFunction(functionConfig: BlueprintQueueFunctionConfig): BlueprintQueueFunctionResource {
  const {concurrency = 1, fifo = true, debounce, event, maxAttempts, throttle} = functionConfig

  const functionResource: BlueprintQueueFunctionResource = {
    ...defineFunction(functionConfig, {skipValidation: true}),
    type: 'sanity.function.queue',
    ...(concurrency !== undefined && {concurrency}),
    ...(debounce !== undefined && {debounce: createDebounceObject(debounce)}),
    ...(event !== undefined && {event}),
    ...(fifo !== undefined && {fifo}),
    ...(maxAttempts !== undefined && {maxAttempts}),
    ...(throttle !== undefined && {throttle: createThrottleObject(throttle)}),
  }

  runValidation(() => validateQueueFunction(functionResource))

  return functionResource
}
