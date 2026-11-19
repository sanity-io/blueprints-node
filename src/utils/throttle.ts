import type {ThrottleConfig, ThrottleConfigInput} from '../types/functions/index.js'
import {parseDuration} from './parse-duration.js'

/**
 * Normalizes the throttle config accepted by a definer into the shape held by a resource,
 * parsing `period` into seconds.
 * @param throttle The throttle config to normalize
 * @internal
 * @returns The throttle config, with `period` in seconds
 */
export function createThrottleObject(throttle: ThrottleConfigInput): ThrottleConfig {
  const {limit, period, burst, key} = throttle

  // `period` is required, so there is nothing sensible to parse without it
  if (period === undefined) {
    throw new Error('Invalid throttle config: `period` must be provided')
  }

  return {
    limit,
    period: parseDuration(period, 's'),
    ...(burst !== undefined && {burst}),
    ...(key !== undefined && {key}),
  }
}
