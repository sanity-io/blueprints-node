import {describe, expect, test} from 'vitest'
import {createDebounceObject} from '../../../src/utils/debounce.js'

describe('createDebounceObject', () => {
  test('wraps a number as a window in seconds', () => {
    expect(createDebounceObject(30)).toEqual({window: 30})
  })

  test('parses a duration string into a window in seconds', () => {
    expect(createDebounceObject('30s')).toEqual({window: 30})
    expect(createDebounceObject('5 minutes')).toEqual({window: 300})
  })

  test('passes a config object through unchanged', () => {
    const debounce = {window: 30, maxWindow: 300, key: 'event.data._id'}
    expect(createDebounceObject(debounce)).toEqual(debounce)
  })

  test('rejects an unparseable duration', () => {
    expect(() => createDebounceObject('invalid')).toThrow('Invalid duration: invalid')
  })
})
