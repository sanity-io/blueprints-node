import type {DebounceConfig, DebounceInput} from '../types/functions/index.js'
import {parseDuration} from './parse-duration.js'

/**
 * Normalizes the debounce config accepted by a definer into the shape held by a resource,
 * parsing any duration into seconds. A bare duration is shorthand for `{window: <duration>}`.
 * @param debounce The debounce config or duration to normalize
 * @internal
 * @returns The debounce config, with `window` and `maxWindow` in seconds
 */
export function createDebounceObject(debounce: DebounceInput): DebounceConfig {
  if (typeof debounce !== 'object') {
    return {window: parseDuration(debounce, 's')}
  }

  const {window, maxWindow, key} = debounce

  // `window` is required, so there is nothing sensible to parse without it
  if (window === undefined) {
    throw new Error('Invalid debounce config: `window` must be provided')
  }

  return {
    window: parseDuration(window, 's'),
    ...(maxWindow !== undefined && {maxWindow: parseDuration(maxWindow, 's')}),
    ...(key !== undefined && {key}),
  }
}
