import {describe, expect, test} from 'vitest'
import {defineSyncTagInvalidateFunction} from '../../../../src/definers/functions/sync-tag-invalidate.js'

describe('defineSyncTagInvalidateFunction', () => {
  describe('happy paths', () => {
    test('should return function with event if one specified', () => {
      const event = {resource: {type: 'dataset' as const, id: 'some-dataset'}}
      const fn = defineSyncTagInvalidateFunction({name: 'nsync', event})
      expect(fn.event).toEqual(event)
    })
    test('should return function with empty event object if not specified', () => {
      const fn = defineSyncTagInvalidateFunction({name: 'nsync'})
      expect(fn.event).toBeUndefined()
    })
  })
})
