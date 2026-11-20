import parse from 'parse-duration'
import type {BlueprintError} from '../types/errors.js'

type DurationUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'mo' | 'y'

const YEAR_IN_SEC = 31_536_000
const YEAR_IN_MS = YEAR_IN_SEC * 1000
const units = parse.unit as Record<string, number>

// Extend the units object because of the calculations of parse-duration of year to secs - `31557600000`
Object.assign(units, {
  year: YEAR_IN_MS,
  yr: YEAR_IN_MS,
  y: YEAR_IN_MS,

  month: YEAR_IN_MS / 12,
  mth: YEAR_IN_MS / 12,
  mo: YEAR_IN_MS / 12,

  week: YEAR_IN_MS / 52,
  wk: YEAR_IN_MS / 52,
  w: YEAR_IN_MS / 52,
})

/**
 * Small parse-duration wrapper for string or number
 * @param duration
 * @param unit
 * @return parsed number in the specified unit
 */
export function parseDuration(duration: string | number, unit: DurationUnit = 's'): number {
  const parsed = typeof duration === 'number' ? duration : parse(duration, unit)

  if (parsed === null || !Number.isFinite(parsed)) {
    throw new Error(`Invalid duration: ${duration}`)
  }

  return parsed
}

/**
 * Resolves a duration field, given either as a number of seconds or as a duration string, to seconds.
 * Unlike {@link parseDuration} this never throws, so validators can report the problem instead.
 * @param field The name of the field being resolved, used in error messages
 * @param value The value to resolve
 * @internal
 * @returns The value in seconds, or the errors that prevented it from being resolved
 */
export function resolveDuration(field: string, value: unknown): {seconds?: number; errors: BlueprintError[]} {
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
