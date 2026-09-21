import {describe, expect, test} from 'vitest'
import {parseDuration} from '../../../src/utils/parse-duration.js'

describe('parseDuration', () => {
  test('returns numbers unchanged', () => {
    expect(parseDuration(60, 'ms')).toBe(60)
  })

  test('parses strings in the requested unit', () => {
    expect(parseDuration('1 hour', 's')).toBe(3_600)
    expect(parseDuration('1 hour', 'm')).toBe(60)
  })

  test('uses a 365-day year', () => {
    expect(parseDuration('1 year', 's')).toBe(31_536_000)
  })

  test('rejects invalid durations', () => {
    expect(() => parseDuration('invalid')).toThrow('Invalid duration: invalid')
  })
})
