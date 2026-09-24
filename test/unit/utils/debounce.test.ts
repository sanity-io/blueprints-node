import {describe, expect, test} from 'vitest'
import type {DebounceConfig} from '../../../src/index.js'
import {createDebounceObject} from '../../../src/utils/debounce.js'

describe('createDebounceObject', () => {
  test('wraps a number as a window in seconds', () => {
    expect(createDebounceObject(30)).toEqual({window: 30})
  })

  test('parses a duration string into a window in seconds', () => {
    expect(createDebounceObject('30s')).toEqual({window: 30})
    expect(createDebounceObject('5 minutes')).toEqual({window: 300})
  })

  test('leaves numeric config fields as they are', () => {
    const debounce = {window: 30, maxWindow: 300, key: 'event.data._id'}
    expect(createDebounceObject(debounce)).toEqual(debounce)
  })

  test('parses window and maxWindow durations inside a config', () => {
    expect(createDebounceObject({window: '5 minutes', maxWindow: '1 hour'})).toEqual({window: 300, maxWindow: 3_600})
  })

  test('parses a mix of durations and numbers inside a config', () => {
    expect(createDebounceObject({window: '30s', maxWindow: 300})).toEqual({window: 30, maxWindow: 300})
    expect(createDebounceObject({window: 30, maxWindow: '1h'})).toEqual({window: 30, maxWindow: 3_600})
  })

  test('preserves key and omits an absent maxWindow', () => {
    const result = createDebounceObject({window: '1m', key: 'event.data._id'})
    expect(result).toEqual({window: 60, key: 'event.data._id'})
    expect(result).not.toHaveProperty('maxWindow')
  })

  test('rejects an unparseable duration', () => {
    expect(() => createDebounceObject('invalid')).toThrow('Invalid duration: invalid')
    expect(() => createDebounceObject({window: 'invalid'})).toThrow('Invalid duration: invalid')
    expect(() => createDebounceObject({window: 30, maxWindow: 'invalid'})).toThrow('Invalid duration: invalid')
  })

  test('rejects a config without a window', () => {
    // @ts-expect-error -- `window` is required, which is what we are asserting on
    expect(() => createDebounceObject({maxWindow: 300})).toThrow('Invalid debounce config: `window` must be provided')
  })

  test('returns a config that satisfies the resource shape', () => {
    // the return type is the narrow resource shape, so these are numbers without narrowing
    const debounce: DebounceConfig = createDebounceObject({window: '5 minutes', maxWindow: '1 hour'})
    expect(typeof debounce.window).toBe('number')
    expect(typeof debounce.maxWindow).toBe('number')
  })
})
