import type {BlueprintError} from '../types/errors.js'
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

/**
 * Resolves a debounce duration, given either as a number of seconds or as a duration string, to seconds.
 * @param field The name of the field being resolved, used in error messages
 * @param value The value to resolve
 * @returns The value in seconds, or the errors that prevented it from being resolved
 */
export function resolveDebounceDuration(field: string, value: unknown): {seconds?: number; errors: BlueprintError[]} {
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? {seconds: value, errors: []}
      : {errors: [{type: 'invalid_value', message: `\`${field}\` must be a valid duration`}]}
  }

  if (typeof value === 'string') {
    try {
      return {seconds: parseDuration(value, 's'), errors: []}
    } catch {
      return {errors: [{type: 'invalid_value', message: `\`${field}\` must be a valid duration`}]}
    }
  }

  return {errors: [{type: 'invalid_type', message: `\`${field}\` must be a number of seconds or a duration string`}]}
}
