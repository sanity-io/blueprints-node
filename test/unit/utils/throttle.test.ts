import {describe, expect, test} from 'vitest'
import type {ThrottleConfig} from '../../../src/index.js'
import {createThrottleObject} from '../../../src/utils/throttle.js'

describe('createThrottleObject', () => {
  test('leaves a numeric period as seconds', () => {
    expect(createThrottleObject({limit: 10, period: 60})).toEqual({limit: 10, period: 60})
  })

  test('parses a period duration string into seconds', () => {
    expect(createThrottleObject({limit: 10, period: '30s'})).toEqual({limit: 10, period: 30})
    expect(createThrottleObject({limit: 10, period: '1 minute'})).toEqual({limit: 10, period: 60})
    expect(createThrottleObject({limit: 10, period: '1h'})).toEqual({limit: 10, period: 3_600})
  })

  test('preserves burst and key', () => {
    expect(createThrottleObject({limit: 10, period: '1m', burst: 5, key: 'event.data.tenantId'})).toEqual({
      limit: 10,
      period: 60,
      burst: 5,
      key: 'event.data.tenantId',
    })
  })

  test('omits absent burst and key', () => {
    const result = createThrottleObject({limit: 10, period: 60})
    expect(result).not.toHaveProperty('burst')
    expect(result).not.toHaveProperty('key')
  })

  test('rejects an unparseable period', () => {
    expect(() => createThrottleObject({limit: 10, period: 'invalid'})).toThrow('Invalid duration: invalid')
  })

  test('rejects a config without a period', () => {
    // @ts-expect-error -- `period` is required, which is what we are asserting on
    expect(() => createThrottleObject({limit: 10})).toThrow('Invalid throttle config: `period` must be provided')
  })

  test('returns a config that satisfies the resource shape', () => {
    const throttle: ThrottleConfig = createThrottleObject({limit: 10, period: '1 minute'})
    expect(typeof throttle.period).toBe('number')
  })
})
