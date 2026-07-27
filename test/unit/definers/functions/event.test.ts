import {afterEach, describe, expect, test, vi} from 'vitest'
import {defineEventFunction} from '../../../../src/definers/functions/event.js'
import * as index from '../../../../src/index.js'
import {defineBlueprintForResource} from '../../../helpers/index.js'

describe('defineEventFunction', () => {
  describe('happy paths', () => {
    test('should create a event function', () => {
      const fn = defineEventFunction({name: 'test'})
      expect(fn.type).toEqual('sanity.function.event')
      expect(fn).not.toHaveProperty('event')
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateEventFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateEventFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() => defineBlueprintForResource(defineEventFunction({name: 'test'}))).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
